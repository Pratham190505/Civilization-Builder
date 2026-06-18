const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaVersionAsset = sequelize.define('MediaVersionAsset', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  version_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  asset_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'media_version_assets',
  timestamps: false
});

module.exports = MediaVersionAsset;
