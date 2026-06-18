const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeneratedReport = sequelize.define('GeneratedReport', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  report_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  report_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  generated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  generated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'generated_reports',
  timestamps: false
});

module.exports = GeneratedReport;
