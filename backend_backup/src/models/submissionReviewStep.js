const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubmissionReviewStep = sequelize.define('SubmissionReviewStep', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  step_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  step_order: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  reviewed_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'submission_review_steps',
  timestamps: false
});

module.exports = SubmissionReviewStep;
