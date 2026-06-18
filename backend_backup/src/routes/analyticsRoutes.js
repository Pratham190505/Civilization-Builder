const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { checkSchoolScope, checkStateScope } = require('../middleware/scope');

router.get('/national', authenticate, authorize(['VIEW_ANALYTICS']), AnalyticsController.getNationalAnalytics);
router.get('/state/:id', authenticate, checkStateScope, AnalyticsController.getStateAnalytics);
router.get('/school/:id', authenticate, checkSchoolScope, AnalyticsController.getSchoolAnalytics);

module.exports = router;
