const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRoleAssignment = sequelize.define('UserRoleAssignment', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  role_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_role_assignments',
  timestamps: false
});

module.exports = UserRoleAssignment;
