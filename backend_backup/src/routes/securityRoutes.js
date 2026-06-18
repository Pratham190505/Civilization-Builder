const express = require('express');
const router = express.Router();
const SecurityController = require('../controllers/SecurityController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { impersonateSchema } = require('../validations/schemas');

router.get('/logs', authenticate, authorize(['VIEW_AUDIT_LOGS']), SecurityController.getAuditLogs);
router.post('/impersonation/start', authenticate, authorize(['MANAGE_SECURITY']), validate(impersonateSchema), SecurityController.startImpersonation);
router.post('/impersonation/end', authenticate, authorize(['MANAGE_SECURITY']), SecurityController.endImpersonation);

module.exports = router;
