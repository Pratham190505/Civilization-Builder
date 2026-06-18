const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialDailyMetric = sequelize.define('SocialDailyMetric', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  metric_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  facebook_reach: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  instagram_reach: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  youtube_views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  website_visits: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'social_daily_metrics',
  timestamps: false
});

module.exports = SocialDailyMetric;
