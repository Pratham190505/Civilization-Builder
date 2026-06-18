const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WebhookEvent = sequelize.define('WebhookEvent', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  webhook_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  request_payload: {
    type: DataTypes.JSON,
    allowNull: true
  },
  response_payload: {
    type: DataTypes.JSON,
    allowNull: true
  },
  response_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'webhook_events',
  timestamps: false
});

module.exports = WebhookEvent;
