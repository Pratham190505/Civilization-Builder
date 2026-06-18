const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserNotificationPreference = sequelize.define('UserNotificationPreference', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  email_notifications: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  sms_notifications: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  push_notifications: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'user_notification_preferences',
  timestamps: false
});

module.exports = UserNotificationPreference;
