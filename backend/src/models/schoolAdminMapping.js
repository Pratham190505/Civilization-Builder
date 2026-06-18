const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolAdminMapping = sequelize.define('SchoolAdminMapping', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'school_admin_mapping',
  timestamps: false
});

module.exports = SchoolAdminMapping;
