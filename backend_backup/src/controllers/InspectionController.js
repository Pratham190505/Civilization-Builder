const { 
  InspectionRepository, InspectionReportRepository, SchoolRepository, GeneratedReportRepository 
} = require('../repositories');
const reportService = require('../services/reportService');
const rankingService = require('../services/rankingService');
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

      // inspection_reports columns: id, report_code, inspection_request_id, inspector_id, findings, strengths, improvement_areas, recommendations, overall_rating, inspection_date, created_at
      const report = await InspectionReportRepository.create({
        report_code: `RPT-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`,
        inspection_request_id: requestId,
        inspector_id: inspectorId,
        inspection_date: scheduleDate
      });

      // Notify School
      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'INSPECTION_CREATED',
        title: 'Inspection Scheduled',
        message: `An inspection has been scheduled for your school on ${scheduleDate}.`,
        targetSchoolId: request.school_id
      });

      return res.status(200).json({
        success: true,
        message: 'Inspection scheduled successfully',
        data: report
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to schedule inspection', errors: [error.message] });
    }
  }

  async completeInspection(req, res) {
    try {
      const { reportId, score, feedback } = req.body;

      const report = await InspectionReportRepository.findById(reportId);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Inspection report not found', errors: [] });
      }

      const request = await InspectionRepository.findById(report.inspection_request_id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Associated inspection request not found', errors: [] });
      }

      // Update report outcomes
      await report.update({
        overall_rating: score,
        findings: feedback,
        inspection_date: new Date()
      });

      // Update parent request status
      await request.update({ status: 'COMPLETED' });

      // Generate PDF document and save URL
      const reportFileUrl = await reportService.generateInspectionPDF(report.id);

      // Trigger automatic score recalculation for school ranking
      await rankingService.recalculateSchoolScore(request.school_id);

      // Notify School Admin
      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'REPORT_READY',
        title: 'Inspection Completed & Report Ready',
        message: `Your school's inspection has been completed. Score: ${score}/100. PDF report is now accessible.`,
        targetSchoolId: request.school_id,
        link: reportFileUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Inspection completed, report generated and ranking updated.',
        data: {
          reportId: report.id,
          score,
          reportFileUrl
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
          include: ['District']
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

      const requests = await InspectionRepository.findAll({ where, include });
      return res.status(200).json({ success: true, message: 'Inspection requests fetched successfully', data: requests });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch inspection requests', errors: [error.message] });
    }
  }
}

module.exports = new InspectionController();
