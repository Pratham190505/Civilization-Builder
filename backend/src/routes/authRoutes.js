const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, refreshSchema } = require('../validations/schemas');
const { auditLog } = require('../middleware/audit');

router.post('/login', validate(loginSchema), auditLog('User login', 'User', (req) => req.body.email), AuthController.login);
router.post('/logout', validate(refreshSchema), AuthController.logout);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/change-password', authenticate, AuthController.changePassword);
router.post('/signup', AuthController.signup);

module.exports = router;
