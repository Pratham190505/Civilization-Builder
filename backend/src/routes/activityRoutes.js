const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/ActivityController');
const { authenticate } = require('../middleware/auth');
const { checkSchoolScope } = require('../middleware/scope');
const { validate } = require('../middleware/validate');
const { activitySchema, achievementSchema } = require('../validations/schemas');
const mediaStorage = require('../services/mediaStorageService');
const { auditLog } = require('../middleware/audit');

const upload = mediaStorage.getMulterMiddleware();

// Activity routes
router.post('/activities', authenticate, checkSchoolScope, validate(activitySchema), auditLog('Activity created', 'Activity', (req) => req.body.id), ActivityController.createActivity);
router.put('/activities/:id', authenticate, checkSchoolScope, validate(activitySchema), auditLog('Activity updated', 'Activity'), ActivityController.updateActivity);
router.delete('/activities/:id', authenticate, checkSchoolScope, auditLog('Activity deleted', 'Activity'), ActivityController.deleteActivity);
router.get('/activities/school/:schoolId', authenticate, checkSchoolScope, ActivityController.getActivitiesBySchool);

// Achievements routes
router.post('/achievements', authenticate, checkSchoolScope, validate(achievementSchema), auditLog('Achievement created', 'Achievement', (req) => req.body.id), ActivityController.createAchievement);
router.post('/achievements/:id/assets', authenticate, checkSchoolScope, upload.single('file'), ActivityController.uploadAchievementAsset);

module.exports = router;
