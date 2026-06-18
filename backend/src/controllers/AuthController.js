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

  async updateProfile(req, res) {
    try {
      const { first_name, last_name, mobile } = req.body;
      const user = await require('../models').User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await user.update({ first_name, last_name, mobile });

      // Trigger audit log manually or implicitly
      await require('../repositories').AuditRepository.create({
        user_id: user.id,
        action: 'Updated profile details',
        entity_name: 'User',
        entity_id: user.id,
        ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
        user_agent: req.headers['user-agent'] || 'unknown',
        created_at: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile: user.mobile,
          status: user.status
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update profile', errors: [error.message] });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }

      const user = await require('../models').User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid current password' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }

      await user.update({ password_hash: newPassword });

      // Send real-time notification
      try {
        const notificationService = require('../services/notificationService');
        await notificationService.sendNotification({
          senderId: user.id,
          recipientId: user.id,
          type: 'PASSWORD_CHANGED',
          title: 'Password Changed Successfully',
          message: `Your account password was updated. If you did not initiate this change, contact support immediately.`
        });
      } catch (notifErr) {
        console.warn('Failed to send notification for Password change:', notifErr);
      }

      // Trigger audit log manually
      await require('../repositories').AuditRepository.create({
        user_id: user.id,
        action: 'Changed account password',
        entity_name: 'User',
        entity_id: user.id,
        ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
        user_agent: req.headers['user-agent'] || 'unknown',
        created_at: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to change password', errors: [error.message] });
    }
  }
}

module.exports = new AuthController();
