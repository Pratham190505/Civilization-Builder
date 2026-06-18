const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolPackageProposal = sequelize.define('SchoolPackageProposal', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  package_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  proposal_status: {
    type: DataTypes.ENUM('PROPOSED', 'ACCEPTED', 'REJECTED'),
    defaultValue: 'PROPOSED'
  },
  proposed_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  proposed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'school_package_proposals',
  timestamps: false
});

module.exports = SchoolPackageProposal;
