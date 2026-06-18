const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  secret: process.env.JWT_SECRET || 'supersecretjwtkey12345!',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey98765!',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
