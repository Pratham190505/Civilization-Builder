const { 
  sequelize, User, Role, Permission, RankTier, ScoreCategory, Badge, RegionalAdminScope, SchoolAdminMapping, UserRoleAssignment,
  State, District, School, ActivityCategory, SchoolActivity, SchoolAchievement, AchievementAsset,
  MediaAsset, MediaSubmission, MediaSubmissionVersion, MediaVersionAsset, SubmissionReviewStep, SubmissionReview, MediaPublication,
  SchoolScorePeriod, SchoolScoreComponent, SchoolRankHistory, SchoolRankSnapshot, SchoolBadge,
  Notification, NotificationRecipient, UserNotificationPreference, Conversation, ConversationParticipant, Message, MessageAsset,
  InspectionRequest, InspectionReport, GeneratedReport, SchoolRecommendation, RecommendationStatusHistory, ServicePackage, SchoolPackageProposal, ProposalCallRequest,
  SchoolMetricSnapshot, SocialDailyMetric, SchoolDailyActivity, DistrictPerformanceSnapshot, AuditLog, ImpersonationSession, OutboxEvent, WebhookEvent
} = require('../models');
const logger = require('../config/logger');
const rankingService = require('../services/rankingService');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding with rich test data...');
    await sequelize.authenticate();

    // Force sync tables to drop and recreate tables with correct schema
    await sequelize.sync({ force: true });
    logger.info('Database tables synchronized.');

    // 1. Create Permissions
    const permissionsData = [
      { permission_key: 'VIEW_STATES', module_name: 'States', description: 'Can view state lists' },
      { permission_key: 'MANAGE_STATES', module_name: 'States', description: 'Can create/edit/delete states' },
      { permission_key: 'VIEW_DISTRICTS', module_name: 'Districts', description: 'Can view district lists' },
      { permission_key: 'MANAGE_DISTRICTS', module_name: 'Districts', description: 'Can create/edit/delete districts' },
      { permission_key: 'VIEW_SCHOOLS', module_name: 'Schools', description: 'Can view school profiles' },
      { permission_key: 'CREATE_SCHOOL', module_name: 'Schools', description: 'Can onboarding submit schools' },
      { permission_key: 'UPDATE_SCHOOL', module_name: 'Schools', description: 'Can edit school profiles' },
      { permission_key: 'DELETE_SCHOOL', module_name: 'Schools', description: 'Can delete schools' },
      { permission_key: 'APPROVE_SCHOOL', module_name: 'Schools', description: 'Can approve/reject school onboarding' },
      { permission_key: 'REVIEW_MEDIA', module_name: 'Media', description: 'Can review media submissions' },
      { permission_key: 'APPROVE_MEDIA', module_name: 'Media', description: 'Can approve media submissions' },
      { permission_key: 'PUBLISH_MEDIA', module_name: 'Media', description: 'Can publish approved media to social accounts' },
      { permission_key: 'RECALCULATE_RANKINGS', module_name: 'Rankings', description: 'Can trigger manual scores calculation' },
      { permission_key: 'VIEW_ANALYTICS', module_name: 'Analytics', description: 'Can view analytical charts' },
      { permission_key: 'VIEW_AUDIT_LOGS', module_name: 'System', description: 'Can inspect system audit logs' },
      { permission_key: 'MANAGE_SECURITY', module_name: 'System', description: 'Can start user impersonations' },
      { permission_key: 'MANAGE_RECOMMENDATIONS', module_name: 'Recommendations', description: 'Can issue improvements recommendations' },
      { permission_key: 'SCHEDULE_INSPECTIONS', module_name: 'Inspections', description: 'Can assign inspectors and schedule dates' },
      { permission_key: 'COMPLETE_INSPECTIONS', module_name: 'Inspections', description: 'Can input inspection scores and comments' }
    ];

    const permissions = await Permission.bulkCreate(permissionsData);
    logger.info(`Seeded ${permissions.length} permissions.`);

    // 2. Create Roles
    const superAdminRole = await Role.create({ role_name: 'SUPER_ADMIN', description: 'Global unrestricted operations' });
    const regionalAdminRole = await Role.create({ role_name: 'REGIONAL_ADMIN', description: 'State-bound restricted operations' });
    const schoolAdminRole = await Role.create({ role_name: 'SCHOOL_ADMIN', description: 'School-bound restricted operations' });
    logger.info('Seeded administrative roles.');

    // 3. Create Tiers
    const rankTiers = await RankTier.bulkCreate([
      { tier_name: 'Platinum', min_score: 700, max_score: 1000 },
      { tier_name: 'Gold', min_score: 500, max_score: 699 },
      { tier_name: 'Silver', min_score: 300, max_score: 499 },
      { tier_name: 'Bronze', min_score: 100, max_score: 299 },
      { tier_name: 'No Rank', min_score: 0, max_score: 99 }
    ]);
    logger.info(`Seeded ${rankTiers.length} ranking tiers.`);

    // 4. Create Score Categories
    const scoreCategories = await ScoreCategory.bulkCreate([
      { category_name: 'Academics', max_score: 100 },
      { category_name: 'Achievements', max_score: 100 },
      { category_name: 'Media Uploads', max_score: 100 },
      { category_name: 'Participation', max_score: 100 }
    ]);
    logger.info(`Seeded ${scoreCategories.length} score categories.`);

    // 5. Create Badges
    const badges = await Badge.bulkCreate([
      { badge_name: 'Top Tier Elite', badge_code: 'TOP_TIER_ELITE', description: 'Awarded for reaching the Platinum Rank tier', icon_url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80&fit=crop' },
      { badge_name: 'Rising Star', badge_code: 'RISING_STAR', description: 'Awarded for improving rank positions monthly', icon_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&fit=crop' },
      { badge_name: 'Active Contributor', badge_code: 'ACTIVE_CONTRIBUTOR', description: 'Awarded for posting more than 10 media uploads', icon_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=80&fit=crop' }
    ]);
    logger.info(`Seeded ${badges.length} badges.`);

    // 6. Create States
    const stateKA = await State.create({ state_name: 'Karnataka', state_code: 'KA' });
    const stateMH = await State.create({ state_name: 'Maharashtra', state_code: 'MH' });
    const stateDL = await State.create({ state_name: 'Delhi', state_code: 'DL' });
    const stateTN = await State.create({ state_name: 'Tamil Nadu', state_code: 'TN' });
    logger.info('Seeded geographical states.');

    // 7. Create Districts
    const distBengaluru = await District.create({ state_id: stateKA.id, district_name: 'Bengaluru', district_code: 'BLR' });
    const distMysuru = await District.create({ state_id: stateKA.id, district_name: 'Mysuru', district_code: 'MYS' });
    const distMumbai = await District.create({ state_id: stateMH.id, district_name: 'Mumbai', district_code: 'MUM' });
    const distPune = await District.create({ state_id: stateMH.id, district_name: 'Pune', district_code: 'PUN' });
    const distChennai = await District.create({ state_id: stateTN.id, district_name: 'Chennai', district_code: 'CHE' });
    const distNewDelhi = await District.create({ state_id: stateDL.id, district_name: 'New Delhi', district_code: 'DEL' });
    logger.info('Seeded geographical districts.');

    // 8. Create Schools
    const school1 = await School.create({
      district_id: distBengaluru.id,
      school_name: 'Global Discovery School East',
      school_code: 'GDS-KA-01',
      udise_code: '29200100101',
      school_type: 'Co-Ed',
      affiliation_board: 'CBSE',
      email: 'school1@gds.com',
      mobile: '9876543210',
      address: 'Whitefield, Bengaluru, Karnataka',
      city: 'Bengaluru',
      pin_code: '560066',
      principal_name: 'Dr. Ramesh Kumar',
      principal_qualification: 'Ph.D in Education',
      principal_email: 'ramesh.kumar@gds.com',
      principal_mobile: '9876543210',
      student_count: 450,
      boys_count: 220,
      girls_count: 230,
      teacher_count: 28,
      male_teachers_count: 12,
      female_teachers_count: 16,
      non_teaching_staff_count: 8,
      classrooms_count: 24,
      labs_count: 3,
      computer_labs_count: 2,
      library_available: 1,
      playground_available: 1,
      smart_classrooms_count: 6,
      status: 'APPROVED',
      media_upload_enabled: 1,
      facebook_url: 'https://facebook.com/gdseast',
      instagram_url: 'https://instagram.com/gdseast',
      youtube_url: 'https://youtube.com/gdseast',
      website_url: 'https://gdseast.edu.in',
      academic_score: 255,
      achievement_score: 200,
      media_score: 120,
      participation_score: 80,
      total_score: 655,
      score: 655,
      tier_id: 2
    });

    const school2 = await School.create({
      district_id: distBengaluru.id,
      school_name: 'Global Discovery School North',
      school_code: 'GDS-KA-02',
      udise_code: '29200100102',
      school_type: 'Co-Ed',
      affiliation_board: 'CBSE',
      email: 'school2@gds.com',
      mobile: '9876543211',
      address: 'Hebbal, Bengaluru, Karnataka',
      city: 'Bengaluru',
      pin_code: '560024',
      principal_name: 'Mrs. Shweta Patil',
      principal_qualification: 'M.Sc, B.Ed',
      principal_email: 'shweta.patil@gds.com',
      principal_mobile: '9876543211',
      student_count: 600,
      boys_count: 310,
      girls_count: 290,
      teacher_count: 35,
      male_teachers_count: 15,
      female_teachers_count: 20,
      non_teaching_staff_count: 10,
      classrooms_count: 30,
      labs_count: 4,
      computer_labs_count: 3,
      library_available: 1,
      playground_available: 1,
      smart_classrooms_count: 8,
      status: 'APPROVED',
      media_upload_enabled: 1,
      facebook_url: 'https://facebook.com/gdsnorth',
      instagram_url: 'https://instagram.com/gdsnorth',
      youtube_url: 'https://youtube.com/gdsnorth',
      website_url: 'https://gdsnorth.edu.in',
      academic_score: 285,
      achievement_score: 250,
      media_score: 240,
      participation_score: 90,
      total_score: 865,
      score: 865,
      tier_id: 1
    });

    const school3 = await School.create({
      district_id: distMumbai.id,
      school_name: 'GDS Mumbai Central',
      school_code: 'GDS-MH-01',
      udise_code: '27210100201',
      school_type: 'Co-Ed',
      affiliation_board: 'CBSE',
      email: 'school3@gds.com',
      mobile: '9876543212',
      address: 'Worli, Mumbai, Maharashtra',
      city: 'Mumbai',
      pin_code: '400018',
      principal_name: 'Mr. Anil Deshmukh',
      principal_qualification: 'M.A, M.Ed',
      principal_email: 'anil.deshmukh@gds.com',
      principal_mobile: '9876543212',
      student_count: 800,
      boys_count: 410,
      girls_count: 390,
      teacher_count: 48,
      male_teachers_count: 20,
      female_teachers_count: 28,
      non_teaching_staff_count: 12,
      classrooms_count: 40,
      labs_count: 5,
      computer_labs_count: 4,
      library_available: 1,
      playground_available: 1,
      smart_classrooms_count: 10,
      status: 'APPROVED',
      media_upload_enabled: 1,
      facebook_url: 'https://facebook.com/gdsmumbai',
      instagram_url: 'https://instagram.com/gdsmumbai',
      youtube_url: 'https://youtube.com/gdsmumbai',
      website_url: 'https://gdsmumbai.edu.in',
      academic_score: 270,
      achievement_score: 210,
      media_score: 300,
      participation_score: 85,
      total_score: 865,
      score: 865,
      tier_id: 1
    });

    const school4 = await School.create({
      district_id: distPune.id,
      school_name: 'GDS Pune High',
      school_code: 'GDS-MH-02',
      udise_code: '27210100202',
      school_type: 'Co-Ed',
      affiliation_board: 'State Board',
      email: 'school4@gds.com',
      mobile: '9876543213',
      address: 'Kothrud, Pune, Maharashtra',
      city: 'Pune',
      pin_code: '411038',
      principal_name: 'Dr. Sunita Kulkarni',
      principal_qualification: 'Ph.D in Literature',
      principal_email: 'sunita.kulkarni@gds.com',
      principal_mobile: '9876543213',
      student_count: 320,
      boys_count: 150,
      girls_count: 170,
      teacher_count: 18,
      male_teachers_count: 8,
      female_teachers_count: 10,
      non_teaching_staff_count: 6,
      classrooms_count: 16,
      labs_count: 2,
      computer_labs_count: 1,
      library_available: 1,
      playground_available: 1,
      smart_classrooms_count: 4,
      status: 'APPROVED',
      media_upload_enabled: 1,
      facebook_url: 'https://facebook.com/gdspune',
      instagram_url: 'https://instagram.com/gdspune',
      youtube_url: 'https://youtube.com/gdspune',
      website_url: 'https://gdspune.edu.in',
      academic_score: 294,
      achievement_score: 300,
      media_score: 300,
      participation_score: 98,
      total_score: 992,
      score: 992,
      tier_id: 1
    });

    const school5 = await School.create({
      district_id: distChennai.id,
      school_name: 'GDS Chennai International',
      school_code: 'GDS-TN-01',
      udise_code: '33020100301',
      school_type: 'Co-Ed',
      affiliation_board: 'ICSE',
      email: 'school5@gds.com',
      mobile: '9876543214',
      address: 'Adyar, Chennai, Tamil Nadu',
      city: 'Chennai',
      pin_code: '600020',
      principal_name: 'Mr. Srinivasan K.',
      principal_qualification: 'M.Sc, M.Phil',
      principal_email: 'srinivasan.k@gds.com',
      principal_mobile: '9876543214',
      student_count: 750,
      boys_count: 380,
      girls_count: 370,
      teacher_count: 42,
      male_teachers_count: 18,
      female_teachers_count: 24,
      non_teaching_staff_count: 10,
      classrooms_count: 35,
      labs_count: 4,
      computer_labs_count: 3,
      library_available: 1,
      playground_available: 1,
      smart_classrooms_count: 9,
      status: 'APPROVED',
      media_upload_enabled: 1,
      facebook_url: 'https://facebook.com/gdschennai',
      instagram_url: 'https://instagram.com/gdschennai',
      youtube_url: 'https://youtube.com/gdschennai',
      website_url: 'https://gdschennai.edu.in',
      academic_score: 180,
      achievement_score: 150,
      media_score: 60,
      participation_score: 50,
      total_score: 440,
      score: 440,
      tier_id: 3
    });

    const schoolPending = await School.create({
      district_id: distBengaluru.id,
      school_name: 'GDS Bengaluru Prep',
      school_code: 'GDS-KA-03',
      udise_code: '29200100103',
      school_type: 'Co-Ed',
      affiliation_board: 'CBSE',
      email: 'school6@gds.com',
      mobile: '9876543215',
      address: 'Indiranagar, Bengaluru, Karnataka',
      city: 'Bengaluru',
      pin_code: '560038',
      principal_name: 'Mr. Vijay Mallya',
      principal_qualification: 'B.Com, MBA',
      principal_email: 'vijay.mallya@gds.com',
      principal_mobile: '9876543215',
      student_count: 120,
      boys_count: 60,
      girls_count: 60,
      teacher_count: 8,
      male_teachers_count: 3,
      female_teachers_count: 5,
      non_teaching_staff_count: 3,
      classrooms_count: 8,
      labs_count: 1,
      computer_labs_count: 1,
      library_available: 1,
      playground_available: 0,
      smart_classrooms_count: 2,
      status: 'PENDING',
      media_upload_enabled: 0,
      facebook_url: 'https://facebook.com/gdshelpprep',
      instagram_url: 'https://instagram.com/gdshelpprep',
      youtube_url: 'https://youtube.com/gdshelpprep',
      website_url: 'https://gdshelpprep.edu.in'
    });
    logger.info('Seeded school profiles.');

    // 9. Create Users
    const superAdminUser = await User.create({
      email: 'superadmin@gds.com',
      password_hash: 'password123',
      first_name: 'Super',
      last_name: 'Admin',
      phone: '1234567890',
      user_code: 'USR-SA01',
      status: 'ACTIVE'
    });

    const regionalAdminKA = await User.create({
      email: 'regionaladmin@gds.com',
      password_hash: 'password123',
      first_name: 'Rajesh',
      last_name: 'Gowda',
      phone: '1234567891',
      user_code: 'USR-RA01',
      status: 'ACTIVE'
    });

    const regionalAdminMH = await User.create({
      email: 'regionaladmin_mh@gds.com',
      password_hash: 'password123',
      first_name: 'Sachin',
      last_name: 'Joshi',
      phone: '1234567895',
      user_code: 'USR-RA02',
      status: 'ACTIVE'
    });

    const schoolAdmin1 = await User.create({
      email: 'schooladmin@gds.com',
      password_hash: 'password123',
      first_name: 'Mahesh',
      last_name: 'Sinha',
      phone: '1234567892',
      user_code: 'USR-SCH01',
      status: 'ACTIVE'
    });

    const schoolAdmin2 = await User.create({
      email: 'schooladmin_north@gds.com',
      password_hash: 'password123',
      first_name: 'Kavitha',
      last_name: 'Reddy',
      phone: '1234567896',
      user_code: 'USR-SCH02',
      status: 'ACTIVE'
    });

    const schoolAdmin3 = await User.create({
      email: 'schooladmin_mumbai@gds.com',
      password_hash: 'password123',
      first_name: 'Priyanka',
      last_name: 'Shinde',
      phone: '1234567897',
      user_code: 'USR-SCH03',
      status: 'ACTIVE'
    });

    const schoolAdmin4 = await User.create({
      email: 'schooladmin_pune@gds.com',
      password_hash: 'password123',
      first_name: 'Ganesh',
      last_name: 'Patwardhan',
      phone: '1234567898',
      user_code: 'USR-SCH04',
      status: 'ACTIVE'
    });

    const schoolAdmin5 = await User.create({
      email: 'schooladmin_chennai@gds.com',
      password_hash: 'password123',
      first_name: 'Anjali',
      last_name: 'Subramanian',
      phone: '1234567899',
      user_code: 'USR-SCH05',
      status: 'ACTIVE'
    });
    logger.info('Seeded user accounts.');

    // Attach Roles
    await superAdminUser.addRole(superAdminRole);
    await regionalAdminKA.addRole(regionalAdminRole);
    await regionalAdminMH.addRole(regionalAdminRole);
    await schoolAdmin1.addRole(schoolAdminRole);
    await schoolAdmin2.addRole(schoolAdminRole);
    await schoolAdmin3.addRole(schoolAdminRole);
    await schoolAdmin4.addRole(schoolAdminRole);
    await schoolAdmin5.addRole(schoolAdminRole);
    logger.info('Mapped user roles.');

    // Seed Scopes & Mappings
    await RegionalAdminScope.create({ user_id: regionalAdminKA.id, state_id: stateKA.id });
    await RegionalAdminScope.create({ user_id: regionalAdminMH.id, state_id: stateMH.id });

    await SchoolAdminMapping.create({ user_id: schoolAdmin1.id, school_id: school1.id });
    await SchoolAdminMapping.create({ user_id: schoolAdmin2.id, school_id: school2.id });
    await SchoolAdminMapping.create({ user_id: schoolAdmin3.id, school_id: school3.id });
    await SchoolAdminMapping.create({ user_id: schoolAdmin4.id, school_id: school4.id });
    await SchoolAdminMapping.create({ user_id: schoolAdmin5.id, school_id: school5.id });
    logger.info('Seeded scoping boundaries (regional admin states, school admin schools).');

    // Create UserPreferences (Notification Preferences)
    await UserNotificationPreference.create({ user_id: superAdminUser.id, email_notifications: 1, push_notifications: 1, sms_notifications: 0 });
    await UserNotificationPreference.create({ user_id: regionalAdminKA.id, email_notifications: 1, push_notifications: 1, sms_notifications: 0 });
    await UserNotificationPreference.create({ user_id: schoolAdmin1.id, email_notifications: 1, push_notifications: 1, sms_notifications: 0 });
    logger.info('Seeded user notification preferences.');

    // 10. Seed Activity Categories
    const catSports = await ActivityCategory.create({ category_name: 'Sports', description: 'Physical and athletics events' });
    const catAcademics = await ActivityCategory.create({ category_name: 'Academics', description: 'Quizzes, science fairs, workshops' });
    const catArts = await ActivityCategory.create({ category_name: 'Arts & Culture', description: 'Dances, paintings, drama' });
    const catCivics = await ActivityCategory.create({ category_name: 'Civic Service', description: 'Cleanliness drives, donation campaigns' });
    logger.info('Seeded activity categories.');

    // 11. Create School Activities
    // School 1 Activities (Bengaluru GDS East)
    const act1 = await SchoolActivity.create({
      activity_code: 'ACT-KA01-01',
      school_id: school1.id,
      category_id: catAcademics.id,
      title: 'Annual Science Exhibition 2026',
      description: 'Students displaying innovative physics models.',
      activity_date: '2026-05-10',
      created_by: schoolAdmin1.id
    });
    const act2 = await SchoolActivity.create({
      activity_code: 'ACT-KA01-02',
      school_id: school1.id,
      category_id: catSports.id,
      title: 'Inter-House Volleyball Finals',
      description: 'East Campus vs West Campus volleyball final match.',
      activity_date: '2026-05-20',
      created_by: schoolAdmin1.id
    });
    const act3 = await SchoolActivity.create({
      activity_code: 'ACT-KA01-03',
      school_id: school1.id,
      category_id: catArts.id,
      title: 'Classical Dance Performance',
      description: 'Bharatanatyam performance at district level.',
      activity_date: '2026-06-05',
      created_by: schoolAdmin1.id
    });

    // School 2 Activities (Bengaluru GDS North)
    const act4 = await SchoolActivity.create({
      activity_code: 'ACT-KA02-01',
      school_id: school2.id,
      category_id: catAcademics.id,
      title: 'National Math Olympiad Workshop',
      description: 'Prep workshop for students taking the Olympiad.',
      activity_date: '2026-04-12',
      created_by: schoolAdmin2.id
    });
    const act5 = await SchoolActivity.create({
      activity_code: 'ACT-KA02-02',
      school_id: school2.id,
      category_id: catSports.id,
      title: 'Kabaddi League Championship',
      description: 'Annual North Zone Kabaddi tournament.',
      activity_date: '2026-05-15',
      created_by: schoolAdmin2.id
    });

    // School 3 Activities (Mumbai Central)
    const act6 = await SchoolActivity.create({
      activity_code: 'ACT-MH01-01',
      school_id: school3.id,
      category_id: catArts.id,
      title: 'Street Play on Environmental Awareness',
      description: 'Performed at Marine Drive to educate public.',
      activity_date: '2026-06-02',
      created_by: schoolAdmin3.id
    });

    // School 4 Activities (Pune High)
    // Create multiple activities to give it max points (10 activities)
    for (let i = 1; i <= 10; i++) {
      await SchoolActivity.create({
        activity_code: `ACT-MH02-0${i}`,
        school_id: school4.id,
        category_id: catSports.id,
        title: `Physical Education Event ${i}`,
        description: `Regular sports activity part of physical fitness program ${i}.`,
        activity_date: '2026-06-01',
        created_by: schoolAdmin4.id
      });
    }

    // School 5 Activities (Chennai International)
    await SchoolActivity.create({
      activity_code: 'ACT-TN01-01',
      school_id: school5.id,
      category_id: catCivics.id,
      title: 'Beach Cleanliness Drive',
      description: 'Marina beach cleaning by GDS Chennai volunteers.',
      activity_date: '2026-06-10',
      created_by: schoolAdmin5.id
    });
    await SchoolActivity.create({
      activity_code: 'ACT-TN01-02',
      school_id: school5.id,
      category_id: catSports.id,
      title: 'Regional Chess Championship',
      description: 'Chess tournament organized for state schools.',
      activity_date: '2026-06-12',
      created_by: schoolAdmin5.id
    });
    logger.info('Seeded school activities.');

    // 12. Create Achievements
    // School 1 (East) Achievements
    await SchoolAchievement.create({
      achievement_code: 'ACH-KA01-01',
      school_id: school1.id,
      activity_id: act1.id,
      title: 'State Science Fair - First Place',
      description: 'Won Gold Medal for our solar purifier prototype.',
      achievement_level: 'STATE',
      achievement_date: '2026-05-12',
      created_by: schoolAdmin1.id
    });
    await SchoolAchievement.create({
      achievement_code: 'ACH-KA01-02',
      school_id: school1.id,
      activity_id: act2.id,
      title: 'National Volleyball Runner Up',
      description: 'Secured second position nationally.',
      achievement_level: 'NATIONAL',
      achievement_date: '2026-05-24',
      created_by: schoolAdmin1.id
    });

    // School 2 (North) Achievements
    await SchoolAchievement.create({
      achievement_code: 'ACH-KA02-01',
      school_id: school2.id,
      activity_id: act4.id,
      title: 'International Mathematics Championship',
      description: 'Gold Medal in International Olympiad held in Singapore.',
      achievement_level: 'INTERNATIONAL',
      achievement_date: '2026-04-18',
      created_by: schoolAdmin2.id
    });

    // School 4 (Pune) Achievements
    // Create 3 international achievements for max score (3 * 100 = 300)
    for (let i = 1; i <= 3; i++) {
      await SchoolAchievement.create({
        achievement_code: `ACH-MH02-0${i}`,
        school_id: school4.id,
        activity_id: school4.id, // reference fallback
        title: `International Excellence Award ${i}`,
        description: `Global certification in academics and extracurriculars level ${i}.`,
        achievement_level: 'INTERNATIONAL',
        achievement_date: '2026-06-08',
        created_by: schoolAdmin4.id
      });
    }

    // School 5 (Chennai) Achievements
    await SchoolAchievement.create({
      achievement_code: 'ACH-TN01-01',
      school_id: school5.id,
      activity_id: school5.id,
      title: 'National Green Campus Award',
      description: 'Ranked top eco-friendly campus by Ministry of Environment.',
      achievement_level: 'NATIONAL',
      achievement_date: '2026-06-15',
      created_by: schoolAdmin5.id
    });
    logger.info('Seeded school achievements.');

    // 13. Helper for Media Submissions (with Asset & version & versionAsset)
    const seedMedia = async (schoolId, title, desc, status, userId, imgUrl) => {
      const code = `SUB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      const sub = await MediaSubmission.create({
        submission_code: code,
        school_id: schoolId,
        title,
        description: desc,
        status,
        submitted_by: userId,
        submitted_at: new Date()
      });

      const asset = await MediaAsset.create({
        asset_code: `AST-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
        file_name: 'school_photo.jpg',
        file_path: imgUrl,
        file_type: 'image/jpeg',
        file_size: 145000,
        uploaded_by: userId
      });

      const ver = await MediaSubmissionVersion.create({
        submission_id: sub.id,
        version_no: 1,
        version_notes: 'Uploaded by School Admin',
        created_by: userId
      });

      await MediaVersionAsset.create({
        version_id: ver.id,
        asset_id: asset.id
      });

      return sub;
    };

    // Seed Media Submissions (need distinct counts to test different scores)
    // School 1 (East): 4 approved submissions (4 * 30 = 120 points)
    await seedMedia(school1.id, 'Science Fair Project Pitch', 'Our students showing the solar prototype.', 'PUBLISHED', schoolAdmin1.id, 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&auto=format&fit=crop');
    await seedMedia(school1.id, 'Volleyball Finals Victory Shot', 'Team celebration photo after final whistle.', 'SUPER_APPROVED', schoolAdmin1.id, 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&auto=format&fit=crop');
    await seedMedia(school1.id, 'Cultural Fest Inaugural Dance', 'Opening group dance at annual day.', 'PUBLISHED', schoolAdmin1.id, 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop');
    await seedMedia(school1.id, 'Independence Day Assembly', 'March past photo on grounds.', 'PUBLISHED', schoolAdmin1.id, 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format&fit=crop');
    
    // Add 1 pending submission for Karnataka Regional Admin to review
    await seedMedia(school1.id, 'Tree Plantation Drive Karnataka', 'Students planting neem saplings.', 'SUBMITTED', schoolAdmin1.id, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop');

    // School 2 (North): 8 approved submissions (8 * 30 = 240 points)
    for (let i = 1; i <= 8; i++) {
      await seedMedia(school2.id, `North Campus Photo Upload ${i}`, `Description of North campus media submission ${i}.`, 'PUBLISHED', schoolAdmin2.id, 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&auto=format&fit=crop');
    }
    // Add 1 submission that's reviewed by Regional Admin (needs Super Admin approval)
    await seedMedia(school2.id, 'Math Olympiad Trophy Presentation', 'Principal presenting the Olympiad Gold medal.', 'REGIONAL_REVIEWED', schoolAdmin2.id, 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop');

    // School 3 (Mumbai): 10 approved submissions (300 points)
    for (let i = 1; i <= 10; i++) {
      await seedMedia(school3.id, `Mumbai Campus Media Upload ${i}`, `Description of Worli campus activity media ${i}.`, 'PUBLISHED', schoolAdmin3.id, 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop');
    }

    // School 4 (Pune): 10 approved submissions (300 points)
    for (let i = 1; i <= 10; i++) {
      await seedMedia(school4.id, `Pune Campus Media Upload ${i}`, `Description of Pune campus activity media ${i}.`, 'PUBLISHED', schoolAdmin4.id, 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format&fit=crop');
    }

    // School 5 (Chennai): 2 approved submissions (60 points)
    await seedMedia(school5.id, 'Beach Clean Up Action Shot', 'Collecting plastic bottles near shore.', 'PUBLISHED', schoolAdmin5.id, 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500&auto=format&fit=crop');
    await seedMedia(school5.id, 'Marina Chess Masters Match', 'Tournament finals match boards close up.', 'SUPER_APPROVED', schoolAdmin5.id, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=500&auto=format&fit=crop');
    
    logger.info('Seeded media uploads with correct version-asset mapping.');

    // 14. Create Inspections
    // Inspection 1: GDS East
    const req1 = await InspectionRequest.create({
      request_code: 'INSP-REQ-01',
      school_id: school1.id,
      requested_by: superAdminUser.id,
      request_reason: 'Regular Academic Audit 2026',
      status: 'COMPLETED',
      requested_at: '2026-05-01'
    });
    await InspectionReport.create({
      report_code: 'INSP-REP-01',
      inspection_request_id: req1.id,
      inspector_id: regionalAdminKA.id,
      findings: 'Excellent classroom infra, high student engagement, smartboards are fully utilized.',
      strengths: 'Dedicated teaching staff, strong parent-teacher association.',
      improvement_areas: 'Library stock needs updates, playground perimeter fence requires repairs.',
      recommendations: 'Procure latest science books, repair fence.',
      overall_rating: 85.0, // Scales to 85% of 300 = 255 points
      inspection_date: '2026-05-08'
    });

    // Inspection 2: GDS North
    const req2 = await InspectionRequest.create({
      request_code: 'INSP-REQ-02',
      school_id: school2.id,
      requested_by: superAdminUser.id,
      request_reason: 'Infrastructure inspection',
      status: 'COMPLETED',
      requested_at: '2026-04-20'
    });
    await InspectionReport.create({
      report_code: 'INSP-REP-02',
      inspection_request_id: req2.id,
      inspector_id: regionalAdminKA.id,
      findings: 'Modern labs, outstanding sports facilities.',
      strengths: 'Top tier coding curriculum, highly advanced robotic kits.',
      improvement_areas: 'Classroom ventilation could be enhanced.',
      recommendations: 'Install exhaust fans or large windows.',
      overall_rating: 95.0, // Scales to 95% of 300 = 285 points
      inspection_date: '2026-04-25'
    });

    // Inspection 3: GDS Mumbai
    const req3 = await InspectionRequest.create({
      request_code: 'INSP-REQ-03',
      school_id: school3.id,
      requested_by: superAdminUser.id,
      request_reason: 'Curriculum inspection',
      status: 'COMPLETED',
      requested_at: '2026-05-22'
    });
    await InspectionReport.create({
      report_code: 'INSP-REP-03',
      inspection_request_id: req3.id,
      inspector_id: regionalAdminMH.id,
      findings: 'Good compliance, strong academic standards.',
      strengths: 'Active drama club, high participation rate.',
      improvement_areas: 'Need more digital teaching aids.',
      recommendations: 'Procure projectors for secondary sections.',
      overall_rating: 90.0, // Scales to 90% of 300 = 270 points
      inspection_date: '2026-05-30'
    });

    // Inspection 4: GDS Pune
    const req4 = await InspectionRequest.create({
      request_code: 'INSP-REQ-04',
      school_id: school4.id,
      requested_by: superAdminUser.id,
      request_reason: 'Academic verification',
      status: 'COMPLETED',
      requested_at: '2026-05-25'
    });
    await InspectionReport.create({
      report_code: 'INSP-REP-04',
      inspection_request_id: req4.id,
      inspector_id: regionalAdminMH.id,
      findings: 'Perfect marks in all areas.',
      strengths: 'State of the art technology.',
      improvement_areas: 'None observed.',
      recommendations: 'Maintain current standards.',
      overall_rating: 98.0, // Scales to 98% of 300 = 294 points
      inspection_date: '2026-06-03'
    });

    // Pending Inspection Request for Karnataka Admin to see
    await InspectionRequest.create({
      request_code: 'INSP-REQ-05',
      school_id: school2.id,
      requested_by: regionalAdminKA.id,
      request_reason: 'Follow-up on classroom ventilation audit.',
      status: 'SCHEDULED',
      requested_at: new Date()
    });

    logger.info('Seeded inspection audit logs and reports.');

    // 15. Create Recommendations
    await SchoolRecommendation.create({
      school_id: school1.id,
      title: 'Upgrade Chemistry Lab Safety Kits',
      description: 'Procure fire blankets, eyewash solution, and safety goggles for standard IX-XII labs.',
      priority: 'HIGH',
      ranking_impact: 15,
      progress_percentage: 40,
      created_by: regionalAdminKA.id
    });
    await SchoolRecommendation.create({
      school_id: school1.id,
      title: 'Update Primary Library Catalog',
      description: 'Add new age interactive books, regional folktales, and basic science manuals.',
      priority: 'MEDIUM',
      ranking_impact: 10,
      progress_percentage: 80,
      created_by: regionalAdminKA.id
    });
    await SchoolRecommendation.create({
      school_id: school2.id,
      title: 'Install Classroom Exhaust Fans',
      description: 'Enhance airflow dynamics in the primary wing classrooms.',
      priority: 'HIGH',
      ranking_impact: 20,
      progress_percentage: 10,
      created_by: regionalAdminKA.id
    });
    logger.info('Seeded improvement recommendations.');

    // 16. Seed Notifications
    const n1 = await Notification.create({
      notification_code: 'NTF-001',
      notification_type: 'SYSTEM',
      title: 'Database Reset & Seeding Completed',
      message: 'The database has been populated with real GDS administrative records successfully.',
      entity_type: 'SYSTEM',
      entity_id: 1,
      created_by: superAdminUser.id
    });
    await NotificationRecipient.create({ notification_id: n1.id, user_id: schoolAdmin1.id, is_read: 0 });
    await NotificationRecipient.create({ notification_id: n1.id, user_id: regionalAdminKA.id, is_read: 0 });

    const n2 = await Notification.create({
      notification_code: 'NTF-002',
      notification_type: 'MEDIA',
      title: 'New Media Submitted',
      message: 'Tree Plantation Drive photo requires your state verification.',
      entity_type: 'MEDIA_SUBMISSION',
      entity_id: 5,
      created_by: schoolAdmin1.id
    });
    await NotificationRecipient.create({ notification_id: n2.id, user_id: regionalAdminKA.id, is_read: 0 });
    logger.info('Seeded user notifications.');

    // 17. Seed Chats / Conversations & Messages
    const conv1 = await Conversation.create({
      conversation_code: 'CONV-01',
      subject: 'Review of Science Fair Photo Submissions',
      created_by: schoolAdmin1.id
    });
    await ConversationParticipant.create({ conversation_id: conv1.id, user_id: schoolAdmin1.id });
    await ConversationParticipant.create({ conversation_id: conv1.id, user_id: regionalAdminKA.id });

    await Message.create({ conversation_id: conv1.id, sender_id: schoolAdmin1.id, message_text: 'Hi Rajesh sir, I uploaded the Science Fair photo collection. Could you please review it?' });
    await Message.create({ conversation_id: conv1.id, sender_id: regionalAdminKA.id, message_text: 'Hello Mahesh, the pictures look excellent! I have checked and pushed them forward to Super Admin approval. Can you update the description of the physics model?' });
    await Message.create({ conversation_id: conv1.id, sender_id: schoolAdmin1.id, message_text: 'Yes sir, I added the detailed working steps to the description. Thanks!' });

    logger.info('Seeded messaging threads.');

    // 18. Seed snap/historical statistics (Daily Activity & Social Metrics)
    const today = new Date();
    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
      const activeDate = new Date();
      activeDate.setDate(today.getDate() - dayOffset);
      const activeDateStr = activeDate.toISOString().slice(0, 10);

      // School 1 (East)
      await SchoolDailyActivity.create({
        school_id: school1.id,
        activity_date: activeDateStr,
        uploads_count: Math.floor(Math.random() * 3 + 1),
        achievements_count: dayOffset === 2 || dayOffset === 6 ? 1 : 0,
        activities_count: Math.floor(Math.random() * 2),
        logins_count: Math.floor(Math.random() * 6 + 2)
      });
      await SocialDailyMetric.create({
        school_id: school1.id,
        metric_date: activeDateStr,
        facebook_reach: 400 + (7 - dayOffset) * 80 + Math.floor(Math.random() * 30),
        instagram_reach: 600 + (7 - dayOffset) * 110 + Math.floor(Math.random() * 50),
        youtube_views: 1200 + (7 - dayOffset) * 200 + Math.floor(Math.random() * 100),
        website_visits: 300 + (7 - dayOffset) * 40 + Math.floor(Math.random() * 20)
      });

      // School 2 (North)
      await SchoolDailyActivity.create({
        school_id: school2.id,
        activity_date: activeDateStr,
        uploads_count: Math.floor(Math.random() * 4),
        achievements_count: dayOffset === 4 ? 1 : 0,
        activities_count: Math.floor(Math.random() * 2),
        logins_count: Math.floor(Math.random() * 8 + 3)
      });

      // School 3 (Mumbai)
      await SchoolDailyActivity.create({
        school_id: school3.id,
        activity_date: activeDateStr,
        uploads_count: Math.floor(Math.random() * 3),
        achievements_count: 0,
        activities_count: Math.floor(Math.random() * 2),
        logins_count: Math.floor(Math.random() * 5 + 1)
      });
    }
    logger.info('Seeded daily activity metrics & social media reaches.');

    // 19. Run the dynamic Ranking Recalculation!
    // This will calculate all academic/achievement/media scores, periods, categories, component values, snapshots, and histories!
    logger.info('Invoking rankingService.recalculateAllRankings()...');
    const result = await rankingService.recalculateAllRankings();
    logger.info('Ranking recalculations executed successfully. Output summaries: %o', result);

    // 20. Seed District Performance Snapshots (Not recalculable dynamically)
    // Create performance snapshot records for all districts to show district maps and lists
    await DistrictPerformanceSnapshot.create({
      district_id: distBengaluru.id,
      snapshot_date: today.toISOString().slice(0, 10),
      active_schools: 2,
      inactive_schools: 1,
      total_score: 116.5, 
      average_score: 58.25,
      ranking_position: 1
    });

    await DistrictPerformanceSnapshot.create({
      district_id: distPune.id,
      snapshot_date: today.toISOString().slice(0, 10),
      active_schools: 1,
      inactive_schools: 0,
      total_score: 99.4, 
      average_score: 99.4,
      ranking_position: 2
    });

    await DistrictPerformanceSnapshot.create({
      district_id: distMumbai.id,
      snapshot_date: today.toISOString().slice(0, 10),
      active_schools: 1,
      inactive_schools: 0,
      total_score: 58.0, 
      average_score: 58.0,
      ranking_position: 3
    });

    await DistrictPerformanceSnapshot.create({
      district_id: distChennai.id,
      snapshot_date: today.toISOString().slice(0, 10),
      active_schools: 1,
      inactive_schools: 0,
      total_score: 30.5, 
      average_score: 30.5,
      ranking_position: 4
    });

    logger.info('Seeded district performance snapshot data.');
    logger.info('Database seeding completed successfully with perfect data mappings.');
  } catch (error) {
    logger.error('Database seeding failed: %o', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
module.exports = seedDatabase;
