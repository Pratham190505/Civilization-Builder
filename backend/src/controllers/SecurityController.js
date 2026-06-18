const { AuditRepository, ImpersonationSessionRepository } = require('../repositories');
const authService = require('../services/authService');

class SecurityController {
  async searchAll(req, res) {
    try {
      const q = req.query.q || '';
      if (!q.trim()) {
        return res.status(200).json({ success: true, data: { states: [], admins: [], schools: [], media: [], notifications: [], rankings: [], messages: [] } });
      }
      const { State, User, Role, School, MediaSubmission, Notification, SchoolRankSnapshot, Message } = require('../models');
      const { Op } = require('sequelize');

      // 1. Search States
      const states = await State.findAll({
        where: { state_name: { [Op.like]: `%${q}%` } },
        limit: 5
      });

      // 2. Search Regional Admins
      const admins = await User.findAll({
        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${q}%` } },
            { last_name: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } }
          ]
        },
        include: [{
          model: Role,
          where: { role_name: 'REGIONAL_ADMIN' },
          required: true
        }],
        limit: 5
      });

      // 3. Search Schools
      const schools = await School.findAll({
        where: {
          [Op.or]: [
            { school_name: { [Op.like]: `%${q}%` } },
            { school_code: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // 4. Search Media Submissions
      const media = await MediaSubmission.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // 5. Search Notifications
      const notifications = await Notification.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { message: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // 6. Search Rankings (SchoolRankSnapshot)
      const rankings = await SchoolRankSnapshot.findAll({
        include: [{
          model: School,
          where: {
            school_name: { [Op.like]: `%${q}%` }
          }
        }],
        limit: 5
      });

      // 7. Search Messages
      const messages = await Message.findAll({
        where: {
          message_text: { [Op.like]: `%${q}%` }
        },
        limit: 5
      });

      return res.status(200).json({
        success: true,
        data: {
          states: states.map(s => ({ id: s.id, name: s.state_name, type: 'State', route: '/states' })),
          admins: admins.map(a => ({ id: a.id, name: `${a.first_name} ${a.last_name || ''}`.trim(), type: 'Regional Admin', route: '/regional-admins' })),
          schools: schools.map(s => ({ id: s.id, name: s.school_name, type: 'School', route: '/schools' })),
          media: media.map(m => ({ id: m.id, name: m.title, type: 'Media', route: '/media-approvals' })),
          notifications: notifications.map(n => ({ id: n.id, name: n.title, type: 'Notification', route: '/notifications' })),
          rankings: rankings.map(r => ({ id: r.id, name: `${r.School?.school_name || 'School'} (Rank: ${r.global_rank || 'N/A'})`, type: 'Ranking', route: '/rankings' })),
          messages: messages.map(m => ({ id: m.id, name: m.message_text.length > 40 ? m.message_text.substring(0, 40) + '...' : m.message_text, type: 'Message', route: '/messages' }))
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Search failed', errors: [error.message] });
    }
  }

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

  async getRegionalAdmins(req, res) {
    try {
      const { User, Role, RegionalAdminScope, State } = require('../models');
      const users = await User.findAll({
        include: [
          {
            model: Role,
            where: { role_name: 'REGIONAL_ADMIN' },
            attributes: ['id', 'role_name']
          },
          {
            model: RegionalAdminScope,
            include: [{ model: State, attributes: ['id', 'state_name', 'state_code'] }]
          }
        ]
      });

      const formatted = users.map(u => {
        const scope = u.RegionalAdminScopes?.[0];
        const stateName = scope?.State?.state_name || 'N/A';
        return {
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name || '',
          name: `${u.first_name} ${u.last_name || ''}`.trim(),
          email: u.email,
          mobile: u.mobile || '',
          status: u.status,
          state: stateName,
          stateId: scope?.state_id,
          initials: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()
        };
      });

      return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch regional admins', errors: [error.message] });
    }
  }

  async createRegionalAdmin(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    try {
      const { User, Role, UserRoleAssignment, RegionalAdminScope } = require('../models');
      const { email, password, first_name, last_name, mobile, stateId } = req.body;

      if (!email || !first_name || !stateId) {
        return res.status(400).json({ success: false, message: 'Missing required fields: email, first_name, stateId' });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      // Check if state is already assigned to a Regional Admin
      const existingScope = await RegionalAdminScope.findOne({
        where: { state_id: stateId },
        include: [{ 
          model: User,
          where: { status: 'ACTIVE' }
        }]
      });
      if (existingScope) {
        return res.status(400).json({ 
          success: false, 
          message: `Duplicate assignment: State is already assigned to Regional Admin '${existingScope.User?.first_name} ${existingScope.User?.last_name || ""}'. A state can belong to only ONE Regional Admin.` 
        });
      }

      const user = await User.create({
        email,
        password_hash: password || 'password123',
        first_name,
        last_name: last_name || '',
        mobile: mobile || '',
        status: 'ACTIVE'
      }, { transaction });

      const role = await Role.findOne({ where: { role_name: 'REGIONAL_ADMIN' } });
      if (!role) {
        throw new Error('REGIONAL_ADMIN role not found in database');
      }

      await UserRoleAssignment.create({
        user_id: user.id,
        role_id: role.id
      }, { transaction });

      await RegionalAdminScope.create({
        user_id: user.id,
        state_id: stateId
      }, { transaction });

      await transaction.commit();

      // Send real-time notification to Super Admin
      try {
        const notificationService = require('../services/notificationService');
        await notificationService.sendNotification({
          senderId: req.user?.id || 1,
          type: 'REGIONAL_ADMIN_CREATED',
          title: 'Regional Admin Created',
          message: `Regional admin ${first_name} ${last_name || ''} has been registered.`,
          targetRole: 'SUPER_ADMIN'
        });
      } catch (notifErr) {
        console.warn('Failed to send notification for Regional Admin creation:', notifErr);
      }

      // Trigger audit log manually
      try {
        await require('../repositories').AuditRepository.create({
          user_id: req.user?.id || 1,
          action: `Created regional admin ${first_name} ${last_name}`,
          entity_name: 'User',
          entity_id: user.id,
          ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
          user_agent: req.headers['user-agent'] || 'unknown',
          created_at: new Date()
        });
      } catch (logErr) {
        console.warn('Failed to write audit log:', logErr);
      }

      return res.status(201).json({
        success: true,
        message: 'Regional admin created successfully',
        data: { id: user.id, email: user.email }
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ success: false, message: 'Failed to create regional admin', errors: [error.message] });
    }
  }

  async updateRegionalAdmin(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    try {
      const { User, RegionalAdminScope } = require('../models');
      const { id } = req.params;
      const { first_name, last_name, mobile, status, stateId } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updateData = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (mobile !== undefined) updateData.mobile = mobile;
      if (status !== undefined) updateData.status = status;

      await user.update(updateData, { transaction });

      if (stateId !== undefined) {
        // Check if state is already assigned to ANOTHER Regional Admin
        const existingScope = await RegionalAdminScope.findOne({
          where: { 
            state_id: stateId,
            user_id: { [require('sequelize').Op.ne]: id }
          },
          include: [{ 
            model: User,
            where: { status: 'ACTIVE' }
          }]
        });
        if (existingScope) {
          return res.status(400).json({ 
            success: false, 
            message: `Duplicate assignment: State is already assigned to Regional Admin '${existingScope.User?.first_name} ${existingScope.User?.last_name || ""}'. A state can belong to only ONE Regional Admin.` 
          });
        }

        const scope = await RegionalAdminScope.findOne({ where: { user_id: id } });
        if (scope) {
          await scope.update({ state_id: stateId }, { transaction });
        } else {
          await RegionalAdminScope.create({ user_id: id, state_id: stateId }, { transaction });
        }
      }

      await transaction.commit();

      // Trigger audit log manually
      try {
        await require('../repositories').AuditRepository.create({
          user_id: req.user?.id || 1,
          action: `Updated regional admin ID ${id}`,
          entity_name: 'User',
          entity_id: id,
          ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
          user_agent: req.headers['user-agent'] || 'unknown',
          created_at: new Date()
        });
      } catch (logErr) {
        console.warn('Failed to write audit log:', logErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Regional admin updated successfully',
        data: {}
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ success: false, message: 'Failed to update regional admin', errors: [error.message] });
    }
  }

  async deleteRegionalAdmin(req, res) {
    try {
      const { User, UserRoleAssignment, RegionalAdminScope, InspectionRequest, InspectionReport, MediaSubmission } = require('../models');
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check for active dependencies
      const inspectRequestCount = await InspectionRequest.count({ where: { requested_by: id } });
      if (inspectRequestCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete Regional Admin. There are ${inspectRequestCount} inspection request(s) associated with this account. Please reassign or delete them first.`
        });
      }

      const inspectReportCount = await InspectionReport.count({ where: { inspector_id: id } });
      if (inspectReportCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete Regional Admin. There are ${inspectReportCount} inspection report(s) associated with this account. Please reassign or delete them first.`
        });
      }

      const mediaCount = await MediaSubmission.count({ where: { submitted_by: id } });
      if (mediaCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete Regional Admin. There are ${mediaCount} media submission(s) associated with this account. Please reassign or delete them first.`
        });
      }

      const transaction = await require('../models').sequelize.transaction();
      try {
        await UserRoleAssignment.destroy({ where: { user_id: id } }, { transaction });
        await RegionalAdminScope.destroy({ where: { user_id: id } }, { transaction });
        await user.destroy({ transaction });

        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: 'Regional admin deleted successfully',
          data: {}
        });
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, message: 'Failed to delete regional admin', errors: [error.message] });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete regional admin', errors: [error.message] });
    }
  }
}

module.exports = new SecurityController();

