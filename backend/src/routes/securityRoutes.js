const express = require('express');
const router = express.Router();
const SecurityController = require('../controllers/SecurityController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { impersonateSchema } = require('../validations/schemas');

router.get('/logs', authenticate, authorize(['VIEW_AUDIT_LOGS']), SecurityController.getAuditLogs);
router.get('/search', authenticate, SecurityController.searchAll);
router.post('/impersonation/start', authenticate, authorize(['MANAGE_SECURITY']), validate(impersonateSchema), SecurityController.startImpersonation);
router.post('/impersonation/end', authenticate, authorize(['MANAGE_SECURITY']), SecurityController.endImpersonation);

// Regional Admin CRUD paths (accessible by SUPER_ADMIN bypass or MANAGE_SECURITY permission)
router.get('/admins', authenticate, authorize(['MANAGE_SECURITY']), SecurityController.getRegionalAdmins);
router.post('/admins', authenticate, authorize(['MANAGE_SECURITY']), SecurityController.createRegionalAdmin);
router.put('/admins/:id', authenticate, authorize(['MANAGE_SECURITY']), SecurityController.updateRegionalAdmin);
router.delete('/admins/:id', authenticate, authorize(['MANAGE_SECURITY']), SecurityController.deleteRegionalAdmin);

module.exports = router;
