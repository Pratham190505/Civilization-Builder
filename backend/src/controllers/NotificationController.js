const { NotificationRecipientRepository, NotificationRepository } = require('../repositories');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const recipientId = req.user.id;
      const notifications = await NotificationRecipientRepository.findAll({
        where: { user_id: recipientId },
        include: [{ model: NotificationRepository.model }],
        order: [['id', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Notifications fetched successfully',
        data: notifications
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch notifications', errors: [error.message] });
    }
  }

  async markAsRead(req, res) {
    try {
      const recipientId = req.user.id;
      const { ids } = req.body; // array of recipient table row ids or notification_recipients ids

      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: 'Invalid payload: ids array is required', errors: [] });
      }

      await NotificationRecipientRepository.updateWhere(
        {
          id: ids,
          user_id: recipientId
        },
        {
          is_read: true,
          read_at: new Date()
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Notifications marked as read successfully',
        data: {}
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update notifications', errors: [error.message] });
    }
  }
}

module.exports = new NotificationController();
