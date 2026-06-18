const { 
  StateRepository, DistrictRepository, SchoolRepository, SchoolOnboardingRequestRepository 
} = require('../repositories');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger');

class SchoolController {
  // State CRUD
  async getStates(req, res) {
    try {
      const states = await StateRepository.findAll();
      return res.status(200).json({ success: true, message: 'States fetched successfully', data: states });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch states', errors: [error.message] });
    }
  }

  async createState(req, res) {
    try {
      const data = {
        state_name: req.body.state_name || req.body.name,
        state_code: req.body.state_code || req.body.code,
        is_active: req.body.is_active !== undefined ? req.body.is_active : 1
      };
      const state = await StateRepository.create(data);
      return res.status(201).json({ success: true, message: 'State created successfully', data: state });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to create state', errors: [error.message] });
    }
  }

  async updateState(req, res) {
    try {
      const data = {};
      if (req.body.state_name || req.body.name) data.state_name = req.body.state_name || req.body.name;
      if (req.body.state_code || req.body.code) data.state_code = req.body.state_code || req.body.code;
      if (req.body.is_active !== undefined) data.is_active = req.body.is_active;

      const state = await StateRepository.update(req.params.id, data);
      if (!state) return res.status(404).json({ success: false, message: 'State not found', errors: [] });
      return res.status(200).json({ success: true, message: 'State updated successfully', data: state });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update state', errors: [error.message] });
    }
  }

