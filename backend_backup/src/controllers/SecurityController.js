const { AuditRepository, ImpersonationSessionRepository } = require('../repositories');
const authService = require('../services/authService');

class SecurityController {
  async getAuditLogs(req, res) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await AuditRepository.findAndCountAll({
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [{ association: 'User', attributes: ['id', 'email', 'first_name', 'last_name'] }]
      });

      return res.status(200).json({
        success: true,
        message: 'Audit logs fetched successfully',
        data: {
          logs: rows,
          pagination: {
            total: count,
            page,
            limit,
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch audit logs', errors: [error.message] });
    }
  }

  async startImpersonation(req, res) {
    try {
      const adminId = req.user.id; // Active Super Admin
      const { userId } = req.body; // User to impersonate
      
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'unknown';

      const impersonatedData = await authService.impersonate(adminId, userId, ipAddress, userAgent);

      return res.status(200).json({
        success: true,
        message: `Impersonating user ID ${userId} started successfully`,
        data: impersonatedData
      });
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Impersonation failed', errors: [error.message] });
    }
  }

  async endImpersonation(req, res) {
    try {
      const { sessionId } = req.body;

      const session = await ImpersonationSessionRepository.findById(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Impersonation session not found', errors: [] });
      }

      await session.update({
        end_time: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Impersonation session terminated successfully',
        data: {}
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to terminate impersonation session', errors: [error.message] });
    }
  }
}

module.exports = new SecurityController();
