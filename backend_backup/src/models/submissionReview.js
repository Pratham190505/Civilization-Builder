const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubmissionReview = sequelize.define('SubmissionReview', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  reviewer_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  review_type: {
    type: DataTypes.ENUM('REGIONAL', 'SUPER'),
    allowNull: true
  },
  decision: {
    type: DataTypes.ENUM('APPROVED', 'REJECTED', 'RETURNED'),
    allowNull: true
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'submission_reviews',
  timestamps: false
});

module.exports = SubmissionReview;
