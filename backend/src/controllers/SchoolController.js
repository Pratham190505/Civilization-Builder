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

      try {
        await notificationService.sendNotification({
          senderId: req.user?.id || 1,
          type: 'STATE_CREATED',
          title: 'New State Created',
          message: `A new state "${data.state_name}" (${data.state_code}) has been created.`,
          targetRole: 'SUPER_ADMIN'
        });
      } catch (notifErr) {
        console.warn('Failed to send notification for State creation:', notifErr);
      }

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
      const { District, RegionalAdminScope } = require('../models');
      const stateId = req.params.id;

      // Check for districts
      const districtCount = await District.count({ where: { state_id: stateId } });
      if (districtCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete state. There are ${districtCount} active district(s) assigned to this state. Please delete or reassign them first.`
        });
      }

      // Check for regional admin scope
      const scopeCount = await RegionalAdminScope.count({ where: { state_id: stateId } });
      if (scopeCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete state. There are ${scopeCount} Regional Admin(s) assigned to this state. Please delete or reassign them first.`
        });
      }

      const success = await StateRepository.delete(stateId);
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
      
      if (status) {
        if (status !== 'ALL') {
          where.status = status;
        }
      } else {
        // Default to APPROVED schools for non-super admin roles
        if (!req.user.rolesList.includes('SUPER_ADMIN')) {
          where.status = 'APPROVED';
        }
      }
      
      if (districtId) where.district_id = districtId;

      const include = [
        { 
          model: DistrictRepository.model, 
          include: [{
            model: require('../models').State,
            include: [{
              model: require('../models').RegionalAdminScope,
              include: [{
                model: require('../models').User,
                attributes: ['id', 'email', 'first_name', 'last_name']
              }]
            }]
          }]
        },
        {
          model: require('../models').SchoolAdminMapping,
          include: [{ model: require('../models').User, attributes: ['id', 'email', 'first_name', 'last_name'] }]
        }
      ];
      if (stateId) {
        include[0].where = { state_id: stateId };
      }

      // If user has Regional Admin scope, show schools under their state(s)
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
    const { User, Role, UserRoleAssignment, School, SchoolAdminMapping, SchoolOnboardingRequest, InspectionRequest, sequelize } = require('../models');
    const transaction = await sequelize.transaction();
    try {
      const {
        district_id,
        school_name,
        name,
        school_code,
        code,
        school_type,
        affiliation_board,
        email,
        mobile,
        phone,
        alternate_mobile,
        website,
        establishment_year,
        logo_url,
        city,
        taluka,
        pin_code,
        address,
        principal_name,
        principal_qualification,
        principal_email,
        principal_mobile,
        student_count,
        boys_count,
        girls_count,
        teacher_count,
        male_teachers_count,
        female_teachers_count,
        non_teaching_staff_count,
        classrooms_count,
        labs_count,
        computer_labs_count,
        library_available,
        playground_available,
        smart_classrooms_count,
        auditorium_available,
        transport_available,
        description,
        achievements,
        facebook_url,
        instagram_url,
        youtube_url,
        notes,
        
        // Admin user account details
        admin_name,
        admin_email,
        admin_mobile,
        admin_password
      } = req.body;

      const final_district_id = district_id;
      const final_school_name = school_name || name;
      const final_school_code = school_code || code;

      if (!final_district_id || !final_school_name || !final_school_code) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Validation failed', errors: ['Missing required fields: district_id, school_name, school_code'] });
      }

      // Enforce Regional Admin state scope validation
      if (req.user.rolesList.includes('REGIONAL_ADMIN')) {
        const { District } = require('../models');
        const district = await District.findByPk(final_district_id);
        if (!district) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: 'Selected district does not exist' });
        }
        const stateIds = req.user.scope.stateIds.map(Number);
        if (!stateIds.includes(Number(district.state_id))) {
          await transaction.rollback();
          return res.status(403).json({ success: false, message: 'Forbidden: You can only onboard schools within your scoped state.' });
        }
      }

      // Validate unique school code
      const existingCode = await School.findOne({ where: { school_code: final_school_code } });
      if (existingCode) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Validation failed', errors: [`School code '${final_school_code}' is already registered.`] });
      }

      // Validate unique UDISE code
      const final_udise_code = req.body.udise_code || null;
      if (final_udise_code) {
        const existingUdise = await School.findOne({ where: { udise_code: final_udise_code } });
        if (existingUdise) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: 'Validation failed', errors: [`UDISE code '${final_udise_code}' is already registered.`] });
        }
      }

      // Validate unique School Admin Email if provided
      let createdUser = null;
      if (admin_email) {
        const existingEmail = await User.findOne({ where: { email: admin_email } });
        if (existingEmail) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: 'Validation failed', errors: [`School admin email '${admin_email}' is already registered.`] });
        }
      }

      // 1. Create School Record
      const school = await School.create({
        district_id: parseInt(final_district_id, 10),
        school_name: final_school_name,
        school_code: final_school_code,
        udise_code: final_udise_code,
        school_type: school_type || null,
        affiliation_board: affiliation_board || null,
        email: email || null,
        mobile: mobile || phone || null,
        alternate_mobile: alternate_mobile || null,
        website: website || null,
        establishment_year: establishment_year ? parseInt(establishment_year, 10) : null,
        logo_url: logo_url || null,
        city: city || null,
        taluka: taluka || null,
        pin_code: pin_code || null,
        address: address || null,
        principal_name: principal_name || null,
        principal_qualification: principal_qualification || null,
        principal_email: principal_email || null,
        principal_mobile: principal_mobile || null,
        student_count: student_count ? parseInt(student_count, 10) : 0,
        boys_count: boys_count ? parseInt(boys_count, 10) : 0,
        girls_count: girls_count ? parseInt(girls_count, 10) : 0,
        teacher_count: teacher_count ? parseInt(teacher_count, 10) : 0,
        male_teachers_count: male_teachers_count ? parseInt(male_teachers_count, 10) : 0,
        female_teachers_count: female_teachers_count ? parseInt(female_teachers_count, 10) : 0,
        non_teaching_staff_count: non_teaching_staff_count ? parseInt(non_teaching_staff_count, 10) : 0,
        classrooms_count: classrooms_count ? parseInt(classrooms_count, 10) : 0,
        labs_count: labs_count ? parseInt(labs_count, 10) : 0,
        computer_labs_count: computer_labs_count ? parseInt(computer_labs_count, 10) : 0,
        library_available: library_available ? 1 : 0,
        playground_available: playground_available ? 1 : 0,
        smart_classrooms_count: smart_classrooms_count ? parseInt(smart_classrooms_count, 10) : 0,
        auditorium_available: auditorium_available ? 1 : 0,
        transport_available: transport_available ? 1 : 0,
        description: description || null,
        achievements: achievements || null,
        facebook_url: facebook_url || null,
        instagram_url: instagram_url || null,
        youtube_url: youtube_url || null,
        notes: notes || null,
        media_upload_enabled: req.body.media_upload_enabled !== undefined ? (req.body.media_upload_enabled ? 1 : 0) : 1,
        status: 'PENDING'
      }, { transaction });

      // 2. Create School Admin User if details are provided
      if (admin_name && admin_email && admin_password) {
        createdUser = await User.create({
          email: admin_email,
          password_hash: admin_password,
          first_name: admin_name.split(' ')[0] || admin_name,
          last_name: admin_name.split(' ').slice(1).join(' ') || 'Admin',
          mobile: admin_mobile || null,
          user_code: `USR-SCH-${Date.now().toString().slice(-6)}`,
          status: 'ACTIVE'
        }, { transaction });

        // Assign SCHOOL_ADMIN role
        const schoolAdminRole = await Role.findOne({ where: { role_name: 'SCHOOL_ADMIN' } });
        if (schoolAdminRole) {
          await UserRoleAssignment.create({
            user_id: createdUser.id,
            role_id: schoolAdminRole.id
          }, { transaction });
        }

        // Map school admin to school
        await SchoolAdminMapping.create({
          user_id: createdUser.id,
          school_id: school.id
        }, { transaction });
      }

      // 3. Create initial onboarding request
      await SchoolOnboardingRequest.create({
        school_id: school.id,
        submitted_by: req.user.id,
        status: 'PENDING'
      }, { transaction });

      // 4. Automatically generate a pending inspection request
      await InspectionRequest.create({
        request_code: `REQ-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`,
        school_id: school.id,
        requested_by: req.user.id,
        status: 'PENDING',
        request_reason: 'Automatic onboarding inspection request',
        requested_at: new Date()
      }, { transaction });

      await transaction.commit();

      // 5. Send real-time notifications
      // To Super Admin
      try {
        await notificationService.sendNotification({
          senderId: req.user.id,
          type: 'SCHOOL_APPROVED',
          title: 'New School Onboarding Request',
          message: `${school.school_name} has requested onboarding. Approval required.`,
          targetRole: 'SUPER_ADMIN'
        });
      } catch (notifErr) {
        console.warn('Failed to send onboarding notification to Super Admin:', notifErr);
      }

      // To the newly registered School Admin
      if (createdUser) {
        try {
          await notificationService.sendNotification({
            senderId: req.user.id,
            recipientId: createdUser.id,
            type: 'ACCOUNT_CREATED',
            title: 'Welcome to GDS!',
            message: `Your school admin account for ${school.school_name} has been created successfully. Welcome aboard!`
          });
        } catch (notifErr) {
          console.warn('Failed to send welcome notification to School Admin:', notifErr);
        }
      }

      return res.status(201).json({ 
        success: true, 
        message: 'School registration submitted. Pending approval.', 
        data: {
          school,
          adminUser: createdUser ? { id: createdUser.id, email: createdUser.email } : null
        } 
      });

    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to create school onboarding request: %o', error);
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

      // Validate unique school code on update
      if (schoolData.school_code) {
        const existingCode = await SchoolRepository.findOne({ 
          where: { 
            school_code: schoolData.school_code,
            id: { [require('sequelize').Op.ne]: req.params.id }
          } 
        });
        if (existingCode) {
          return res.status(400).json({ success: false, message: 'Validation failed', errors: [`School code '${schoolData.school_code}' is already registered.`] });
        }
      }

      // Validate unique UDISE code on update
      if (schoolData.udise_code) {
        const existingUdise = await SchoolRepository.findOne({ 
          where: { 
            udise_code: schoolData.udise_code,
            id: { [require('sequelize').Op.ne]: req.params.id }
          } 
        });
        if (existingUdise) {
          return res.status(400).json({ success: false, message: 'Validation failed', errors: [`UDISE code '${schoolData.udise_code}' is already registered.`] });
        }
      }

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
