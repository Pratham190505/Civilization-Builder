const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  entity_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entity_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: true
  },
  old_value: {
    type: DataTypes.JSON,
    allowNull: true
  },
  new_value: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entity_name: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('entity_type');
    },
    set(value) {
      this.setDataValue('entity_type', value);
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: false
});

module.exports = AuditLog;
