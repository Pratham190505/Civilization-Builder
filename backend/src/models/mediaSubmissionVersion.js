const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaSubmissionVersion = sequelize.define('MediaSubmissionVersion', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  version_no: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  version_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'media_submission_versions',
  timestamps: false
});

module.exports = MediaSubmissionVersion;
