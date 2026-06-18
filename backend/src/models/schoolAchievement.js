const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolAchievement = sequelize.define('SchoolAchievement', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  achievement_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  activity_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  achievement_level: {
    type: DataTypes.ENUM('STATE', 'NATIONAL', 'INTERNATIONAL'),
    allowNull: false
  },
  achievement_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'school_achievements',
  timestamps: false
});

module.exports = SchoolAchievement;
