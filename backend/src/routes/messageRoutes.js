const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const { authenticate } = require('../middleware/auth');

router.get('/conversations', authenticate, MessageController.getConversations);
router.post('/conversations', authenticate, MessageController.getOrCreateConversation);
router.get('/:conversationId', authenticate, MessageController.getMessages);
router.post('/', authenticate, MessageController.sendMessage);

module.exports = router;
