const { AuditRepository, ImpersonationSessionRepository } = require('../repositories');
const authService = require('../services/authService');

class SecurityController {
  async searchAll(req, res) {
    try {
      const q = req.query.q || '';
      if (!q.trim()) {
        return res.status(200).json({
          success: true,
          data: {
            states: [],
            districts: [],
            schools: [],
            regionalAdmins: [],
            schoolAdmins: [],
            media: [],
            inspections: [],
            rankings: []
          }
        });
      }
      const { 
        State, User, Role, School, MediaSubmission, SchoolRankSnapshot, 
        District, RankTier, InspectionRequest, RegionalAdminScope, SchoolAdminMapping 
      } = require('../models');
      const { Op } = require('sequelize');

      const isSuperAdmin = req.user.rolesList.includes('SUPER_ADMIN');
      const isRegionalAdmin = req.user.rolesList.includes('REGIONAL_ADMIN');
      const isSchoolAdmin = req.user.rolesList.includes('SCHOOL_ADMIN');

      let schoolId = null;
      let stateIds = [];
      let districtId = null;

      if (isSchoolAdmin) {
        schoolId = req.user.scope.schoolId;
        const schoolObj = await School.findByPk(schoolId, {
          include: [{
            association: 'District',
            include: ['State']
          }]
        });
        if (schoolObj && schoolObj.District) {
          districtId = schoolObj.District.id;
          if (schoolObj.District.State) {
            stateIds = [schoolObj.District.State.id];
          }
        }
      } else if (isRegionalAdmin) {
        stateIds = req.user.scope.stateIds || [];
      }

      // 1. Search States
      const statesWhere = {
        [Op.or]: [
          { state_name: { [Op.like]: `%${q}%` } },
          { state_code: { [Op.like]: `%${q}%` } }
        ]
      };
      if (isSchoolAdmin || isRegionalAdmin) {
        statesWhere.id = stateIds.length > 0 ? { [Op.in]: stateIds } : 0;
      }
      const states = await State.findAll({
        where: statesWhere,
        limit: 5
      });

      // 2. Search Districts
      const districtsWhere = {
        district_name: { [Op.like]: `%${q}%` }
      };
      if (isSchoolAdmin) {
        districtsWhere.id = districtId || 0;
      } else if (isRegionalAdmin) {
        districtsWhere.state_id = stateIds.length > 0 ? { [Op.in]: stateIds } : 0;
      }
      const districts = await District.findAll({
        where: districtsWhere,
        limit: 5
      });

      // 3. Search Schools
      const schoolsWhere = {
        [Op.or]: [
          { school_name: { [Op.like]: `%${q}%` } },
          { school_code: { [Op.like]: `%${q}%` } },
          { udise_code: { [Op.like]: `%${q}%` } },
          { principal_name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      };
      const schoolsInclude = [];
      if (isSchoolAdmin) {
        schoolsWhere.id = schoolId || 0;
      } else if (isRegionalAdmin) {
        schoolsInclude.push({
          association: 'District',
          where: stateIds.length > 0 ? { state_id: { [Op.in]: stateIds } } : { state_id: 0 },
          required: true
        });
      }
      const schools = await School.findAll({
        where: schoolsWhere,
        include: schoolsInclude,
        limit: 5
      });

      // 4. Search Regional Admins
      const adminsWhere = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${q}%` } },
          { last_name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      };
      const adminsInclude = [
        {
          model: Role,
          where: { role_name: 'REGIONAL_ADMIN' },
          required: true
        }
      ];
      if (isSchoolAdmin || isRegionalAdmin) {
        adminsInclude.push({
          model: RegionalAdminScope,
          where: stateIds.length > 0 ? { state_id: { [Op.in]: stateIds } } : { state_id: 0 },
          required: true
        });
      }
      const admins = await User.findAll({
        where: adminsWhere,
        include: adminsInclude,
        limit: 5
      });

      // 5. Search School Admins
      const schoolAdminsWhere = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${q}%` } },
          { last_name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      };
      const schoolAdminsInclude = [
        {
          model: Role,
          where: { role_name: 'SCHOOL_ADMIN' },
          required: true
        }
      ];
      if (isSchoolAdmin) {
        schoolAdminsInclude.push({
          model: SchoolAdminMapping,
          where: { school_id: schoolId || 0 },
          required: true
        });
      } else if (isRegionalAdmin) {
        schoolAdminsInclude.push({
          model: SchoolAdminMapping,
          required: true,
          include: [{
            model: School,
            required: true,
            include: [{
              association: 'District',
              where: stateIds.length > 0 ? { state_id: { [Op.in]: stateIds } } : { state_id: 0 },
              required: true
            }]
          }]
        });
      }
      const schoolAdmins = await User.findAll({
        where: schoolAdminsWhere,
        include: schoolAdminsInclude,
        limit: 5
      });

      // 6. Search Media Submissions
      const mediaWhere = {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { submission_code: { [Op.like]: `%${q}%` } }
        ]
      };
      const mediaInclude = [];
      if (isSchoolAdmin) {
        mediaWhere.school_id = schoolId || 0;
      } else if (isRegionalAdmin) {
        mediaInclude.push({
          model: School,
          required: true,
          include: [{
            association: 'District',
            where: stateIds.length > 0 ? { state_id: { [Op.in]: stateIds } } : { state_id: 0 },
            required: true
          }]
        });
      }
      const media = await MediaSubmission.findAll({
        where: mediaWhere,
        include: mediaInclude,
        limit: 5
      });

      // 7. Search Inspections (InspectionRequests)
      const inspectionsWhere = {
        [Op.or]: [
          { request_code: { [Op.like]: `%${q}%` } },
          { id: q.match(/^\d+$/) ? parseInt(q, 10) : -1 },
          { '$School.school_name$': { [Op.like]: `%${q}%` } }
        ]
      };
      if (isSchoolAdmin) {
        inspectionsWhere.school_id = schoolId || 0;
      }
      const inspectionsInclude = [
        {
          model: School,
          required: true,
          include: isRegionalAdmin ? [{
            association: 'District',
            where: stateIds.length > 0 ? { state_id: { [Op.in]: stateIds } } : { state_id: 0 },
            required: true
          }] : []
        }
      ];
      const inspections = await InspectionRequest.findAll({
        where: inspectionsWhere,
        include: inspectionsInclude,
        limit: 5
      });

      // 8. Search Rankings (SchoolRankSnapshot)
      const rankingsWhere = {
        [Op.or]: [
          { '$School.school_name$': { [Op.like]: `%${q}%` } },
          { '$RankTier.tier_name$': { [Op.like]: `%${q}%` } },
          { total_score: q.match(/^\d+(\.\d+)?$/) ? parseFloat(q) : -1 }
        ]
      };
      if (isSchoolAdmin) {
        rankingsWhere.school_id = schoolId || 0;
      }
      const rankingsInclude = [
        {
          model: School,
          required: true,
          include: isRegionalAdmin ? [{
            association: 'District',
            where: stateIds.length > 0 ? { state_id: { [Op.in]: stateIds } } : { state_id: 0 },
            required: true
          }] : []
        },
        {
          model: RankTier,
          required: false
        }
      ];
      const rankings = await SchoolRankSnapshot.findAll({
        where: rankingsWhere,
        include: rankingsInclude,
        limit: 5
      });

      return res.status(200).json({
        success: true,
        data: {
          states: states.map(s => ({ id: s.id, name: s.state_name, type: 'State', route: '/states' })),
          districts: districts.map(d => ({ id: d.id, name: d.district_name, type: 'District', route: '/districts' })),
          schools: schools.map(s => ({ id: s.id, name: s.school_name, type: 'School', route: '/schools' })),
          regionalAdmins: admins.map(a => ({ id: a.id, name: `${a.first_name} ${a.last_name || ''}`.trim(), type: 'Regional Admin', route: '/regional-admins' })),
          schoolAdmins: schoolAdmins.map(s => ({ id: s.id, name: `${s.first_name} ${s.last_name || ''}`.trim(), type: 'School Admin', route: '/settings' })),
          media: media.map(m => ({ id: m.id, name: m.title, type: 'Media', route: '/media-approvals' })),
          inspections: inspections.map(i => ({ id: i.id, name: `Inspection #${i.request_code || i.id} - ${i.School?.school_name || 'School'}`, type: 'Inspection', route: '/inspections' })),
          rankings: rankings.map(r => ({ id: r.id, name: `${r.School?.school_name || 'School'} (Rank: ${r.global_rank || 'N/A'}, Tier: ${r.RankTier?.tier_name || 'N/A'})`, type: 'Ranking', route: '/rankings' }))
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

      const { category, search, startDate, endDate } = req.query;
      const { Op } = require('sequelize');
      const where = {};

      if (category && category !== 'All') {
        if (category === 'Schools') {
          where.entity_type = ['School', 'SchoolOnboardingRequest'];
        } else if (category === 'Inspections') {
          where.entity_type = ['InspectionRequest', 'InspectionReport', 'SchoolInspectionAudit'];
        } else if (category === 'Media') {
          where.entity_type = ['MediaSubmission', 'MediaAsset', 'MediaPublication'];
        } else if (category === 'Rankings') {
          where.entity_type = ['SchoolRankHistory', 'SchoolRankSnapshot', 'RankTier'];
        } else if (category === 'Users') {
          where.entity_type = ['User', 'Role', 'UserRoleAssignment'];
        } else if (category === 'System') {
          where.entity_type = { [Op.or]: [null, { [Op.notIn]: ['School', 'SchoolOnboardingRequest', 'InspectionRequest', 'InspectionReport', 'SchoolInspectionAudit', 'MediaSubmission', 'MediaAsset', 'MediaPublication', 'SchoolRankHistory', 'SchoolRankSnapshot', 'RankTier', 'User', 'Role', 'UserRoleAssignment'] }] };
        }
      }

      if (search && search.trim() !== '') {
        const searchLike = `%${search.trim()}%`;
        where[Op.or] = [
          { action: { [Op.like]: searchLike } },
          { '$User.first_name$': { [Op.like]: searchLike } },
          { '$User.last_name$': { [Op.like]: searchLike } },
          { '$User.email$': { [Op.like]: searchLike } }
        ];
      }

      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.created_at[Op.lte] = end;
        }
      }

      const { count, rows } = await AuditRepository.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [{ association: 'User', attributes: ['id', 'email', 'first_name', 'last_name'] }]
      });

