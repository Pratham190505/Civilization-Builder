const authService = require('../services/authService');
const logger = require('../config/logger');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.login(email, password, ipAddress, userAgent);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      logger.warn('Login attempt failed: %s', error.message);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        errors: [error.message]
      });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const success = await authService.logout(refreshToken);
      
      return res.status(200).json({
        success: true,
        message: success ? 'Logged out successfully' : 'Session not found',
        data: {}
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
        errors: [error.message]
      });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.refresh(refreshToken, ipAddress, userAgent);
      
      return res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        errors: [error.message]
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({
        success: true,
        message: 'User profile fetched successfully',
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile: user.mobile,
          status: user.status,
          roles: user.rolesList,
          permissions: user.permissionsList,
          scope: user.scope
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        errors: [error.message]
      });
    }
  }
}

module.exports = new AuthController();
