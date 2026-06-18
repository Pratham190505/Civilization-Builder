const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageAsset = sequelize.define('MessageAsset', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  message_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'message_assets',
  timestamps: false
});

module.exports = MessageAsset;
