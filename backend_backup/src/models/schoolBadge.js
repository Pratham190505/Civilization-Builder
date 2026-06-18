const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolBadge = sequelize.define('SchoolBadge', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  badge_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  assigned_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'school_badges',
  timestamps: false
});

module.exports = SchoolBadge;
