const { 
  MediaRepository, MediaSubmissionRepository, MediaSubmissionVersionRepository,
  SubmissionReviewStepRepository, SubmissionReviewRepository, MediaPublicationRepository,
  SchoolRepository, MediaVersionAssetRepository
} = require('../repositories');
const { District } = require('../models');
const mediaStorage = require('../services/mediaStorageService');
const socialMediaService = require('../services/socialMediaService');
const notificationService = require('../services/notificationService');
const rankingService = require('../services/rankingService');
const logger = require('../config/logger');

class MediaController {
  async uploadMediaAsset(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded', errors: [] });
      }

      let schoolId = req.body.school_id;
      if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        schoolId = req.user.scope.schoolId;
      }

      if (!schoolId) {
        return res.status(400).json({ success: false, message: 'school_id is required', errors: [] });
      }

      const { School } = require('../models');
      const school = await School.findByPk(schoolId);
      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found' });
      }
      if (school.status !== 'APPROVED' || school.media_upload_enabled !== 1) {
        return res.status(400).json({ success: false, message: 'Media uploads are disabled for this school before inspection approval' });
      }
      if (!school.facebook_url || !school.instagram_url || !school.youtube_url) {
        return res.status(400).json({ success: false, message: 'Please complete your Facebook, Instagram, and YouTube details before uploading media content' });
      }

      const uploadResult = await mediaStorage.uploadFile(file);

      // media_assets columns: id, asset_code, file_name, file_path, file_type, file_size, uploaded_by, uploaded_at
      const asset = await MediaRepository.create({
        asset_code: `AST-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`,
        file_name: file.originalname || uploadResult.fileName,
        file_path: uploadResult.fileUrl || uploadResult.filePath,
        file_type: file.mimetype || uploadResult.fileType,
        file_size: file.size || uploadResult.fileSize,
        uploaded_by: req.user.id
      });

      // Keep response format success, message, data
      return res.status(201).json({
        success: true,
        message: 'Media asset uploaded successfully',
        data: asset
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Upload asset failed', errors: [error.message] });
    }
  }

  async submitMediaSubmission(req, res) {
    try {
      const { media_asset_id, title, description } = req.body;

      let schoolId = req.body.school_id;
      if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        schoolId = req.user.scope.schoolId;
      }

      if (!schoolId) {
        return res.status(400).json({ success: false, message: 'school_id is required', errors: [] });
      }

      const asset = await MediaRepository.findById(media_asset_id);
      if (!asset) {
        return res.status(404).json({ success: false, message: 'Media asset not found', errors: [] });
      }

      const school = await SchoolRepository.findOne({
        where: { id: schoolId },
        include: [{ model: District }]
      });

      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found' });
      }
      if (school.status !== 'APPROVED' || school.media_upload_enabled !== 1) {
        return res.status(400).json({ success: false, message: 'Media uploads are disabled for this school before inspection approval' });
      }
      if (!school.facebook_url || !school.instagram_url || !school.youtube_url) {
        return res.status(400).json({ success: false, message: 'Please complete your Facebook, Instagram, and YouTube details before uploading media content' });
      }

      // Create Submission
      // media_submissions columns: id, submission_code, school_id, title, description, status, submitted_by, submitted_at, created_at
      const submission = await MediaSubmissionRepository.create({
        submission_code: `SUB-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`,
        school_id: schoolId,
        title,
        description,
        status: 'SUBMITTED',
        submitted_by: req.user.id,
        submitted_at: new Date()
      });

      // Create Version 1
      // media_submission_versions columns: id, submission_id, version_no, version_notes, created_by, created_at
      const version = await MediaSubmissionVersionRepository.create({
        submission_id: submission.id,
        version_no: 1,
        version_notes: 'Initial upload version',
        created_by: req.user.id
      });

      // Map version to asset in join table
      // media_version_assets columns: id, version_id, asset_id
      await MediaVersionAssetRepository.create({
        version_id: version.id,
        asset_id: media_asset_id
      });

      // Create Review Step (Super Admin Review directly)
      await SubmissionReviewStepRepository.create({
        submission_id: submission.id,
        step_name: 'SUPER_ADMIN_REVIEW',
        step_order: 1,
        status: 'PENDING'
      });

      // Notify Super Admin directly
      try {
        await notificationService.sendNotification({
          senderId: req.user.id,
          type: 'MEDIA_APPROVED',
          title: 'New Media Submission Awaiting Review',
          message: `A new media post "${title}" has been submitted by ${school?.school_name || 'School'}.`,
          targetRole: 'SUPER_ADMIN'
        });
      } catch (notifErr) {
        console.warn('Failed to send notification to Super Admin:', notifErr);
      }

      return res.status(201).json({
        success: true,
        message: 'Media submitted for final review',
        data: submission
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Submission failed', errors: [error.message] });
    }
  }

  async reviewMediaSubmission(req, res) {
    try {
      return res.status(403).json({ success: false, message: 'Forbidden: Regional Admin cannot review or approve/reject media directly.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Review processing failed', errors: [error.message] });
    }
  }

  async approveMediaSubmission(req, res) {
    try {
      const { submission_id, comments, is_featured } = req.body;
      const submission = await MediaSubmissionRepository.findById(submission_id);
      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found', errors: [] });

      const step = await SubmissionReviewStepRepository.findOne({
        where: { submission_id, step_name: 'SUPER_ADMIN_REVIEW', status: 'PENDING' }
      });

      if (step) {
        await step.update({
          status: 'APPROVED',
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
          remarks: comments || 'Final approval granted'
        });
      }

      await submission.update({ status: 'SUPER_APPROVED', is_featured: is_featured ? 1 : 0 }); // Rule says: SUBMITTED -> APPROVED

      // Recalculate ranking immediately - BYPASSED for manual inspection workflow

      // Save overall review record
      await SubmissionReviewRepository.create({
        submission_id,
        reviewer_id: req.user.id,
        review_type: 'SUPER',
        decision: 'APPROVED',
        comments: comments || 'Final approval granted.',
        reviewed_at: new Date()
      });

      // Fetch school and state ID for regional admin notification
      const school = await SchoolRepository.findOne({
        where: { id: submission.school_id },
        include: [{ model: District }]
      });
      const stateId = school?.District?.state_id || null;

      // 1. Notify school admin
      try {
        await notificationService.sendNotification({
          senderId: req.user.id,
          type: 'MEDIA_APPROVED',
          title: 'Media Approved',
          message: `Your media has been approved.`,
          targetSchoolId: submission.school_id,
          targetRole: 'SCHOOL_ADMIN'
        });
      } catch (notifErr) {
        console.warn('Failed to send notification to school admin:', notifErr);
      }

      // 2. Notify regional admin
      if (stateId) {
        try {
          await notificationService.sendNotification({
            senderId: req.user.id,
            type: 'MEDIA_APPROVED',
            title: 'Regional Media Approved',
            message: `Media from your region has been approved.`,
            targetRole: 'REGIONAL_ADMIN',
            targetStateId: stateId
          });
        } catch (notifErr) {
          console.warn('Failed to send notification to regional admin:', notifErr);
        }
      }

      return res.status(200).json({ success: true, message: 'Final approval granted. Media approved.', data: submission });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Final approval failed', errors: [error.message] });
    }
  }

  async rejectMediaSubmission(req, res) {
    try {
      const { submission_id, comments } = req.body;
      const submission = await MediaSubmissionRepository.findById(submission_id);
      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found', errors: [] });

      const step = await SubmissionReviewStepRepository.findOne({
        where: { submission_id, step_name: 'SUPER_ADMIN_REVIEW', status: 'PENDING' }
      });

      if (step) {
        await step.update({
          status: 'REJECTED',
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
          remarks: comments || 'Final approval rejected'
        });
      }

      await submission.update({ status: 'REJECTED' }); // Rule says: SUBMITTED -> REJECTED

      // Recalculate ranking immediately (in case previously approved) - BYPASSED for manual inspection workflow

      await SubmissionReviewRepository.create({
        submission_id,
        reviewer_id: req.user.id,
        review_type: 'SUPER',
        decision: 'REJECTED',
        comments: comments || 'Final approval denied.',
        reviewed_at: new Date()
      });

      // Fetch school and state ID for regional admin notification
      const school = await SchoolRepository.findOne({
        where: { id: submission.school_id },
        include: [{ model: District }]
      });
      const stateId = school?.District?.state_id || null;

      // 1. Notify school admin
      try {
        await notificationService.sendNotification({
          senderId: req.user.id,
          type: 'MEDIA_REJECTED',
          title: 'Media Rejected',
          message: `Your media has been rejected.`,
          targetSchoolId: submission.school_id,
          targetRole: 'SCHOOL_ADMIN'
        });
      } catch (notifErr) {
        console.warn('Failed to send notification to school admin:', notifErr);
      }

      // 2. Notify regional admin
      if (stateId) {
        try {
          await notificationService.sendNotification({
            senderId: req.user.id,
            type: 'MEDIA_REJECTED',
            title: 'Regional Media Rejected',
            message: `Media from your region has been rejected.`,
            targetRole: 'REGIONAL_ADMIN',
            targetStateId: stateId
          });
        } catch (notifErr) {
          console.warn('Failed to send notification to regional admin:', notifErr);
        }
      }

      return res.status(200).json({ success: true, message: 'Submission rejected successfully', data: submission });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Rejection failed', errors: [error.message] });
    }
  }

  async publishMediaSubmission(req, res) {
    try {
      const { submission_id, platforms } = req.body;
      
      // Load submission and versions/assets
      const submission = await MediaSubmissionRepository.findById(submission_id, {
        include: [{
          model: MediaSubmissionVersionRepository.model,
          include: [MediaRepository.model]
        }]
      });

      if (!submission || (submission.status !== 'SUPER_APPROVED' && submission.status !== 'APPROVED')) {
        return res.status(400).json({ success: false, message: 'Submission must be APPROVED or SUPER_APPROVED before publishing', errors: [] });
      }

      // Resolve asset from first version
      const activeVersion = submission.MediaSubmissionVersions?.[0];
      const mediaAsset = activeVersion?.MediaAssets?.[0];

      if (!mediaAsset) {
        return res.status(400).json({ success: false, message: 'No media asset mapped to this submission version', errors: [] });
      }

      const publishResults = [];
      for (const platform of platforms) {
        try {
          const result = await socialMediaService.publishApprovedMedia(
            submission.school_id,
            platform,
            mediaAsset.file_path,
            `${submission.title}\n\n${submission.description || ''}`
          );

          // media_publications columns: id, submission_id, published_by, published_at, publication_url
          await MediaPublicationRepository.create({
            submission_id,
            published_by: req.user.id,
            published_at: new Date(),
            publication_url: result.postUrl || ''
          });

          publishResults.push({ platform, success: true, url: result.postUrl || '' });
        } catch (err) {
          logger.error(`Failed to publish to ${platform}: %s`, err.message);
          publishResults.push({ platform, success: false, error: err.message });
        }
      }

      await submission.update({ status: 'PUBLISHED' });

      return res.status(200).json({
        success: true,
        message: 'Publishing operations complete',
        data: {
          submissionId: submission.id,
          results: publishResults
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Publish execution failed', errors: [error.message] });
    }
  }

  async listMediaSubmissions(req, res) {
    try {
      const { status } = req.query;
      const where = {};
      if (status) where.status = status;

      // In actual DB, assets are loaded via media_submission_versions -> media_version_assets -> media_assets
      const include = [
        {
          model: MediaSubmissionVersionRepository.model,
          include: [MediaRepository.model]
        },
        {
          model: SchoolRepository.model,
          include: ['District']
        }
      ];

      // Enforce Regional Admin state scoping limits
      if (req.user.rolesList.includes('REGIONAL_ADMIN')) {
        include[1].include = [{
          association: 'District',
          where: { state_id: req.user.scope.stateIds }
        }];
      }

      // Enforce District Admin scoping limits
      if (req.user.rolesList.includes('DISTRICT_ADMIN')) {
        const { School } = require('../models');
        const { Op } = require('sequelize');
        const districtSchoolIds = await School.findAll({
          where: { district_id: req.user.scope.districtId },
          attributes: ['id']
        }).then(schools => schools.map(s => s.id));
        
        where.school_id = { [Op.in]: districtSchoolIds.length > 0 ? districtSchoolIds : [0] };
      }

      // Enforce School Admin scoping limits
      if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        where.school_id = req.user.scope.schoolId;
      }

      const submissions = await MediaSubmissionRepository.findAll({ where, include });
      return res.status(200).json({ success: true, message: 'Submissions list fetched successfully', data: submissions });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'List submissions failed', errors: [error.message] });
    }
  }

  async getMediaSubmissionDetail(req, res) {
    try {
      const submission = await MediaSubmissionRepository.findById(req.params.id, {
        include: [
          {
            model: MediaSubmissionVersionRepository.model,
            include: [MediaRepository.model]
          },
          { model: SubmissionReviewStepRepository.model },
          { model: SubmissionReviewRepository.model },
          { model: MediaPublicationRepository.model }
        ]
      });

      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found', errors: [] });
      return res.status(200).json({ success: true, message: 'Submission detail fetched successfully', data: submission });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Get submission failed', errors: [error.message] });
    }
  }
}

module.exports = new MediaController();
