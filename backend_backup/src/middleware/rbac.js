const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errors: ['User context missing']
      });
    }

    // Super Admin bypasses all permission checks
    if (req.user.rolesList.includes('SUPER_ADMIN')) {
      return next();
    }

    const permissions = typeof requiredPermissions === 'string' ? [requiredPermissions] : requiredPermissions;
    
    if (permissions.length === 0) {
      return next();
    }

    // Check if user has all required permissions
    const hasPermission = permissions.every(perm => req.user.permissionsList.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied',
        errors: [`Insufficient permissions. Required: ${permissions.join(', ')}`]
      });
    }

    next();
  };
};

module.exports = {
  authorize
};
