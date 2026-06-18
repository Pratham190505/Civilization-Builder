const { 
  School, District, State, SchoolRecommendation, MediaSubmission, SchoolActivity, SchoolAchievement 
} = require('../models');
const logger = require('../config/logger');

const checkSchoolScope = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User context missing', errors: [] });
    }

    // Super Admin has global scope
    if (user.rolesList.includes('SUPER_ADMIN')) {
      return next();
    }

    // Determine School ID
    let schoolId = req.params.schoolId || req.query.schoolId || req.body.school_id;

    if (!schoolId && req.params.id) {
      const idVal = parseInt(req.params.id, 10);
      const fullPath = (req.baseUrl || '') + (req.path || '');

      if (fullPath.includes('/schools/') || fullPath.includes('/school/')) {
        schoolId = idVal;
      } else if (fullPath.includes('/recommendations/')) {
        const recommendation = await SchoolRecommendation.findByPk(idVal);
        schoolId = recommendation ? recommendation.school_id : null;
      } else if (fullPath.includes('/media/')) {
        const submission = await MediaSubmission.findByPk(idVal);
        schoolId = submission ? submission.school_id : null;
      } else if (fullPath.includes('/activities/')) {
        const activity = await SchoolActivity.findByPk(idVal);
        schoolId = activity ? activity.school_id : null;
      } else if (fullPath.includes('/achievements/')) {
        const achievement = await SchoolAchievement.findByPk(idVal);
        schoolId = achievement ? achievement.school_id : null;
      }
    }

    // Parse to Integer if present
    if (schoolId) {
      schoolId = parseInt(schoolId, 10);
    } else {
      // If no schoolId specified, check if School Admin is accessing their own school
      if (user.rolesList.includes('SCHOOL_ADMIN')) {
        schoolId = user.scope.schoolId;
      } else {
        return next();
      }
    }

    // School Admin validation
    if (user.rolesList.includes('SCHOOL_ADMIN')) {
      if (schoolId !== user.scope.schoolId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Out of Scope',
          errors: ['School Admins can only access their assigned school']
        });
      }
      return next();
    }

    // Regional Admin validation
    if (user.rolesList.includes('REGIONAL_ADMIN')) {
      const school = await School.findByPk(schoolId, {
        include: [{ model: District }]
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'Resource Not Found',
          errors: [`School with ID ${schoolId} not found`]
        });
      }

      const schoolStateId = school.District?.state_id;
      if (!schoolStateId || !user.scope.stateIds.includes(parseInt(schoolStateId, 10))) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Out of Scope',
          errors: ['Regional Admins can only access schools in their assigned state(s)']
        });
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access Denied',
      errors: ['Insufficient role context']
    });
  } catch (error) {
    logger.error('checkSchoolScope Middleware Error: %o', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      errors: [error.message]
    });
  }
};

const checkStateScope = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.rolesList.includes('SUPER_ADMIN')) {
      return next();
    }

    let stateId = req.params.stateId || req.params.id || req.query.stateId || req.body.state_id;
    if (stateId) {
      stateId = parseInt(stateId, 10);
    } else {
      return next();
    }

    if (user.rolesList.includes('REGIONAL_ADMIN')) {
      if (!user.scope.stateIds.includes(stateId)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Out of Scope',
          errors: ['Regional Admins can only access their assigned state(s)']
        });
      }
      return next();
    }

    if (user.rolesList.includes('SCHOOL_ADMIN')) {
      // School Admins can only access their school's state
      const school = await School.findByPk(user.scope.schoolId, {
        include: [{ model: District }]
      });
      if (school && school.District && parseInt(school.District.state_id, 10) === stateId) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Out of Scope',
        errors: ['School Admins can only access resources in their own state']
      });
    }

    return res.status(403).json({ success: false, message: 'Access Denied: Invalid role scope', errors: [] });
  } catch (error) {
    logger.error('checkStateScope Middleware Error: %o', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', errors: [error.message] });
  }
};

module.exports = {
  checkSchoolScope,
  checkStateScope
};
