const { 
  InspectionRepository, InspectionReportRepository, SchoolRepository, GeneratedReportRepository 
} = require('../repositories');
const reportService = require('../services/reportService');
const notificationService = require('../services/notificationService');

class InspectionController {
  async requestInspection(req, res) {
    try {
      let schoolId = req.body.school_id;
      if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        schoolId = req.user.scope.schoolId;
      }

      if (!schoolId) {
        return res.status(400).json({ success: false, message: 'school_id is required', errors: [] });
      }

      // inspection_requests columns: id, request_code, school_id, requested_by, request_reason, status, requested_at, created_at
      const request = await InspectionRepository.create({
        request_code: `REQ-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`,
        school_id: schoolId,
        requested_by: req.user.id,
        status: 'PENDING',
        request_reason: req.body.comments || req.body.request_reason || 'Regular inspection request',
        requested_at: req.body.preferred_date ? new Date(req.body.preferred_date) : new Date()
      });

      // Notify Regional Admins
      const school = await SchoolRepository.findById(schoolId);
      const district = school ? await school.getDistrict() : null;
      const stateId = district ? district.state_id : null;

      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'INSPECTION_CREATED',
        title: 'New Inspection Request',
        message: `School "${school?.school_name || 'School'}" has requested an inspection.`,
        targetRole: 'REGIONAL_ADMIN',
        targetStateId: stateId
      });

      return res.status(201).json({
        success: true,
        message: 'Inspection request submitted successfully',
        data: request
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to request inspection', errors: [error.message] });
    }
  }

  async scheduleInspection(req, res) {
    try {
      const { requestId, inspectorId, scheduleDate } = req.body;

      const request = await InspectionRepository.findById(requestId);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Inspection request not found', errors: [] });
      }

      await request.update({ status: 'SCHEDULED' });

      // Check if inspection report already exists
      const existingReport = await InspectionReportRepository.findOne({
        where: { inspection_request_id: requestId }
      });

      let report;
      let isRescheduled = false;

      if (existingReport) {
        report = await existingReport.update({
          inspector_id: inspectorId,
          inspection_date: scheduleDate
        });
        isRescheduled = true;
      } else {
        report = await InspectionReportRepository.create({
          report_code: `RPT-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`,
          inspection_request_id: requestId,
          inspector_id: inspectorId,
          inspection_date: scheduleDate
        });
      }

      // Dynamic date formatting helper
      const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formattedDate = formatDate(scheduleDate);

      // Log inspection scheduled
      const { logSchoolEvent } = require('../utils/schoolLogger');
      await logSchoolEvent(
        request.school_id,
        'INSPECTION_SCHEDULED',
        isRescheduled 
          ? `Inspection rescheduled to date: ${formattedDate}. Inspector ID: ${inspectorId}.`
          : `Inspection scheduled for date: ${formattedDate}. Inspector ID: ${inspectorId}.`,
        req.user.id
      );

      // Notify School
      await notificationService.sendNotification({
        senderId: req.user.id,
        type: isRescheduled ? 'INSPECTION_UPDATED' : 'INSPECTION_CREATED',
        title: isRescheduled ? 'Inspection Rescheduled' : 'Inspection Scheduled',
        message: isRescheduled
          ? `Your school inspection date has been updated to ${formattedDate}.`
          : `Your school inspection has been scheduled for ${formattedDate}.`,
        targetSchoolId: request.school_id
      });

      return res.status(200).json({
        success: true,
        message: isRescheduled ? 'Inspection rescheduled successfully' : 'Inspection scheduled successfully',
        data: report
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to schedule inspection', errors: [error.message] });
    }
  }

  async completeInspection(req, res) {
    try {
      const { reportId, academic_score, achievement_score, media_score, participation_score, feedback } = req.body;
      const reportFilePath = req.file ? `/uploads/${req.file.filename}` : null;

      const report = await InspectionReportRepository.findById(reportId);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Inspection report not found', errors: [] });
      }

      const request = await InspectionRepository.findById(report.inspection_request_id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Associated inspection request not found', errors: [] });
      }

      const academic = parseInt(academic_score || 0, 10);
      const achievement = parseInt(achievement_score || 0, 10);
      const media = parseInt(media_score || 0, 10);
      const participation = parseInt(participation_score || 0, 10);
      const totalScore = academic + achievement + media + participation;

      if (totalScore === 0) {
        return res.status(400).json({
          success: false,
          message: 'Inspection score cannot be zero. Please assign a valid score.',
          errors: ['Total score must be greater than zero.']
        });
      }

      // Update report outcomes
      await report.update({
        overall_rating: totalScore,
        findings: feedback,
        inspection_date: new Date(),
        report_file_path: reportFilePath
      });

      // Update parent request status
      await request.update({ status: 'COMPLETED' });

      // Look up matching RankTier from database
      const { RankTier, School, SchoolInspectionAudit, SchoolRankSnapshot, SchoolScorePeriod } = require('../models');
      const { Op } = require('sequelize');
      
      const matchingTier = await RankTier.findOne({
        where: {
          min_score: { [Op.lte]: totalScore },
          max_score: { [Op.gte]: totalScore }
        }
      });

      const tierName = matchingTier ? matchingTier.tier_name : 'No Rank';
      const tierId = matchingTier ? matchingTier.id : null;

      // Update school details
      const school = await School.findByPk(request.school_id);
      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found' });
      }

      await school.update({
        status: 'APPROVED',
        inspection_status: 'COMPLETED',
        media_upload_enabled: 1,
        academic_score: academic,
        achievement_score: achievement,
        media_score: media,
        participation_score: participation,
        total_score: totalScore,
        score: totalScore,
        approved_by: req.user.id,
        approved_at: new Date()
      });

      // Recalculate school ranking and tier
      try {
        const rankingService = require('../services/rankingService');
        await rankingService.recalculateSchoolScore(school.id);
        await rankingService.recalculateAllRankings();
      } catch (rankErr) {
        console.error('Failed to recalculate school rankings after inspection:', rankErr);
      }

      // Create school inspection audit record
      await SchoolInspectionAudit.create({
        school_id: request.school_id,
        assigned_score: totalScore,
        academic_score: academic,
        achievement_score: achievement,
        media_score: media,
        participation_score: participation,
        total_score: totalScore,
        assigned_rank_tier: tierName,
        inspection_report_path: reportFilePath,
        inspection_date: new Date(),
        assigned_by: req.user.id
      });

      // Log inspection completed & school ranked
      const { logSchoolEvent } = require('../utils/schoolLogger');
      await logSchoolEvent(
        request.school_id,
        'INSPECTION_COMPLETED',
        `Inspection completed for School '${school.school_name}'. Inspector ID: ${req.user.id}. Overall Rating: ${req.body.overall_rating || totalScore}.`,
        req.user.id
      );

      // Format notification message
      const notificationMsg = `Congratulations!\n\nYour school has successfully completed the inspection process.\n\nAssigned Score: ${totalScore} / 1000\n\nAssigned Rank: ${tierName}\n\nYour school profile has been approved successfully.\n\nYou can now access:\n✓ Photo Uploads\n✓ Video Uploads\n✓ Reel Uploads\n✓ Activity Uploads\n✓ Document Uploads\n\nPlease complete your Facebook, Instagram, and YouTube information before uploading media content.`;

      // Notify School Admin
      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'REPORT_READY',
        title: 'Inspection Completed & Report Ready',
        message: notificationMsg,
        targetSchoolId: request.school_id,
        link: reportFilePath
      });

      return res.status(200).json({
        success: true,
        message: 'Inspection completed, report generated and ranking updated.',
        data: {
          reportId: report.id,
          score: totalScore,
          tierName,
          reportFilePath
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to complete inspection', errors: [error.message] });
    }
  }

  async getInspectionReports(req, res) {
    try {
      const reports = await GeneratedReportRepository.findAll({
        where: { report_type: 'INSPECTION' },
        order: [['generated_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Inspection reports fetched successfully',
        data: reports
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch reports', errors: [error.message] });
    }
  }

  async getInspectionRequests(req, res) {
    try {
      const include = [
        {
          model: SchoolRepository.model,
          include: [{
            model: require('../models').District,
            include: [require('../models').State]
          }]
        },
        {
          model: InspectionReportRepository.model
        }
      ];

      if (req.user.rolesList.includes('REGIONAL_ADMIN')) {
        include[0].include = [{
          association: 'District',
          where: { state_id: req.user.scope.stateIds }
        }];
      }

      const where = {};
      if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        where.school_id = req.user.scope.schoolId;
      }

      if (req.user.rolesList.includes('DISTRICT_ADMIN')) {
        const { School } = require('../models');
        const { Op } = require('sequelize');
        const districtSchoolIds = await School.findAll({
          where: { district_id: req.user.scope.districtId },
          attributes: ['id']
        }).then(schools => schools.map(s => s.id));
        
        where.school_id = { [Op.in]: districtSchoolIds.length > 0 ? districtSchoolIds : [0] };
      }

      const requests = await InspectionRepository.findAll({ where, include });
      return res.status(200).json({ success: true, message: 'Inspection requests fetched successfully', data: requests });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch inspection requests', errors: [error.message] });
    }
  }
}

module.exports = new InspectionController();
