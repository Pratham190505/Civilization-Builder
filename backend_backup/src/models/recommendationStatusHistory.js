const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecommendationStatusHistory = sequelize.define('RecommendationStatusHistory', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  recommendation_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  old_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  new_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  changed_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  changed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'recommendation_status_history',
  timestamps: false
});

module.exports = RecommendationStatusHistory;
