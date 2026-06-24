const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolInspectionAudit = sequelize.define('SchoolInspectionAudit', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  assigned_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  academic_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  achievement_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  media_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  participation_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  assigned_rank_tier: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inspection_report_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  inspection_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  assigned_by: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'school_inspection_audits',
  timestamps: false
});

module.exports = SchoolInspectionAudit;
