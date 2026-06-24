const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolMetricSnapshot = sequelize.define('SchoolMetricSnapshot', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  snapshot_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  student_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  teacher_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_activities: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_achievements: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_media_uploads: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Social Media Metrics - Future Integration
  // These fields can be populated when social media APIs are integrated
  facebook_reach: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Facebook page reach/reach count for analytics'
  },
  instagram_reach: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Instagram follower/reach count for analytics'
  },
  youtube_views: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'YouTube channel views/subscribers for analytics'
  },
  website_visits: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Website visit count for analytics'
  },
  total_score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'school_metric_snapshots',
  timestamps: false
});

module.exports = SchoolMetricSnapshot;
