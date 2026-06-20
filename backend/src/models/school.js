const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const School = sequelize.define('School', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  school_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  district_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  school_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  udise_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  principal_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  student_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  teacher_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'),
    defaultValue: 'PENDING'
  },
  media_upload_enabled: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  school_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  affiliation_board: {
    type: DataTypes.STRING,
    allowNull: true
  },
  alternate_mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  establishment_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taluka: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pin_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  principal_qualification: {
    type: DataTypes.STRING,
    allowNull: true
  },
  principal_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  principal_mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  boys_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  girls_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  male_teachers_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  female_teachers_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  non_teaching_staff_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  classrooms_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  labs_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  computer_labs_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  library_available: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  playground_available: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  smart_classrooms_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  auditorium_available: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  transport_available: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  achievements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facebook_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagram_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  youtube_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'schools',
  timestamps: false
});

module.exports = School;
