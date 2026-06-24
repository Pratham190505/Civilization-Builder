const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { UserRepository, SchoolAdminMappingRepository, RegionalAdminScopeRepository } = require('../repositories');
const logger = require('../config/logger');

// Static / In-memory role-to-permission mapping
const ROLE_PERMISSIONS = {
  'SUPER_ADMIN': [
    'VIEW_STATES', 'MANAGE_STATES', 'VIEW_DISTRICTS', 'MANAGE_DISTRICTS', 'VIEW_SCHOOLS',
    'CREATE_SCHOOL', 'UPDATE_SCHOOL', 'DELETE_SCHOOL', 'APPROVE_SCHOOL', 'REVIEW_MEDIA',
    'APPROVE_MEDIA', 'PUBLISH_MEDIA', 'RECALCULATE_RANKINGS', 'VIEW_ANALYTICS',
    'VIEW_AUDIT_LOGS', 'MANAGE_SECURITY', 'MANAGE_RECOMMENDATIONS', 'SCHEDULE_INSPECTIONS',
    'COMPLETE_INSPECTIONS'
  ],
  'REGIONAL_ADMIN': [
    'VIEW_STATES', 'VIEW_DISTRICTS', 'VIEW_SCHOOLS', 'CREATE_SCHOOL', 'UPDATE_SCHOOL',
    'REVIEW_MEDIA', 'PUBLISH_MEDIA', 'VIEW_ANALYTICS', 'SCHEDULE_INSPECTIONS',
    'COMPLETE_INSPECTIONS', 'MANAGE_RECOMMENDATIONS'
  ],
  'DISTRICT_ADMIN': [
    'VIEW_DISTRICTS', 'VIEW_SCHOOLS', 'VIEW_ANALYTICS'
  ],
  'SCHOOL_ADMIN': [
    'VIEW_SCHOOLS', 'UPDATE_SCHOOL', 'VIEW_ANALYTICS', 'VIEW_DISTRICTS', 'VIEW_STATES'
  ]
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No Token Provided',
        errors: ['Authentication token missing']
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token Expired',
          errors: ['Authentication token has expired']
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid Token',
        errors: ['Authentication token verification failed']
      });
    }

    const user = await UserRepository.findWithProfile(decoded.id);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User Unauthorized',
        errors: ['User is deactivated or does not exist']
      });
    }

    // Attach user information to request
    req.user = user;
    
    // Extract user roles (roles table uses role_name column)
    req.user.rolesList = user.Roles.map(r => r.role_name);
    
    // Build user permission list based on roles
    const permissionCodesSet = new Set();
    user.Roles.forEach(role => {
      const perms = ROLE_PERMISSIONS[role.role_name] || [];
      perms.forEach(p => permissionCodesSet.add(p));
    });
    req.user.permissionsList = Array.from(permissionCodesSet);

    // Setup user scope
    req.user.scope = {
      stateId: null,
      stateIds: [],
      schoolId: null,
      districtId: null
    };

    if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
      const mapping = await SchoolAdminMappingRepository.findOne({ 
        where: { user_id: user.id },
        include: [{ model: require('../models').School }]
      });
      logger.info(`[DEBUG_LOG] Logged-in user ID: ${user.id}`);
      logger.info(`[DEBUG_LOG] school_admin_mapping record: ${JSON.stringify(mapping)}`);
      if (mapping) {
        req.user.scope.schoolId = parseInt(mapping.school_id, 10);
        req.user.scope.schoolName = mapping.School?.school_name || null;
      }
    }

    if (req.user.rolesList.includes('DISTRICT_ADMIN')) {
      const mapping = await SchoolAdminMappingRepository.findOne({ 
        where: { user_id: user.id },
        include: [{ 
          model: require('../models').School,
          include: [{ model: require('../models').District }]
        }]
      });
      if (mapping && mapping.School) {
        req.user.scope.schoolId = parseInt(mapping.school_id, 10);
        req.user.scope.schoolName = mapping.School.school_name || null;
        req.user.scope.districtId = parseInt(mapping.School.district_id, 10);
        req.user.scope.districtName = mapping.School.District?.district_name || null;
        req.user.scope.stateId = mapping.School.District?.state_id ? parseInt(mapping.School.District.state_id, 10) : null;
      }
    }

    if (req.user.rolesList.includes('REGIONAL_ADMIN')) {
      const scopes = await RegionalAdminScopeRepository.findAll({ 
        where: { user_id: user.id },
        include: [{ model: require('../models').State }]
      });
      if (scopes && scopes.length > 0) {
        const stateIds = scopes.map(s => parseInt(s.state_id, 10));
        req.user.scope.stateIds = stateIds;
        req.user.scope.stateId = stateIds[0]; // Backwards compatibility
        const stateNames = scopes.map(s => s.State?.state_name).filter(Boolean);
        req.user.scope.stateName = stateNames.join(', ') || null;
        const stateCodes = scopes.map(s => s.State?.state_code).filter(Boolean);
        req.user.scope.stateCode = stateCodes.join(', ') || null;
      }
    }

    next();
  } catch (error) {
    logger.error('Authentication Middleware Error: %o', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      errors: [error.message]
    });
  }
};

module.exports = {
  authenticate,
  ROLE_PERMISSIONS
};
