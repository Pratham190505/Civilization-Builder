const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScoreRule = sequelize.define('ScoreRule', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  rule_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  score_value: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'score_rules',
  timestamps: false
});

module.exports = ScoreRule;
