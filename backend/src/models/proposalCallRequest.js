const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProposalCallRequest = sequelize.define('ProposalCallRequest', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  proposal_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  requested_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  preferred_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('REQUESTED', 'SCHEDULED', 'COMPLETED'),
    defaultValue: 'REQUESTED'
  }
}, {
  tableName: 'proposal_call_requests',
  timestamps: false
});

module.exports = ProposalCallRequest;
