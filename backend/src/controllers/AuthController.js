const authService = require('../services/authService');
const logger = require('../config/logger');

class AuthController {
  async signup(req, res) {
    const { sequelize, User, Role, UserRoleAssignment } = require('../models');
    const transaction = await sequelize.transaction();
    try {
      const { full_name, email, mobile, password } = req.body;

      if (await User.findOne({ where: { email }, transaction })) {
        await transaction.rollback();
        return res.status(409).json({ success: false, message: 'Email is already registered' });
      }

      if (await User.findOne({ where: { mobile }, transaction })) {
        await transaction.rollback();
        return res.status(409).json({ success: false, message: 'Mobile number is already registered' });
      }

      const nameParts = full_name.trim().split(/\s+/);
      const user = await User.create({
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || null,
        email,
        mobile,
        password_hash: password,
        status: 'ACTIVE'
      }, { transaction });

      const defaultRole = await Role.findOne({
        where: { role_name: 'SCHOOL_ADMIN' },
        transaction
      });
      if (!defaultRole) throw new Error('Default SCHOOL_ADMIN role not found in database');

      await UserRoleAssignment.create({
        user_id: user.id,
        role_id: defaultRole.id
      }, { transaction });

      await transaction.commit();
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { id: user.id, email: user.email, role: defaultRole.role_name }
      });
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: 'Failed to create account',
        errors: [error.message]
      });
    }
  }

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
      const user = await require('../models').User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid current password' });
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
