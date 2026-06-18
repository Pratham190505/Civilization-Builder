const express = require('express');
const router = express.Router();
const MediaController = require('../controllers/MediaController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { checkSchoolScope } = require('../middleware/scope');
const { validate } = require('../middleware/validate');
const { mediaSubmitSchema, mediaReviewSchema, mediaApproveRejectSchema, mediaPublishSchema } = require('../validations/schemas');
const mediaStorage = require('../services/mediaStorageService');
const { auditLog } = require('../middleware/audit');

const upload = mediaStorage.getMulterMiddleware();

router.post('/upload', authenticate, upload.single('file'), auditLog('Media asset uploaded', 'MediaAsset', (req) => req.file?.originalname), MediaController.uploadMediaAsset);
router.post('/submit', authenticate, checkSchoolScope, validate(mediaSubmitSchema), auditLog('Media submitted', 'MediaSubmission', (req) => req.body.media_asset_id), MediaController.submitMediaSubmission);
router.post('/review', authenticate, authorize(['REVIEW_MEDIA']), validate(mediaReviewSchema), auditLog('Media reviewed', 'MediaSubmission', (req) => req.body.submission_id), MediaController.reviewMediaSubmission);
router.post('/approve', authenticate, authorize(['APPROVE_MEDIA']), validate(mediaApproveRejectSchema), auditLog('Media approved', 'MediaSubmission', (req) => req.body.submission_id), MediaController.approveMediaSubmission);
router.post('/reject', authenticate, authorize(['APPROVE_MEDIA']), validate(mediaApproveRejectSchema), auditLog('Media rejected', 'MediaSubmission', (req) => req.body.submission_id), MediaController.rejectMediaSubmission);
router.post('/publish', authenticate, authorize(['PUBLISH_MEDIA']), validate(mediaPublishSchema), auditLog('Media published to social platform', 'MediaSubmission', (req) => req.body.submission_id), MediaController.publishMediaSubmission);

router.get('/list', authenticate, MediaController.listMediaSubmissions);
router.get('/:id', authenticate, checkSchoolScope, MediaController.getMediaSubmissionDetail);

module.exports = router;
