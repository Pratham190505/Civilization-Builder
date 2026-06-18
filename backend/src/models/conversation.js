const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  conversation_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conversations',
  timestamps: false
});

module.exports = Conversation;
