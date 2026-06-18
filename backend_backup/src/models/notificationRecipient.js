const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationRecipient = sequelize.define('NotificationRecipient', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  notification_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notification_recipients',
  timestamps: false
});

module.exports = NotificationRecipient;
