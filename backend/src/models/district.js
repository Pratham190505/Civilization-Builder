const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  district_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  state_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  district_name: {
    type: DataTypes.STRING,
    allowNull: false
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
  tableName: 'districts',
  timestamps: false
});

module.exports = District;
