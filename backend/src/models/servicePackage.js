const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServicePackage = sequelize.define('ServicePackage', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  package_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  package_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  expected_ranking_growth: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'service_packages',
  timestamps: false
});

module.exports = ServicePackage;
