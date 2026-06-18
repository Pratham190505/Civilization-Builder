const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaAsset = sequelize.define('MediaAsset', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  asset_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'media_assets',
  timestamps: false
});

module.exports = MediaAsset;
