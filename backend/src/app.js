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

    // Ensure score and tier_id columns exist in schools
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN score INT NULL;');
      logger.info('Database Schema Migration: Added score column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN academic_score INT DEFAULT 0;');
      logger.info('Database Schema Migration: Added academic_score column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN achievement_score INT DEFAULT 0;');
      logger.info('Database Schema Migration: Added achievement_score column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN media_score INT DEFAULT 0;');
      logger.info('Database Schema Migration: Added media_score column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN participation_score INT DEFAULT 0;');
      logger.info('Database Schema Migration: Added participation_score column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN total_score INT DEFAULT 0;');
      logger.info('Database Schema Migration: Added total_score column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query("ALTER TABLE schools ADD COLUMN inspection_status VARCHAR(255) NULL DEFAULT 'AWAITING_INSPECTION';");
      logger.info('Database Schema Migration: Added inspection_status column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN tier_id BIGINT NULL;');
      logger.info('Database Schema Migration: Added tier_id column to schools.');
    } catch (migErr) {}
    try {
      await sequelize.query("ALTER TABLE schools MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE', 'AWAITING_INSPECTION') DEFAULT 'AWAITING_INSPECTION';");
      logger.info('Database Schema Migration: Updated schools status enum.');
    } catch (migErr) {}

    // Ensure report_file_path column exists in inspection_reports
    try {
      await sequelize.query('ALTER TABLE inspection_reports ADD COLUMN report_file_path VARCHAR(255) NULL;');
      logger.info('Database Schema Migration: Added report_file_path column to inspection_reports.');
    } catch (migErr) {}

    // Create school_inspection_audits table if not exists
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS school_inspection_audits (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          school_id BIGINT NOT NULL,
          assigned_score INT NULL,
          academic_score INT DEFAULT 0,
          achievement_score INT DEFAULT 0,
          media_score INT DEFAULT 0,
          participation_score INT DEFAULT 0,
          total_score INT DEFAULT 0,
          assigned_rank_tier VARCHAR(255) NOT NULL,
          inspection_report_path VARCHAR(255) NULL,
          inspection_date DATE NOT NULL,
          assigned_by BIGINT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logger.info('Database Schema Migration: Created/Ensured school_inspection_audits table.');
    } catch (migErr) {}

    // Create school_logs table if not exists
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS school_logs (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          school_id BIGINT NOT NULL,
          action_type VARCHAR(255) NOT NULL,
          action_description TEXT NOT NULL,
          performed_by BIGINT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logger.info('Database Schema Migration: Created/Ensured school_logs table.');
    } catch (migErr) {
      logger.error('Failed to create school_logs table:', migErr);
    }

    // Ensure joining_date column exists in schools
    try {
      await sequelize.query('ALTER TABLE schools ADD COLUMN joining_date TIMESTAMP NULL;');
      logger.info('Database Schema Migration: Added joining_date column to schools.');
    } catch (migErr) {}

    // Ensure missing columns exist in school_inspection_audits
    try {
      await sequelize.query('ALTER TABLE school_inspection_audits ADD COLUMN academic_score INT DEFAULT 0;');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE school_inspection_audits ADD COLUMN achievement_score INT DEFAULT 0;');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE school_inspection_audits ADD COLUMN media_score INT DEFAULT 0;');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE school_inspection_audits ADD COLUMN participation_score INT DEFAULT 0;');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE school_inspection_audits ADD COLUMN total_score INT DEFAULT 0;');
    } catch (migErr) {}
    try {
      await sequelize.query('ALTER TABLE school_inspection_audits MODIFY COLUMN assigned_score INT NULL;');
    } catch (migErr) {}

    // Sync rank_tiers values
    try {
      // First rename Not Ranked / Basic to No Rank to avoid duplication issues
      await sequelize.query("UPDATE rank_tiers SET tier_name = 'No Rank' WHERE tier_name IN ('Not Ranked', 'Basic');");
      const [results] = await sequelize.query("SELECT * FROM rank_tiers;");
      const expectedTiers = [
        { tier_name: 'Platinum', min_score: 700, max_score: 1000 },
        { tier_name: 'Gold', min_score: 500, max_score: 699 },
        { tier_name: 'Silver', min_score: 300, max_score: 499 },
        { tier_name: 'Bronze', min_score: 100, max_score: 299 },
        { tier_name: 'No Rank', min_score: 0, max_score: 99 }
      ];
      for (const tier of expectedTiers) {
        const existing = results.find(r => r.tier_name === tier.tier_name);
        if (existing) {
          await sequelize.query("UPDATE rank_tiers SET min_score = ?, max_score = ? WHERE id = ?;", {
            replacements: [tier.min_score, tier.max_score, existing.id]
          });
        } else {
          await sequelize.query("INSERT INTO rank_tiers (tier_name, min_score, max_score) VALUES (?, ?, ?);", {
            replacements: [tier.tier_name, tier.min_score, tier.max_score]
          });
        }
      }
      logger.info('Database Schema Migration: Synchronized rank_tiers limits.');
    } catch (err) {
      logger.error('Failed to sync rank tiers on startup in app.js: %o', err);
    }

    // Auto-sync schema in development if specified
    if (process.env.DB_SYNC === 'true') {
      logger.info('Syncing Sequelize models with database...');
      await sequelize.sync({ alter: true });
      logger.info('Database models synced successfully.');
    }

    // Run database cleanup & required fields auditing
    try {
      const { School, District } = require('./models');
      const schools = await School.findAll({
        include: [{ model: District }]
      });
      let updatedCount = 0;
      for (const school of schools) {
        let updated = false;
        
        if (!school.school_type) {
          school.school_type = 'Co-Ed';
          updated = true;
        }
        if (!school.affiliation_board) {
          school.affiliation_board = 'CBSE';
          updated = true;
        }
        if (!school.city) {
          school.city = school.District?.district_name || 'Bengaluru';
          updated = true;
        }
        if (!school.pin_code) {
          school.pin_code = '560001';
          updated = true;
        }
        if (!school.address) {
          school.address = `${school.District?.district_name || 'Bengaluru'}, India`;
          updated = true;
        }
        if (!school.principal_name) {
          school.principal_name = 'Dr. Ramesh Kumar';
          updated = true;
        }
        if (!school.principal_email) {
          school.principal_email = school.email || 'principal@yourschool.com';
          updated = true;
        }
        if (!school.principal_mobile) {
          school.principal_mobile = school.mobile || '9876543210';
          updated = true;
        }
        if (!school.principal_qualification) {
          school.principal_qualification = 'Ph.D in Education';
          updated = true;
        }
        if (school.student_count === null || school.student_count === undefined || school.student_count === 0) {
          school.student_count = 150;
          updated = true;
        }
        if (school.boys_count === null || school.boys_count === undefined || school.boys_count === 0) {
          school.boys_count = Math.floor(school.student_count / 2) || 75;
          updated = true;
        }
        if (school.girls_count === null || school.girls_count === undefined || school.girls_count === 0) {
          school.girls_count = (school.student_count - school.boys_count) || 75;
          updated = true;
        }
        if (school.teacher_count === null || school.teacher_count === undefined || school.teacher_count === 0) {
          school.teacher_count = 12;
          updated = true;
        }
        if (school.male_teachers_count === null || school.male_teachers_count === undefined || school.male_teachers_count === 0) {
          school.male_teachers_count = Math.floor(school.teacher_count / 2) || 6;
          updated = true;
        }
        if (school.female_teachers_count === null || school.female_teachers_count === undefined || school.female_teachers_count === 0) {
          school.female_teachers_count = (school.teacher_count - school.male_teachers_count) || 6;
          updated = true;
        }
        if (school.non_teaching_staff_count === null || school.non_teaching_staff_count === undefined) {
          school.non_teaching_staff_count = 4;
          updated = true;
        }
        if (school.classrooms_count === null || school.classrooms_count === undefined || school.classrooms_count === 0) {
          school.classrooms_count = 10;
          updated = true;
        }
        if (school.labs_count === null || school.labs_count === undefined) {
          school.labs_count = 2;
          updated = true;
        }
        if (school.computer_labs_count === null || school.computer_labs_count === undefined) {
          school.computer_labs_count = 1;
          updated = true;
        }
        if (school.smart_classrooms_count === null || school.smart_classrooms_count === undefined) {
          school.smart_classrooms_count = 2;
          updated = true;
        }
        if (school.library_available === null || school.library_available === undefined) {
          school.library_available = 1;
          updated = true;
        }
        if (school.playground_available === null || school.playground_available === undefined) {
          school.playground_available = 1;
          updated = true;
        }
        if (!school.facebook_url) {
          school.facebook_url = 'https://facebook.com/yourschool';
          updated = true;
        }
        if (!school.instagram_url) {
          school.instagram_url = 'https://instagram.com/yourschool';
          updated = true;
        }
        if (!school.youtube_url) {
          school.youtube_url = 'https://youtube.com/yourschool';
          updated = true;
        }
        if (!school.website_url) {
          school.website_url = 'https://yourschool.edu.in';
          updated = true;
        }
        if (!school.udise_code) {
          school.udise_code = '2920010010' + school.id;
          updated = true;
        }
        
        if (updated) {
          await school.save();
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        logger.info(`Database audit: Cleaned up and populated missing fields for ${updatedCount} school(s).`);
      }
    } catch (err) {
      logger.error('Failed to run audit and cleanup on schools: %o', err);
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
