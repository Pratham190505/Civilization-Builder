const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const School = sequelize.define('School', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  district_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  school_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  udise_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  principal_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  student_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  teacher_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'),
    defaultValue: 'PENDING'
  },
  media_upload_enabled: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  approved_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'schools',
  timestamps: false
});

module.exports = School;
