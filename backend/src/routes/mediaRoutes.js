const express = require('express');
const router = express.Router();
const MediaController = require('../controllers/MediaController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { mediaSubmitSchema, mediaReviewSchema, mediaApproveRejectSchema, mediaPublishSchema } = require('../validations/schemas');
const mediaStorage = require('../services/mediaStorageService');
const { auditLog } = require('../middleware/audit');

const upload = mediaStorage.getMulterMiddleware();

// Multer error handler wrapper
const uploadSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Handle multer-specific errors
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
        errors: [err.message]
      });
    }
    next();
  });
};

router.post('/upload', authenticate, uploadSingle, auditLog('Media asset uploaded', 'MediaAsset', (req) => req.file?.originalname), MediaController.uploadMediaAsset);
router.post('/submit', authenticate, validate(mediaSubmitSchema), auditLog('Media submitted', 'MediaSubmission', (req) => req.body.media_asset_id), MediaController.submitMediaSubmission);
router.post('/review', authenticate, authorize(['REVIEW_MEDIA']), validate(mediaReviewSchema), auditLog('Media reviewed', 'MediaSubmission', (req) => req.body.submission_id), MediaController.reviewMediaSubmission);
router.post('/approve', authenticate, authorize(['APPROVE_MEDIA']), validate(mediaApproveRejectSchema), auditLog('Media approved', 'MediaSubmission', (req) => req.body.submission_id), MediaController.approveMediaSubmission);
router.post('/reject', authenticate, authorize(['APPROVE_MEDIA']), validate(mediaApproveRejectSchema), auditLog('Media rejected', 'MediaSubmission', (req) => req.body.submission_id), MediaController.rejectMediaSubmission);
router.post('/publish', authenticate, authorize(['PUBLISH_MEDIA']), validate(mediaPublishSchema), auditLog('Media published to social platform', 'MediaSubmission', (req) => req.body.submission_id), MediaController.publishMediaSubmission);

router.get('/list', authenticate, MediaController.listMediaSubmissions);
router.get('/:id', authenticate, MediaController.getMediaSubmissionDetail);

module.exports = router;
