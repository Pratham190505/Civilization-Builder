const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RankTier = sequelize.define('RankTier', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  tier_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  min_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'rank_tiers',
  timestamps: false
});

module.exports = RankTier;
