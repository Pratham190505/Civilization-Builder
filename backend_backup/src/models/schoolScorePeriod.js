const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolScorePeriod = sequelize.define('SchoolScorePeriod', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  period_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_closed: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'school_score_periods',
  timestamps: false
});

module.exports = SchoolScorePeriod;
