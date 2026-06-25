const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolLog = sequelize.define('SchoolLog', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  action_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  performed_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'school_logs',
  timestamps: false
});

module.exports = SchoolLog;
