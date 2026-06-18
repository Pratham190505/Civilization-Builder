const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, NotificationController.getNotifications);
router.patch('/read', authenticate, NotificationController.markAsRead);

module.exports = router;