  async deleteState(req, res) {
    try {
      const success = await StateRepository.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'State not found', errors: [] });
      return res.status(200).json({ success: true, message: 'State deleted successfully', data: {} });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete state', errors: [error.message] });
    }
  }

  // District CRUD
  async getDistricts(req, res) {
    try {
      const districts = await DistrictRepository.findAll({ include: ['State'] });
      return res.status(200).json({ success: true, message: 'Districts fetched successfully', data: districts });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch districts', errors: [error.message] });
    }
  }

  async createDistrict(req, res) {
    try {
      const data = {
        state_id: req.body.state_id,
        district_name: req.body.district_name || req.body.name,
        district_code: req.body.district_code || req.body.code,
        is_active: req.body.is_active !== undefined ? req.body.is_active : 1
      };
      const district = await DistrictRepository.create(data);
      return res.status(201).json({ success: true, message: 'District created successfully', data: district });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to create district', errors: [error.message] });
    }
  }

  async updateDistrict(req, res) {
    try {
      const data = {};
      if (req.body.state_id) data.state_id = req.body.state_id;
      if (req.body.district_name || req.body.name) data.district_name = req.body.district_name || req.body.name;
      if (req.body.district_code || req.body.code) data.district_code = req.body.district_code || req.body.code;
      if (req.body.is_active !== undefined) data.is_active = req.body.is_active;

      const district = await DistrictRepository.update(req.params.id, data);
      if (!district) return res.status(404).json({ success: false, message: 'District not found', errors: [] });
      return res.status(200).json({ success: true, message: 'District updated successfully', data: district });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update district', errors: [error.message] });
    }
  }

  async deleteDistrict(req, res) {
    try {
      const success = await DistrictRepository.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'District not found', errors: [] });
      return res.status(200).json({ success: true, message: 'District deleted successfully', data: {} });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete district', errors: [error.message] });
    }
  }

  // School CRUD
  async getSchools(req, res) {
    try {
      const { districtId, stateId, status } = req.query;
      const where = {};
      
      if (status) where.status = status;
      if (districtId) where.district_id = districtId;

      const include = [{ model: DistrictRepository.model, include: ['State'] }];
      if (stateId) {
        include[0].where = { state_id: stateId };
      }

      // If user has Regional Admin scope, filter by state automatically
      if (req.user.rolesList.includes('REGIONAL_ADMIN')) {
        include[0].where = { state_id: req.user.scope.stateIds };
      }
      
      // If user has School Admin scope, filter by school ID
      if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        where.id = req.user.scope.schoolId;
      }

      const schools = await SchoolRepository.findAll({ where, include });
      return res.status(200).json({ success: true, message: 'Schools fetched successfully', data: schools });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch schools', errors: [error.message] });
    }
  }

  async createSchool(req, res) {
    try {
      // By default, schools start as PENDING approval
      const schoolData = {
        district_id: req.body.district_id,
        school_name: req.body.school_name || req.body.name,
        school_code: req.body.school_code || req.body.code,
        udise_code: req.body.udise_code || null,
        principal_name: req.body.principal_name || null,
        email: req.body.email || null,
        mobile: req.body.mobile || req.body.phone || null,
        address: req.body.address || null,
        student_count: req.body.student_count || 0,
        teacher_count: req.body.teacher_count || 0,
        media_upload_enabled: req.body.media_upload_enabled !== undefined ? req.body.media_upload_enabled : 1,
        status: 'PENDING'
      };
      const school = await SchoolRepository.create(schoolData);

      // Create initial onboarding request
      await SchoolOnboardingRequestRepository.create({
        school_id: school.id,
        submitted_by: req.user.id,
        status: 'PENDING'
      });

      // Send real-time notification to Super Admin
      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'SCHOOL_APPROVED', // Category matching school onboarding
        title: 'New School Onboarding Request',
        message: `${school.school_name} has requested onboarding. Approval required.`,
        targetRole: 'SUPER_ADMIN'
      });

      return res.status(201).json({ success: true, message: 'School registration submitted. Pending approval.', data: school });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to create school onboarding request', errors: [error.message] });
    }
  }

  async updateSchool(req, res) {
    try {
      const schoolData = {};
      if (req.body.district_id) schoolData.district_id = req.body.district_id;
      if (req.body.school_name || req.body.name) schoolData.school_name = req.body.school_name || req.body.name;
      if (req.body.school_code || req.body.code) schoolData.school_code = req.body.school_code || req.body.code;
      if (req.body.udise_code !== undefined) schoolData.udise_code = req.body.udise_code;
      if (req.body.principal_name !== undefined) schoolData.principal_name = req.body.principal_name;
      if (req.body.email !== undefined) schoolData.email = req.body.email;
      if (req.body.mobile || req.body.phone) schoolData.mobile = req.body.mobile || req.body.phone;
      if (req.body.address !== undefined) schoolData.address = req.body.address;
      if (req.body.student_count !== undefined) schoolData.student_count = req.body.student_count;
      if (req.body.teacher_count !== undefined) schoolData.teacher_count = req.body.teacher_count;
      if (req.body.media_upload_enabled !== undefined) schoolData.media_upload_enabled = req.body.media_upload_enabled;
      if (req.body.status) schoolData.status = req.body.status;

      const school = await SchoolRepository.update(req.params.id, schoolData);
      if (!school) return res.status(404).json({ success: false, message: 'School not found', errors: [] });
      return res.status(200).json({ success: true, message: 'School details updated successfully', data: school });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update school details', errors: [error.message] });
    }
  }

  async deleteSchool(req, res) {
    try {
      const success = await SchoolRepository.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'School not found', errors: [] });
      return res.status(200).json({ success: true, message: 'School deleted successfully', data: {} });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete school', errors: [error.message] });
    }
  }

  // School approval workflows
  async approveSchool(req, res) {
    try {
      const schoolId = req.params.id;
      const school = await SchoolRepository.findById(schoolId);
      if (!school) return res.status(404).json({ success: false, message: 'School not found', errors: [] });

      await school.update({ status: 'APPROVED' });

      // Update onboarding logs
      const reqLog = await SchoolOnboardingRequestRepository.findOne({
        where: { school_id: schoolId, status: 'PENDING' }
      });
      if (reqLog) {
        await reqLog.update({
          status: 'APPROVED',
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
          remarks: req.body.comments || 'School onboarding approved.'
        });
      }

      // Notify School Admins for this school
      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'SCHOOL_APPROVED',
        title: 'School Onboarding Approved',
        message: `Your school onboarding request for ${school.school_name} has been approved.`,
        targetSchoolId: school.id
      });

      return res.status(200).json({ success: true, message: 'School onboarding approved successfully', data: school });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'School approval failed', errors: [error.message] });
    }
  }

  async rejectSchool(req, res) {
    try {
      const schoolId = req.params.id;
      const school = await SchoolRepository.findById(schoolId);
      if (!school) return res.status(404).json({ success: false, message: 'School not found', errors: [] });

      await school.update({ status: 'REJECTED' });

      const reqLog = await SchoolOnboardingRequestRepository.findOne({
        where: { school_id: schoolId, status: 'PENDING' }
      });
      if (reqLog) {
        await reqLog.update({
          status: 'REJECTED',
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
          remarks: req.body.comments || 'School onboarding rejected.'
        });
      }

      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'SCHOOL_REJECTED',
        title: 'School Onboarding Rejected',
        message: `Your school onboarding request for ${school.school_name} has been rejected.`,
        targetSchoolId: school.id
      });

      return res.status(200).json({ success: true, message: 'School onboarding rejected successfully', data: school });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'School rejection failed', errors: [error.message] });
    }
  }
}

module.exports = new SchoolController();
