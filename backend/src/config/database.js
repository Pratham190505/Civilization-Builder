const { Sequelize } = require('sequelize');
const logger = require('./logger');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'school_management_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: (sql) => {
      // Log SQL statements at debug level to keep console cleaner, or info in development if needed
      logger.debug(`[SQL] ${sql}`);
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = sequelize;
