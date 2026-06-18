const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolRankHistory = sequelize.define('SchoolRankHistory', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  period_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  tier_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  total_score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  global_rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  state_rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  district_rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'school_rank_history',
  timestamps: false
});

module.exports = SchoolRankHistory;
