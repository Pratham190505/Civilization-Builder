const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaSubmission = sequelize.define('MediaSubmission', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  submission_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  school_id: {
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
  status: {
    type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'REGIONAL_REVIEWED', 'SUPER_APPROVED', 'REJECTED', 'PUBLISHED'),
    defaultValue: 'DRAFT'
  },
  submitted_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'media_submissions',
  timestamps: false
});

module.exports = MediaSubmission;
