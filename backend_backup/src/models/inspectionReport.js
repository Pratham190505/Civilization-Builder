const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InspectionReport = sequelize.define('InspectionReport', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  report_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  inspection_request_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  inspector_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  findings: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  strengths: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  improvement_areas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  overall_rating: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  inspection_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inspection_reports',
  timestamps: false
});

module.exports = InspectionReport;
