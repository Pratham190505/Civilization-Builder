const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AchievementAsset = sequelize.define('AchievementAsset', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  achievement_id: {
    type: DataTypes.BIGINT,
    allowNull: false
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
  uploaded_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'achievement_assets',
  timestamps: false
});

module.exports = AchievementAsset;
