const { AuditRepository } = require('../repositories');
const logger = require('../config/logger');

const auditLog = (actionName, targetType, targetIdExtractor) => {
  return (req, res, next) => {
    res.on('finish', async () => {
      try {
        // Only log successful actions (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const userId = req.user ? req.user.id : null;
          let targetId = null;

          if (typeof targetIdExtractor === 'function') {
            targetId = targetIdExtractor(req);
          } else if (req.params.id) {
            targetId = parseInt(req.params.id, 10);
          } else if (req.body.id) {
            targetId = parseInt(req.body.id, 10);
          }

          // If targetId is not a valid number, ignore it
          if (targetId && isNaN(targetId)) {
            targetId = null;
          }

          // Strip sensitive fields from details
          const sanitizedBody = { ...req.body };
          delete sanitizedBody.password;
          delete sanitizedBody.password_hash;
          delete sanitizedBody.token;
          delete sanitizedBody.refresh_token;

          await AuditRepository.create({
            user_id: userId,
            action: actionName,
            entity_type: targetType || null,
            entity_id: targetId,
            old_value: null,
            new_value: {
              method: req.method,
              url: req.originalUrl,
              body: sanitizedBody,
              query: req.query,
              params: req.params
            },
            ip_address: req.ip || req.connection?.remoteAddress || '127.0.0.1'
          });
        }
      } catch (err) {
        logger.error('Audit Logging Middleware Error: %o', err);
      }
    });
    
    next();
  };
};

module.exports = {
  auditLog
};
