const express = require('express');
const router = express.Router();
const InspectionController = require('../controllers/InspectionController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { checkSchoolScope } = require('../middleware/scope');
const { validate } = require('../middleware/validate');
const { inspectionRequestSchema, inspectionScheduleSchema, inspectionCompleteSchema } = require('../validations/schemas');
const { auditLog } = require('../middleware/audit');

router.post('/request', authenticate, checkSchoolScope, validate(inspectionRequestSchema), auditLog('Inspection requested', 'InspectionRequest', (req) => req.body.school_id), InspectionController.requestInspection);
router.post('/schedule', authenticate, authorize(['SCHEDULE_INSPECTIONS']), validate(inspectionScheduleSchema), auditLog('Inspection scheduled', 'InspectionReport', (req) => req.body.requestId), InspectionController.scheduleInspection);
router.post('/complete', authenticate, authorize(['COMPLETE_INSPECTIONS']), validate(inspectionCompleteSchema), auditLog('Inspection completed', 'InspectionReport', (req) => req.body.reportId), InspectionController.completeInspection);
router.get('/reports', authenticate, InspectionController.getInspectionReports);
router.get('/requests', authenticate, InspectionController.getInspectionRequests);

module.exports = router;
