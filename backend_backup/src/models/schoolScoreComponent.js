const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolScoreComponent = sequelize.define('SchoolScoreComponent', {
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
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  score: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  calculated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'school_score_components',
  timestamps: false
});

module.exports = SchoolScoreComponent;
