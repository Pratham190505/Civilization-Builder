const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScoreCategory = sequelize.define('ScoreCategory', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
  tableName: 'score_categories',
  timestamps: false
});

module.exports = ScoreCategory;
