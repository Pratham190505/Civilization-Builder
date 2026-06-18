const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolDailyActivity = sequelize.define('SchoolDailyActivity', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  activity_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  uploads_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  achievements_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activities_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  logins_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'school_daily_activity',
  timestamps: false
});

module.exports = SchoolDailyActivity;