      // Batch resolve school names for the page rows
      const { School, SchoolOnboardingRequest, MediaSubmission, InspectionRequest, InspectionReport, SchoolAdminMapping } = require('../models');
      
      const schoolIdsToFetch = new Set();
      const onboardingReqIds = [];
      const mediaSubIds = [];
      const inspectReqIds = [];
      const inspectReportIds = [];
      const userIdsToCheck = [];

      for (const log of rows) {
        if (log.entity_type === 'School' && log.entity_id) {
          schoolIdsToFetch.add(Number(log.entity_id));
        } else if (log.entity_type === 'SchoolOnboardingRequest' && log.entity_id) {
          onboardingReqIds.push(Number(log.entity_id));
        } else if (log.entity_type === 'MediaSubmission' && log.entity_id) {
          mediaSubIds.push(Number(log.entity_id));
        } else if (log.entity_type === 'InspectionRequest' && log.entity_id) {
          inspectReqIds.push(Number(log.entity_id));
        } else if (log.entity_type === 'InspectionReport' && log.entity_id) {
          inspectReportIds.push(Number(log.entity_id));
        } else if (log.user_id) {
          userIdsToCheck.push(Number(log.user_id));
        }
      }

      // Query database in parallel batches
      const [onboardingRequests, mediaSubmissions, inspectionRequests, inspectionReports, schoolAdminMappings] = await Promise.all([
        onboardingReqIds.length > 0 ? SchoolOnboardingRequest.findAll({ where: { id: onboardingReqIds }, attributes: ['id', 'school_id'] }) : [],
        mediaSubIds.length > 0 ? MediaSubmission.findAll({ where: { id: mediaSubIds }, attributes: ['id', 'school_id'] }) : [],
        inspectReqIds.length > 0 ? InspectionRequest.findAll({ where: { id: inspectReqIds }, attributes: ['id', 'school_id'] }) : [],
        inspectReportIds.length > 0 ? InspectionReport.findAll({ where: { id: inspectReportIds }, include: [{ model: InspectionRequest, attributes: ['school_id'] }] }) : [],
        userIdsToCheck.length > 0 ? SchoolAdminMapping.findAll({ where: { user_id: userIdsToCheck }, attributes: ['user_id', 'school_id'] }) : []
      ]);

