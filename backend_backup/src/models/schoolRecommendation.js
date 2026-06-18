const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolRecommendation = sequelize.define('SchoolRecommendation', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    allowNull: true
  },
  ranking_impact: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  progress_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'school_recommendations',
  timestamps: false
});

module.exports = SchoolRecommendation;
