const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const logger = require('./config/logger');
const { sequelize } = require('./models');
const routes = require('./routes');
const { initializeSocket } = require('./sockets');

const app = express();
const server = http.createServer(app);

// 1. Configure Security and CORS middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local upload assets in browser
}));
app.use(cors({
  origin: '*', // Adjust to allow specific domains in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body Parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url} - IP: ${req.ip}`);
  next();
});

// 3. Serve Local Uploaded Media Statically
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Serve generated PDFs/reports statically
app.use('/reports', express.static(path.resolve(uploadDir)));

// 4. Mount API Routes
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Serve Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', routes);

// Base route ping
app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GDS School Management Backend is online',
    data: { timestamp: new Date() }
  });
});

// 5. Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error: %o', err);

  const statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    message = 'Database Constraint Error';
    errors = err.errors.map(e => e.message);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : [err.message]
  });
});

// 6. Connect Database & Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    logger.info('MySQL Database Connection established successfully.');

    // Ensure is_featured column exists in media_submissions
    try {
      await sequelize.query('ALTER TABLE media_submissions ADD COLUMN is_featured TINYINT DEFAULT 0;');
      logger.info('Database Schema Migration: Added is_featured column to media_submissions.');
    } catch (migErr) {
      // Column probably already exists or table doesn't exist yet, ignore
    }

    // Ensure social media columns exist in schools
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN facebook_url VARCHAR(255) NULL;');
      logger.info('Database Schema Migration: Added facebook_url column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN instagram_url VARCHAR(255) NULL;');
      logger.info('Database Schema Migration: Added instagram_url column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN youtube_url VARCHAR(255) NULL;');
      logger.info('Database Schema Migration: Added youtube_url column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN website_url VARCHAR(255) NULL;');
      logger.info('Database Schema Migration: Added website_url column to schools.');
    } catch (migErr) {}

    // Auto-sync schema in development if specified
    if (process.env.DB_SYNC === 'true') {
      logger.info('Syncing Sequelize models with database...');
      await sequelize.sync({ alter: true });
      logger.info('Database models synced successfully.');
    }

    // Initialize Socket.IO Server
    initializeSocket(server);
    logger.info('Socket.IO notification server initialized.');

    // Start HTTP Server
    server.listen(PORT, () => {
      logger.info(`GDS School Management Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    logger.error('Failed to start GDS backend server: %o', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
