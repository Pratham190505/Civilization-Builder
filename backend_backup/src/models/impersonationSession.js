const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImpersonationSession = sequelize.define('ImpersonationSession', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  super_admin_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  impersonated_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'impersonation_sessions',
  timestamps: false
});

module.exports = ImpersonationSession;
