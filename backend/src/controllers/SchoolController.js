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

      const { Op } = require('sequelize');
      const conflictState = await StateRepository.findOne({
        where: {
          [Op.or]: [
            { state_name: data.state_name },
            { state_code: data.state_code }
          ]
        }
      });
      if (conflictState) {
        const field = conflictState.state_name.toLowerCase() === data.state_name.toLowerCase() ? 'State Name' : 'State Code';
        return res.status(400).json({
          success: false,
          message: `${field} must be unique. A state with this ${field.toLowerCase()} already exists.`,
          errors: [`${field} must be unique.`]
        });
      }

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

      if (data.state_name || data.state_code) {
        const { Op } = require('sequelize');
        const ors = [];
        if (data.state_name) ors.push({ state_name: data.state_name });
        if (data.state_code) ors.push({ state_code: data.state_code });
        
        const conflictState = await StateRepository.findOne({
          where: {
            id: { [Op.ne]: req.params.id },
            [Op.or]: ors
          }
        });
        if (conflictState) {
          const field = data.state_name && conflictState.state_name.toLowerCase() === data.state_name.toLowerCase() ? 'State Name' : 'State Code';
          return res.status(400).json({
            success: false,
            message: `${field} must be unique. A state with this ${field.toLowerCase()} already exists.`,
            errors: [`${field} must be unique.`]
          });
        }
      }

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

      const { Op } = require('sequelize');
      
      // Check duplicate code globally
      const conflictCode = await DistrictRepository.model.findOne({
        where: { district_code: data.district_code }
      });
      if (conflictCode) {
        return res.status(400).json({
          success: false,
          message: `District Code must be unique. A district with code '${data.district_code}' already exists.`,
          errors: ["District code must be unique."]
        });
      }

      // Check duplicate name within the same state
      const conflictName = await DistrictRepository.model.findOne({
        where: {
          state_id: data.state_id,
          district_name: data.district_name
        }
      });
      if (conflictName) {
        return res.status(400).json({
          success: false,
          message: `District Name must be unique within the state. A district with name '${data.district_name}' already exists in this state.`,
          errors: ["District name must be unique within the state."]
        });
      }

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

      const { Op } = require('sequelize');
      const currentDistrict = await DistrictRepository.findById(req.params.id);
      if (!currentDistrict) return res.status(404).json({ success: false, message: 'District not found', errors: [] });

      const finalStateId = data.state_id || currentDistrict.state_id;

      if (data.district_code) {
        const conflictCode = await DistrictRepository.model.findOne({
          where: {
            id: { [Op.ne]: req.params.id },
            district_code: data.district_code
          }
        });
        if (conflictCode) {
          return res.status(400).json({
            success: false,
            message: `District Code must be unique. A district with code '${data.district_code}' already exists.`,
            errors: ["District code must be unique."]
          });
        }
      }

      if (data.district_name || data.state_id) {
        const finalName = data.district_name || currentDistrict.district_name;
        const conflictName = await DistrictRepository.model.findOne({
          where: {
            id: { [Op.ne]: req.params.id },
            state_id: finalStateId,
            district_name: finalName
          }
        });
        if (conflictName) {
          return res.status(400).json({
            success: false,
            message: `District Name must be unique within the state. A district with name '${finalName}' already exists in this state.`,
            errors: ["District name must be unique within the state."]
          });
        }
      }

      const district = await DistrictRepository.update(req.params.id, data);
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

  async getCities(req, res) {
    try {
      const { districtId } = req.params;
      const { School: SchoolModel, District: DistrictModel, sequelize } = require('../models');

      // Query unique cities from existing schools in this district:
      const schools = await SchoolModel.findAll({
        where: { district_id: districtId },
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('city')), 'city']
        ],
        raw: true
      });
      let cities = schools.map(s => s.city).filter(Boolean);

      // Fallback/Default cities for seeded districts to ensure we have values:
      const districtDefaults = {
        'Bengaluru': ["Bengaluru", "Yelahanka", "Kengeri", "Hoskote"],
        'Mysuru': ["Mysuru", "Hunsur", "Nanjangud", "T. Narasipura"],
        'Mumbai': ["Worli", "Bandra", "Andheri", "Colaba"],
        'Pune': ["Kothrud", "Shivaji Nagar", "Hadapsar", "Hinjewadi"],
        'Chennai': ["Adyar", "Velachery", "T. Nagar", "Tambaram"],
        'New Delhi': ["Connaught Place", "Dwarka", "Vasant Kunj", "Karol Bagh"]
      };

      const district = await DistrictModel.findByPk(districtId);
      if (district && districtDefaults[district.district_name]) {
        const defaults = districtDefaults[district.district_name];
        cities = Array.from(new Set([...cities, ...defaults]));
      }

      // If still empty, add a default city derived from district name:
      if (cities.length === 0 && district) {
        cities.push(district.district_name);
      }

      return res.status(200).json({ success: true, data: cities });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch cities', errors: [error.message] });
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
        // Default to APPROVED and AWAITING_INSPECTION schools for regional and district admins, and APPROVED for others
        if (!req.user.rolesList.includes('SUPER_ADMIN') && !req.user.rolesList.includes('SCHOOL_ADMIN')) {
          const { Op } = require('sequelize');
          where.status = { [Op.in]: ['APPROVED', 'AWAITING_INSPECTION'] };
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
      
      // If user has District Admin scope, filter by district ID
      if (req.user.rolesList.includes('DISTRICT_ADMIN')) {
        where.district_id = req.user.scope.districtId;
      }
      
      // If user has School Admin scope, filter by school ID
      if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        where.id = req.user.scope.schoolId;
      }

      const schools = await SchoolRepository.findAll({ where, include });
      logger.info(`[DEBUG_LOG] School API response: ${JSON.stringify(schools)}`);
      return res.status(200).json({ success: true, message: 'Schools fetched successfully', data: schools });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch schools', errors: [error.message] });
    }
  }

  async getSchoolById(req, res) {
    try {
      const { id } = req.params;
      const { School, District, State, InspectionRequest, InspectionReport, MediaSubmission, SchoolRankSnapshot, SchoolRankHistory, RankTier, SchoolScorePeriod, SchoolInspectionAudit, SchoolAdminMapping, User } = require('../models');

      const activePeriod = await SchoolScorePeriod.findOne({
        order: [['start_date', 'DESC']]
      });

      const school = await School.findByPk(id, {
        include: [
          {
            model: District,
            include: [{ model: State }]
          },
          {
            model: InspectionRequest,
            include: [{ model: InspectionReport }]
          },
          {
            model: MediaSubmission,
            required: false
          },
          {
            model: SchoolRankSnapshot,
            where: activePeriod ? { period_id: activePeriod.id } : {},
            required: false,
            include: [{ model: RankTier }]
          },
          {
            model: SchoolRankHistory,
            required: false,
            include: [{ model: RankTier }]
          },
          {
            model: RankTier,
            required: false
          },
          {
            model: SchoolInspectionAudit,
            required: false,
            include: [{ model: User, attributes: ['id', 'email', 'first_name', 'last_name'] }]
          },
          {
            model: SchoolAdminMapping,
            required: false,
            include: [{ model: User, attributes: ['id', 'email', 'first_name', 'last_name', 'mobile'] }]
          }
        ]
      });

      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found' });
      }

      return res.status(200).json({ success: true, data: school });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch school details', errors: [error.message] });
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
        website_url,
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
        website_url: website_url || null,
        notes: notes || null,
        score: null,
        tier_id: null,
        media_upload_enabled: 0,
        joining_date: new Date(),
        status: 'AWAITING_INSPECTION'
      }, { transaction });

      // Log school creation
      const { logSchoolEvent } = require('../utils/schoolLogger');
      await logSchoolEvent(
        school.id,
        'SCHOOL_CREATED',
        `School '${school.school_name}' joined the GDS platform. School ID: ${school.id}. Created By: ${req.user.email} (${req.user.id}). Created Date: ${new Date().toLocaleDateString()}`,
        req.user.id,
        transaction
      );

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
          message: `New school has been registered and is awaiting inspection and ranking assignment.`,
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
      if (req.body.principal_qualification !== undefined) schoolData.principal_qualification = req.body.principal_qualification;
      if (req.body.principal_email !== undefined) schoolData.principal_email = req.body.principal_email;
      if (req.body.principal_mobile !== undefined) schoolData.principal_mobile = req.body.principal_mobile;
      if (req.body.facebook_url !== undefined) schoolData.facebook_url = req.body.facebook_url;
      if (req.body.instagram_url !== undefined) schoolData.instagram_url = req.body.instagram_url;
      if (req.body.youtube_url !== undefined) schoolData.youtube_url = req.body.youtube_url;
      if (req.body.website_url !== undefined) schoolData.website_url = req.body.website_url;

      // School Profile Editable fields
      if (req.body.school_type !== undefined) schoolData.school_type = req.body.school_type;
      if (req.body.affiliation_board !== undefined) schoolData.affiliation_board = req.body.affiliation_board;
      if (req.body.boys_count !== undefined) schoolData.boys_count = req.body.boys_count;
      if (req.body.girls_count !== undefined) schoolData.girls_count = req.body.girls_count;
      if (req.body.male_teachers_count !== undefined) schoolData.male_teachers_count = req.body.male_teachers_count;
      if (req.body.female_teachers_count !== undefined) schoolData.female_teachers_count = req.body.female_teachers_count;
      if (req.body.non_teaching_staff_count !== undefined) schoolData.non_teaching_staff_count = req.body.non_teaching_staff_count;
      if (req.body.classrooms_count !== undefined) schoolData.classrooms_count = req.body.classrooms_count;
      if (req.body.labs_count !== undefined) schoolData.labs_count = req.body.labs_count;
      if (req.body.computer_labs_count !== undefined) schoolData.computer_labs_count = req.body.computer_labs_count;
      if (req.body.library_available !== undefined) schoolData.library_available = req.body.library_available ? 1 : 0;
      if (req.body.playground_available !== undefined) schoolData.playground_available = req.body.playground_available ? 1 : 0;
      if (req.body.smart_classrooms_count !== undefined) schoolData.smart_classrooms_count = req.body.smart_classrooms_count;
      if (req.body.city !== undefined) schoolData.city = req.body.city;
      if (req.body.pin_code !== undefined) schoolData.pin_code = req.body.pin_code;

      // Super Admin score & rank editing overrides
      const isSuperAdmin = req.user && req.user.rolesList && req.user.rolesList.includes('SUPER_ADMIN');
      if (isSuperAdmin) {
        if (req.body.academic_score !== undefined) schoolData.academic_score = req.body.academic_score;
        if (req.body.achievement_score !== undefined) schoolData.achievement_score = req.body.achievement_score;
        if (req.body.media_score !== undefined) schoolData.media_score = req.body.media_score;
        if (req.body.participation_score !== undefined) schoolData.participation_score = req.body.participation_score;

        if (
          schoolData.academic_score !== undefined ||
          schoolData.achievement_score !== undefined ||
          schoolData.media_score !== undefined ||
          schoolData.participation_score !== undefined
        ) {
          const currentSchool = await SchoolRepository.findById(req.params.id);
          const acad = schoolData.academic_score !== undefined ? parseInt(schoolData.academic_score, 10) : (currentSchool.academic_score || 0);
          const ach = schoolData.achievement_score !== undefined ? parseInt(schoolData.achievement_score, 10) : (currentSchool.achievement_score || 0);
          const med = schoolData.media_score !== undefined ? parseInt(schoolData.media_score, 10) : (currentSchool.media_score || 0);
          const part = schoolData.participation_score !== undefined ? parseInt(schoolData.participation_score, 10) : (currentSchool.participation_score || 0);

          const totalScore = acad + ach + med + part;
          schoolData.total_score = totalScore;
          schoolData.score = totalScore;

          // Recalculate rank tier dynamically
          const { RankTier } = require('../models');
          const { Op } = require('sequelize');
          let tier = await RankTier.findOne({
            where: {
              min_score: { [Op.lte]: totalScore },
              max_score: { [Op.gte]: totalScore }
            }
          });
          if (!tier) {
            tier = await RankTier.findOne({ where: { tier_name: 'No Rank' } });
          }
          if (tier) {
            schoolData.tier_id = tier.id;
          }
        }
      }

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

      const { logSchoolEvent } = require('../utils/schoolLogger');
      
      const isSocialMediaUpdate = 
        req.body.facebook_url !== undefined || 
        req.body.instagram_url !== undefined || 
        req.body.youtube_url !== undefined || 
        req.body.website_url !== undefined;

      const isProfileUpdate = 
        req.body.school_name !== undefined ||
        req.body.name !== undefined ||
        req.body.udise_code !== undefined ||
        req.body.principal_name !== undefined ||
        req.body.email !== undefined ||
        req.body.mobile !== undefined ||
        req.body.phone !== undefined ||
        req.body.address !== undefined ||
        req.body.school_type !== undefined ||
        req.body.affiliation_board !== undefined ||
        req.body.student_count !== undefined ||
        req.body.teacher_count !== undefined ||
        req.body.city !== undefined ||
        req.body.pin_code !== undefined;

      if (isSocialMediaUpdate) {
        await logSchoolEvent(school.id, 'SOCIAL_MEDIA_UPDATED', `Social media links updated for School '${school.school_name}'.`, req.user.id);
      }
      if (isProfileUpdate) {
        await logSchoolEvent(school.id, 'SCHOOL_PROFILE_UPDATED', `School profile details updated for School '${school.school_name}'.`, req.user.id);
      }

      // If scores were updated, trigger ranking recalculation
      if (
        isSuperAdmin &&
        (schoolData.academic_score !== undefined ||
         schoolData.achievement_score !== undefined ||
         schoolData.media_score !== undefined ||
         schoolData.participation_score !== undefined)
      ) {
        const { SchoolInspectionAudit, RankTier } = require('../models');
        
        let tierName = 'No Rank';
        if (school.tier_id) {
          const tier = await RankTier.findByPk(school.tier_id);
          if (tier) {
            tierName = tier.tier_name;
          }
        }
        
        await SchoolInspectionAudit.create({
          school_id: school.id,
          assigned_score: school.total_score,
          academic_score: school.academic_score,
          achievement_score: school.achievement_score,
          media_score: school.media_score,
          participation_score: school.participation_score,
          total_score: school.total_score,
          assigned_rank_tier: tierName,
          inspection_date: new Date(),
          assigned_by: req.user.id
        });

        // Log School Ranked
        await logSchoolEvent(school.id, 'SCHOOL_RANKED', `School '${school.school_name}' manual scores updated. Assigned Rank Tier: ${tierName}. Total Score: ${school.total_score}.`, req.user.id);

        const rankingService = require('../services/rankingService');
        await rankingService.recalculateSchoolScore(school.id);
        await rankingService.recalculateAllRankings();
      }

      const updatedSchool = await SchoolRepository.findById(school.id);
      return res.status(200).json({ success: true, message: 'School details updated successfully', data: updatedSchool });
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

      // Log school approval
      const { logSchoolEvent } = require('../utils/schoolLogger');
      await logSchoolEvent(school.id, 'SCHOOL_APPROVED', `School '${school.school_name}' onboarding approved. Approved By: ${req.user.email} (${req.user.id}).`, req.user.id);

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

      // Log school rejection
      const { logSchoolEvent } = require('../utils/schoolLogger');
      await logSchoolEvent(school.id, 'SCHOOL_REJECTED', `School '${school.school_name}' onboarding rejected. Rejected By: ${req.user.email} (${req.user.id}).`, req.user.id);

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
