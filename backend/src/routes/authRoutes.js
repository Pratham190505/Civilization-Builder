const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, refreshSchema, signupSchema, changePasswordSchema } = require('../validations/schemas');
const { auditLog } = require('../middleware/audit');

router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/login', validate(loginSchema), auditLog('User login', 'User', (req) => req.body.email), AuthController.login);
router.post('/logout', validate(refreshSchema), AuthController.logout);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

module.exports = router;
