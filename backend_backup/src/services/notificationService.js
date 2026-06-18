const { Notification, NotificationRecipient, UserNotificationPreference, User, SchoolAdminMapping, RegionalAdminScope, Role } = require('../models');
const EventEmitter = require('events');
const logger = require('../config/logger');

class NotificationService extends EventEmitter {
  async sendNotification({ senderId, type, title, message, link, recipientId, targetRole, targetSchoolId, targetStateId }) {
    try {
      logger.info(`Sending notification: ${title} (Type: ${type})`);

      // 1. Create the base notification log
      // notifications table columns: id, notification_code, notification_type, title, message, entity_type, entity_id, created_by, created_at
      const notification = await Notification.create({
        notification_code: `N-${Date.now().toString().slice(-10)}-${Math.floor(Math.random() * 100)}`,
        notification_type: type,
        title,
        message,
        entity_type: link ? 'LINK' : 'SYSTEM',
        entity_id: null,
        created_by: senderId || null
      });

      const recipients = [];

      // 2. Resolve recipients based on parameters
      if (recipientId) {
        // Direct recipient
        recipients.push(parseInt(recipientId, 10));
      } else {
        // Find users matching roles or boundaries
        let candidateUserIds = [];

        if (targetRole) {
          const roleName = targetRole.toUpperCase().replace(' ', '_');
          const roleUsers = await User.findAll({
            include: [{
              model: Role,
              where: { role_name: roleName },
              required: true
            }]
          });
          candidateUserIds = roleUsers.map(u => parseInt(u.id, 10));
        } else {
          const allUsers = await User.findAll();
          candidateUserIds = allUsers.map(u => parseInt(u.id, 10));
        }

        if (targetSchoolId) {
          const mappings = await SchoolAdminMapping.findAll({
            where: { school_id: targetSchoolId }
          });
          const schoolUserIds = mappings.map(m => parseInt(m.user_id, 10));
          candidateUserIds = candidateUserIds.filter(id => schoolUserIds.includes(id));
        }

        if (targetStateId) {
          const scopes = await RegionalAdminScope.findAll({
            where: { state_id: targetStateId }
          });
          const stateUserIds = scopes.map(s => parseInt(s.user_id, 10));
          candidateUserIds = candidateUserIds.filter(id => stateUserIds.includes(id));
        }

        candidateUserIds.forEach(id => {
          recipients.push(id);
        });
      }

      // 3. Create recipient assignment logs and check preferences
      // notification_recipients columns: id, notification_id, user_id, is_read, read_at, delivered_at
      for (const recId of recipients) {
        // Check user preferences: email_notifications, sms_notifications, push_notifications
        const pref = await UserNotificationPreference.findOne({
          where: { user_id: recId }
        });

        if (pref && pref.push_notifications === 0) {
          // Skip if user disabled push notifications
          continue;
        }

        await NotificationRecipient.create({
          notification_id: notification.id,
          user_id: recId,
          is_read: 0,
          delivered_at: new Date()
        });
      }

      // 4. Emit event to local socket server listener
      this.emit('notification_created', {
        notification: {
          id: notification.id,
          notification_code: notification.notification_code,
          notification_type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          created_at: notification.created_at
        },
        recipients,
        targetRole,
        targetSchoolId,
        targetStateId
      });

      return notification;
    } catch (err) {
      logger.error('Failed to dispatch notification: %o', err);
      throw err;
    }
  }
}

module.exports = new NotificationService();