      // Collect all school_ids from resolved entities
      onboardingRequests.forEach(r => r.school_id && schoolIdsToFetch.add(Number(r.school_id)));
      mediaSubmissions.forEach(m => m.school_id && schoolIdsToFetch.add(Number(m.school_id)));
      inspectionRequests.forEach(r => r.school_id && schoolIdsToFetch.add(Number(r.school_id)));
      inspectionReports.forEach(r => r.InspectionRequest?.school_id && schoolIdsToFetch.add(Number(r.InspectionRequest.school_id)));
      schoolAdminMappings.forEach(m => m.school_id && schoolIdsToFetch.add(Number(m.school_id)));

      // Fetch school names
      const schools = schoolIdsToFetch.size > 0 
        ? await School.findAll({ where: { id: Array.from(schoolIdsToFetch) }, attributes: ['id', 'school_name'] })
        : [];
      
      const schoolNameMap = schools.reduce((acc, s) => {
        acc[Number(s.id)] = s.school_name;
        return acc;
      }, {});

      // Helper maps for entity to school mapping
      const onboardingMap = onboardingRequests.reduce((acc, r) => { acc[r.id] = r.school_id; return acc; }, {});
      const mediaMap = mediaSubmissions.reduce((acc, m) => { acc[m.id] = m.school_id; return acc; }, {});
      const inspectReqMap = inspectionRequests.reduce((acc, r) => { acc[r.id] = r.school_id; return acc; }, {});
      const inspectReportMap = inspectionReports.reduce((acc, r) => { acc[r.id] = r.InspectionRequest?.school_id; return acc; }, {});
      const userSchoolMap = schoolAdminMappings.reduce((acc, m) => { acc[m.user_id] = m.school_id; return acc; }, {});

