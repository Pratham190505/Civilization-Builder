const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DistrictPerformanceSnapshot = sequelize.define('DistrictPerformanceSnapshot', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  district_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  snapshot_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  active_schools: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  inactive_schools: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  average_score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  ranking_position: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'district_performance_snapshots',
  timestamps: false
});

module.exports = DistrictPerformanceSnapshot;
