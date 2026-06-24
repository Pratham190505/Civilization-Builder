const express = require('express');
const router = express.Router();
const RankingController = require('../controllers/RankingController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { checkSchoolScope, checkStateScope } = require('../middleware/scope');
const { auditLog } = require('../middleware/audit');

router.get('/tiers', authenticate, RankingController.getTiers);
router.get('/', authenticate, RankingController.getRankings);
router.get('/state/:id', authenticate, checkStateScope, RankingController.getStateRankings);
router.get('/school/:id', authenticate, checkSchoolScope, RankingController.getSchoolRanking);
router.post('/recalculate', authenticate, authorize(['RECALCULATE_RANKINGS']), auditLog('Rankings recalculated', 'System', () => 0), RankingController.recalculateRankings);

module.exports = router;