      // Map rows to final logs representation
      const resolvedLogs = rows.map(log => {
        let schoolName = 'System / Global';
        let resolvedSchoolId = null;

        if (log.entity_type === 'School' && log.entity_id) {
          resolvedSchoolId = Number(log.entity_id);
        } else if (log.entity_type === 'SchoolOnboardingRequest' && log.entity_id) {
          resolvedSchoolId = onboardingMap[log.entity_id];
        } else if (log.entity_type === 'MediaSubmission' && log.entity_id) {
          resolvedSchoolId = mediaMap[log.entity_id];
        } else if (log.entity_type === 'InspectionRequest' && log.entity_id) {
          resolvedSchoolId = inspectReqMap[log.entity_id];
        } else if (log.entity_type === 'InspectionReport' && log.entity_id) {
          resolvedSchoolId = inspectReportMap[log.entity_id];
        } else if (log.user_id) {
          resolvedSchoolId = userSchoolMap[log.user_id];
        }

        if (resolvedSchoolId && schoolNameMap[resolvedSchoolId]) {
          schoolName = schoolNameMap[resolvedSchoolId];
        }

        // Determine log status (e.g. SUCCESS vs WARNING)
        let status = 'SUCCESS';
        const actionLower = (log.action || '').toLowerCase();
        if (actionLower.includes('reject') || actionLower.includes('delete') || actionLower.includes('fail') || actionLower.includes('disable')) {
          status = 'WARNING';
        }

        const logObj = log.toJSON ? log.toJSON() : log;
        return {
          ...logObj,
          school_name: schoolName,
          status: status
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Audit logs fetched successfully',
        data: {
          logs: resolvedLogs,
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

      // Check if state is already assigned to a Regional Admin - REMOVED to support multiple admins per state


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
        // Check if state is already assigned to ANOTHER Regional Admin - REMOVED to support multiple admins per state


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

