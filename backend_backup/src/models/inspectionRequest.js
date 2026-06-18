const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InspectionRequest = sequelize.define('InspectionRequest', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  request_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  requested_by: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  request_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  requested_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inspection_requests',
  timestamps: false
});

module.exports = InspectionRequest;
