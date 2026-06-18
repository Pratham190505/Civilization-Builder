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
  total_score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'school_metric_snapshots',
  timestamps: false
});

module.exports = SchoolMetricSnapshot;
