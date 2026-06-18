const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaPublication = sequelize.define('MediaPublication', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  published_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  publication_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'media_publications',
  timestamps: false
});

module.exports = MediaPublication;
