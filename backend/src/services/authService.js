const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { UserRepository, ImpersonationSessionRepository } = require('../repositories');
const logger = require('../config/logger');

class AuthService {
  async generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email
    };

    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn
    });

    return { accessToken, refreshToken };
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is deactivated');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Update user last login
    await UserRepository.update(user.id, { last_login: new Date() });

    // Fetch user details with roles and scope mappings
    const userProfile = await UserRepository.findWithProfile(user.id);
    const roles = userProfile.Roles.map(r => r.role_name);

    // Build scope dynamically based on role
    const scope = { schoolId: null, stateId: null, stateIds: [], schoolName: null, stateName: null, stateCode: null };

    if (roles.includes('SCHOOL_ADMIN')) {
      const { SchoolAdminMappingRepository } = require('../repositories');
      const { School } = require('../models');
      const mapping = await SchoolAdminMappingRepository.findOne({
        where: { user_id: user.id },
        include: [{ model: School }]
      });
      if (mapping) {
        scope.schoolId = parseInt(mapping.school_id, 10);
        scope.schoolName = mapping.School?.school_name || null;
      }
    }

    if (roles.includes('REGIONAL_ADMIN')) {
      const { RegionalAdminScopeRepository } = require('../repositories');
      const { State } = require('../models');
      const scopes = await RegionalAdminScopeRepository.findAll({
        where: { user_id: user.id },
        include: [{ model: State }]
      });
      if (scopes && scopes.length > 0) {
        const stateIds = scopes.map(s => parseInt(s.state_id, 10));
        scope.stateIds = stateIds;
        scope.stateId = stateIds[0];
        scope.stateName = scopes.map(s => s.State?.state_name).filter(Boolean).join(', ') || null;
        scope.stateCode = scopes.map(s => s.State?.state_code).filter(Boolean).join(', ') || null;
      }
    }

    return {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        mobile: userProfile.mobile || null,
        roles,
        scope
      },
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken, ipAddress, userAgent) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
      
      const user = await UserRepository.findById(decoded.id);
      if (!user || user.status !== 'ACTIVE') {
        throw new Error('User not found or inactive');
      }

      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (err) {
      logger.warn('Refresh token failed: %s', err.message);
      throw new Error('Unauthorized refresh action');
    }
  }

  async logout(refreshToken) {
    // Stateless logout
    return true;
  }

  async impersonate(adminId, impersonatedUserId, ipAddress, userAgent) {
    const admin = await UserRepository.findWithProfile(adminId);
    const isAdmin = admin.Roles.some(r => r.role_name === 'SUPER_ADMIN');
    
    if (!isAdmin) {
      throw new Error('Unauthorized: Impersonation is only allowed for Super Admins');
    }

    const targetUser = await UserRepository.findWithProfile(impersonatedUserId);
    if (!targetUser) {
      throw new Error('Target user to impersonate not found');
    }

    if (targetUser.status !== 'ACTIVE') {
      throw new Error('Target user account is deactivated');
    }

    const { accessToken, refreshToken } = await this.generateTokens(targetUser);

    // Record impersonation session audit
    await ImpersonationSessionRepository.create({
      super_admin_id: adminId,
      impersonated_user_id: impersonatedUserId,
      start_time: new Date(),
      reason: 'Admin impersonation'
    });

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
        roles: targetUser.Roles.map(r => r.role_name)
      },
      accessToken,
      refreshToken,
      impersonator: {
        id: admin.id,
        name: `${admin.first_name} ${admin.last_name}`
      }
    };
  }
}

module.exports = new AuthService();
