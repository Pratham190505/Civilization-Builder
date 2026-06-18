const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/RecommendationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { checkSchoolScope } = require('../middleware/scope');
const { validate } = require('../middleware/validate');
const { recommendationSchema } = require('../validations/schemas');
const { auditLog } = require('../middleware/audit');

router.post('/', authenticate, authorize(['MANAGE_RECOMMENDATIONS']), validate(recommendationSchema), auditLog('Recommendation created', 'SchoolRecommendation', (req) => req.body.school_id), RecommendationController.createRecommendation);
router.post('/:id/accept', authenticate, checkSchoolScope, auditLog('Recommendation accepted', 'SchoolRecommendation'), RecommendationController.acceptRecommendation);
router.post('/:id/reject', authenticate, checkSchoolScope, auditLog('Recommendation rejected', 'SchoolRecommendation'), RecommendationController.rejectRecommendation);
router.get('/history/:schoolId', authenticate, checkSchoolScope, RecommendationController.getRecommendationHistory);

module.exports = router;
