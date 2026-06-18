const express = require('express');
const router = express.Router();
const SchoolController = require('../controllers/SchoolController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { checkSchoolScope, checkStateScope } = require('../middleware/scope');
const { validate } = require('../middleware/validate');
const { stateSchema, districtSchema, schoolSchema, onboardingReviewSchema } = require('../validations/schemas');
const { auditLog } = require('../middleware/audit');

// States routes
router.get('/states', authenticate, authorize(['VIEW_STATES']), SchoolController.getStates);
router.post('/states', authenticate, authorize(['MANAGE_STATES']), validate(stateSchema), auditLog('State created', 'State', (req) => req.body.id), SchoolController.createState);
router.put('/states/:id', authenticate, authorize(['MANAGE_STATES']), checkStateScope, validate(stateSchema), auditLog('State updated', 'State'), SchoolController.updateState);
router.delete('/states/:id', authenticate, authorize(['MANAGE_STATES']), checkStateScope, auditLog('State deleted', 'State'), SchoolController.deleteState);

// Districts routes
router.get('/districts', authenticate, authorize(['VIEW_DISTRICTS']), SchoolController.getDistricts);
router.post('/districts', authenticate, authorize(['MANAGE_DISTRICTS']), validate(districtSchema), auditLog('District created', 'District', (req) => req.body.id), SchoolController.createDistrict);
router.put('/districts/:id', authenticate, authorize(['MANAGE_DISTRICTS']), validate(districtSchema), auditLog('District updated', 'District'), SchoolController.updateDistrict);
router.delete('/districts/:id', authenticate, authorize(['MANAGE_DISTRICTS']), auditLog('District deleted', 'District'), SchoolController.deleteDistrict);

// Schools routes
router.get('/schools', authenticate, SchoolController.getSchools);
router.post('/schools', authenticate, authorize(['CREATE_SCHOOL']), validate(schoolSchema), auditLog('School created', 'School', (req) => req.body.id), SchoolController.createSchool);
router.put('/schools/:id', authenticate, checkSchoolScope, authorize(['UPDATE_SCHOOL']), validate(schoolSchema), auditLog('School updated', 'School'), SchoolController.updateSchool);
router.delete('/schools/:id', authenticate, checkSchoolScope, authorize(['DELETE_SCHOOL']), auditLog('School deleted', 'School'), SchoolController.deleteSchool);

// Onboarding Approval routes
router.post('/schools/:id/approve', authenticate, authorize(['APPROVE_SCHOOL']), validate(onboardingReviewSchema), auditLog('School approved', 'School'), SchoolController.approveSchool);
router.post('/schools/:id/reject', authenticate, authorize(['APPROVE_SCHOOL']), validate(onboardingReviewSchema), auditLog('School rejected', 'School'), SchoolController.rejectSchool);

module.exports = router;
