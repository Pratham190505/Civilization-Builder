const { SchoolLog, AuditLog } = require('../models');

async function logSchoolEvent(schoolId, actionType, actionDescription, performedBy, transaction = null) {
  try {
    // 1. Create School Log
    await SchoolLog.create({
      school_id: schoolId,
      action_type: actionType,
      action_description: actionDescription,
      performed_by: performedBy,
      created_at: new Date()
    }, { transaction });

    // 2. Create Audit Log
    await AuditLog.create({
      user_id: performedBy,
      action: actionDescription,
      entity_type: 'School',
      entity_id: schoolId,
      created_at: new Date()
    }, { transaction });
  } catch (err) {
    console.error('Failed to log school event:', err);
  }
}

module.exports = {
  logSchoolEvent
};
