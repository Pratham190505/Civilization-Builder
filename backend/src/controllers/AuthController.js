const authService = require('../services/authService');
const logger = require('../config/logger');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.login(email, password, ipAddress, userAgent);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      logger.warn('Login attempt failed: %s', error.message);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        errors: [error.message]
      });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const success = await authService.logout(refreshToken);
      
      return res.status(200).json({
        success: true,
        message: success ? 'Logged out successfully' : 'Session not found',
        data: {}
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
        errors: [error.message]
      });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.refresh(refreshToken, ipAddress, userAgent);
      
      return res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        errors: [error.message]
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({
        success: true,
        message: 'User profile fetched successfully',
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile: user.mobile,
          status: user.status,
          roles: user.rolesList,
          permissions: user.permissionsList,
          scope: user.scope
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        errors: [error.message]
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { first_name, last_name, mobile } = req.body;
      const user = await require('../models').User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await user.update({ first_name, last_name, mobile });

      // Trigger audit log manually or implicitly
      await require('../repositories').AuditRepository.create({
        user_id: user.id,
        action: 'Updated profile details',
        entity_name: 'User',
        entity_id: user.id,
        ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
        user_agent: req.headers['user-agent'] || 'unknown',
        created_at: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile: user.mobile,
          status: user.status
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update profile', errors: [error.message] });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }

      const user = await require('../models').User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid current password' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }

      await user.update({ password_hash: newPassword });

      // Send real-time notification
      try {
        const notificationService = require('../services/notificationService');
        await notificationService.sendNotification({
          senderId: user.id,
          recipientId: user.id,
          type: 'PASSWORD_CHANGED',
          title: 'Password Changed Successfully',
          message: `Your account password was updated. If you did not initiate this change, contact support immediately.`
        });
      } catch (notifErr) {
        console.warn('Failed to send notification for Password change:', notifErr);
      }

      // Trigger audit log manually
      await require('../repositories').AuditRepository.create({
        user_id: user.id,
        action: 'Changed account password',
        entity_name: 'User',
        entity_id: user.id,
        ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
        user_agent: req.headers['user-agent'] || 'unknown',
        created_at: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to change password', errors: [error.message] });
    }
  }

  async signup(req, res) {
    const { User, Role, UserRoleAssignment, School, SchoolAdminMapping, SchoolOnboardingRequest, InspectionRequest, sequelize } = require('../models');
    const transaction = await sequelize.transaction();
    try {
      const {
        // School General
        schoolName,
        school_name,
        email, // User admin email
        password, // User admin password
        districtId,
        district_id,
        city,
        address,
        
        // Extended onboarding details (if passed)
        school_code,
        school_type,
        affiliation_board,
        mobile, // school contact mobile
        alternate_mobile,
        website,
        establishment_year,
        logo_url,
        taluka,
        pin_code,
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
        
        // Admin details (if passed separately)
        admin_name,
        admin_email,
        admin_mobile
      } = req.body;

      const final_email = admin_email || email;
      const final_password = password;
      const final_school_name = school_name || schoolName;
      const final_district_id = district_id || districtId;

      if (!final_school_name || !final_email || !final_password || !final_district_id) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Missing required fields: schoolName/school_name, email/admin_email, password, districtId/district_id' });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email: final_email } });
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      // 1. Create User
      const adminNameVal = admin_name || final_school_name;
      const user = await User.create({
        email: final_email,
        password_hash: final_password,
        first_name: adminNameVal.split(' ')[0] || adminNameVal,
        last_name: adminNameVal.split(' ').slice(1).join(' ') || 'Admin',
        mobile: admin_mobile || mobile || null,
        user_code: `USR-SCH-${Date.now().toString().slice(-6)}`,
        status: 'ACTIVE'
      }, { transaction });

      // 2. Find and assign SCHOOL_ADMIN role
      const role = await Role.findOne({ where: { role_name: 'SCHOOL_ADMIN' } });
      if (!role) {
        throw new Error('SCHOOL_ADMIN role not found in database');
      }

      await UserRoleAssignment.create({
        user_id: user.id,
        role_id: role.id
      }, { transaction });

      // 3. Create School (starts as PENDING onboarding)
      const final_school_code = school_code || `SCH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;
      
      const school = await School.create({
        district_id: parseInt(final_district_id, 10),
        school_name: final_school_name,
        school_code: final_school_code,
        udise_code: req.body.udise_code || null,
        school_type: school_type || null,
        affiliation_board: affiliation_board || null,
        email: email || null,
        mobile: mobile || null,
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
        media_upload_enabled: 0,
        status: 'PENDING'
      }, { transaction });

      // 4. Map user to school
      await SchoolAdminMapping.create({
        user_id: user.id,
        school_id: school.id
      }, { transaction });

      // 5. Create Onboarding request
      await SchoolOnboardingRequest.create({
        school_id: school.id,
        submitted_by: user.id,
        status: 'PENDING'
      }, { transaction });

      // 6. Automatically generate pending Inspection Request
      const requestCode = `REQ-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`;
      await InspectionRequest.create({
        request_code: requestCode,
        school_id: school.id,
        requested_by: user.id,
        status: 'PENDING',
        request_reason: 'Automatic signup onboarding inspection request',
        requested_at: new Date()
      }, { transaction });

      await transaction.commit();

      // Send real-time notification to Super Admin
      try {
        const notificationService = require('../services/notificationService');
        await notificationService.sendNotification({
          senderId: user.id,
          type: 'SCHOOL_APPROVED',
          title: 'New School Sign Up Request',
          message: `${final_school_name} has registered a new School Admin account. Onboarding approval required.`,
          targetRole: 'SUPER_ADMIN'
        });
      } catch (notifErr) {
        console.warn('Failed to send onboarding notification:', notifErr);
      }

      return res.status(201).json({
        success: true,
        message: 'Account created and school onboarding request submitted successfully',
        data: {
          user: { id: user.id, email: user.email, first_name: user.first_name },
          school: { id: school.id, school_name: school.school_name, school_code: final_school_code }
        }
      });
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      return res.status(500).json({ success: false, message: 'Signup failed', errors: [error.message] });
    }
  }
}

module.exports = new AuthController();
