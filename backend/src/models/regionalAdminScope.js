const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegionalAdminScope = sequelize.define('RegionalAdminScope', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  state_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'regional_admin_scope',
  timestamps: false
});

module.exports = RegionalAdminScope;
