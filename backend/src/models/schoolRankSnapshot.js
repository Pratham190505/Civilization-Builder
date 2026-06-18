const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolRankSnapshot = sequelize.define('SchoolRankSnapshot', {
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
  total_score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  tier_id: {
    type: DataTypes.BIGINT,
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
  previous_rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rank_change: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  calculated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'school_rank_snapshots',
  timestamps: false
});

module.exports = SchoolRankSnapshot;
