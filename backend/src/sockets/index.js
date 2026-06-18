const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { UserRepository, SchoolAdminMappingRepository, RegionalAdminScopeRepository } = require('../repositories');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger');

let ioInstance = null;

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust to specific origins in production
      methods: ['GET', 'POST']
    }
  });

  ioInstance = io;

  // Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await UserRepository.findWithProfile(decoded.id);

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('Authentication error: User inactive or invalid'));
      }

      const rolesList = user.Roles.map(r => r.role_name);
      const scope = {
        stateId: null,
        stateIds: [],
        schoolId: null
      };

      if (rolesList.includes('SCHOOL_ADMIN')) {
        const mapping = await SchoolAdminMappingRepository.findOne({ where: { user_id: user.id } });
        if (mapping) {
          scope.schoolId = parseInt(mapping.school_id, 10);
        }
      }

      if (rolesList.includes('REGIONAL_ADMIN')) {
        const scopes = await RegionalAdminScopeRepository.findAll({ where: { user_id: user.id } });
        if (scopes && scopes.length > 0) {
          const stateIds = scopes.map(s => parseInt(s.state_id, 10));
          scope.stateIds = stateIds;
          scope.stateId = stateIds[0];
        }
      }

      // Attach user details to socket
      socket.user = {
        id: user.id,
        email: user.email,
        roles: rolesList,
        scope
      };

      next();
    } catch (err) {
      logger.warn('Socket connection authentication failed: %s', err.message);
      return next(new Error('Authentication error: Token verification failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info(`Socket client connected: User ID ${user.id} (${socket.id})`);

    // 1. Join user-specific room
    socket.join(`user:${user.id}`);

    // 2. Join role-specific rooms
    user.roles.forEach(role => {
      socket.join(`role:${role}`);
    });

    // 3. Join regional/school scoped rooms
    if (user.scope.stateId) {
      socket.join(`state:${user.scope.stateId}`);
    }
    if (user.scope.stateIds && user.scope.stateIds.length > 0) {
      user.scope.stateIds.forEach(sid => {
        socket.join(`state:${sid}`);
      });
    }
    if (user.scope.schoolId) {
      socket.join(`school:${user.scope.schoolId}`);
    }

    // Direct message test listener
    socket.on('send_direct_message', (data) => {
      logger.info('DM received on socket: %o', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: User ID ${user.id} (${socket.id})`);
    });
  });

  // 4. Hook into local NotificationService events for real-time broadcasts
  notificationService.on('notification_created', (data) => {
    const { notification, recipients, targetRole, targetSchoolId, targetStateId } = data;

    if (ioInstance) {
      // If direct recipients list provided, emit to their individual rooms
      if (recipients && recipients.length > 0) {
        recipients.forEach(userId => {
          ioInstance.to(`user:${userId}`).emit('notification', notification);
        });
      } else if (targetRole) {
        const roleName = targetRole.toUpperCase().replace(' ', '_');
        ioInstance.to(`role:${roleName}`).emit('notification', notification);
      } else if (targetSchoolId) {
        ioInstance.to(`school:${targetSchoolId}`).emit('notification', notification);
      } else if (targetStateId) {
        ioInstance.to(`state:${targetStateId}`).emit('notification', notification);
      } else {
        ioInstance.emit('notification', notification);
      }
    }
  });

  return io;
};

const getIO = () => {
  return ioInstance;
};

module.exports = {
  initializeSocket,
  getIO
};
