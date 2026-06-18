const { 
  sequelize, User, Role, Permission, RankTier, ScoreCategory, Badge, UserRoleAssignment, UserNotificationPreference 
} = require('../models');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');
    await sequelize.authenticate();

    // Force sync tables for seeder execution if needed
    await sequelize.sync({ force: true });
    logger.info('Database tables synchronized.');

    // 1. Create Permissions
    const permissionsData = [
      { module_name: 'View States', permission_key: 'VIEW_STATES', description: 'Can view state lists' },
      { module_name: 'Manage States', permission_key: 'MANAGE_STATES', description: 'Can create/edit/delete states' },
      { module_name: 'View Districts', permission_key: 'VIEW_DISTRICTS', description: 'Can view district lists' },
      { module_name: 'Manage Districts', permission_key: 'MANAGE_DISTRICTS', description: 'Can create/edit/delete districts' },
      { module_name: 'View Schools', permission_key: 'VIEW_SCHOOLS', description: 'Can view school profiles' },
      { module_name: 'Create School', permission_key: 'CREATE_SCHOOL', description: 'Can onboarding submit schools' },
      { module_name: 'Update School', permission_key: 'UPDATE_SCHOOL', description: 'Can edit school profiles' },
      { module_name: 'Delete School', permission_key: 'DELETE_SCHOOL', description: 'Can delete schools' },
      { module_name: 'Approve School', permission_key: 'APPROVE_SCHOOL', description: 'Can approve/reject school onboarding' },
      { module_name: 'Review Media', permission_key: 'REVIEW_MEDIA', description: 'Can review media submissions' },
      { module_name: 'Approve Media', permission_key: 'APPROVE_MEDIA', description: 'Can approve media submissions' },
      { module_name: 'Publish Media', permission_key: 'PUBLISH_MEDIA', description: 'Can publish approved media to social accounts' },
      { module_name: 'Recalculate Rankings', permission_key: 'RECALCULATE_RANKINGS', description: 'Can trigger manual scores calculation' },
      { module_name: 'View Analytics', permission_key: 'VIEW_ANALYTICS', description: 'Can view analytical charts' },
      { module_name: 'View Audit Logs', permission_key: 'VIEW_AUDIT_LOGS', description: 'Can inspect system audit logs' },
      { module_name: 'Manage Security', permission_key: 'MANAGE_SECURITY', description: 'Can start user impersonations' },
      { module_name: 'Manage Recommendations', permission_key: 'MANAGE_RECOMMENDATIONS', description: 'Can issue improvements recommendations' },
      { module_name: 'Schedule Inspections', permission_key: 'SCHEDULE_INSPECTIONS', description: 'Can assign inspectors and schedule dates' },
      { module_name: 'Complete Inspections', permission_key: 'COMPLETE_INSPECTIONS', description: 'Can input inspection scores and comments' }
    ];

    const permissions = await Permission.bulkCreate(permissionsData);
    logger.info(`Seeded ${permissions.length} permissions.`);

    // 2. Create Roles (using correct uppercase names to match auth middleware)
    const superAdminRole = await Role.create({ role_name: 'SUPER_ADMIN', description: 'Global unrestricted operations' });
    const regionalAdminRole = await Role.create({ role_name: 'REGIONAL_ADMIN', description: 'State-bound restricted operations' });
    const schoolAdminRole = await Role.create({ role_name: 'SCHOOL_ADMIN', description: 'School-bound restricted operations' });
    logger.info('Seeded administrative roles.');

    // 3. Create Tiers (using correct column tier_name, no color column)
    const rankTiers = await RankTier.bulkCreate([
      { tier_name: 'Platinum', min_score: 900, max_score: 1000 },
      { tier_name: 'Gold', min_score: 750, max_score: 899 },
      { tier_name: 'Silver', min_score: 500, max_score: 749 },
      { tier_name: 'Bronze', min_score: 250, max_score: 499 },
      { tier_name: 'Not Ranked', min_score: 0, max_score: 249 }
    ]);
    logger.info(`Seeded ${rankTiers.length} ranking tiers.`);

    // 4. Create Score Categories (using category_name and max_score, no weight column)
    const scoreCategories = await ScoreCategory.bulkCreate([
      { category_name: 'Academics', max_score: 300 },
      { category_name: 'Achievements', max_score: 300 },
      { category_name: 'Media Uploads', max_score: 300 },
      { category_name: 'Participation', max_score: 100 }
    ]);
    logger.info(`Seeded ${scoreCategories.length} score categories.`);

    // 5. Create Badges (using badge_name, no criteria column)
    const badges = await Badge.bulkCreate([
      { badge_name: 'Top Tier Elite', description: 'Awarded for reaching the Platinum Rank tier', badge_code: 'TOP_TIER_ELITE' },
      { badge_name: 'Rising Star', description: 'Awarded for improving rank positions monthly', badge_code: 'RISING_STAR' },
      { badge_name: 'Active Contributor', description: 'Awarded for posting more than 10 media uploads', badge_code: 'ACTIVE_CONTRIBUTOR' }
    ]);
    logger.info(`Seeded ${badges.length} badges.`);

    // 6. Create Demo Users (using mobile field)
    // Hash is automatically calculated by user model hooks (password: 'password123')
    const superAdminUser = await User.create({
      email: 'superadmin@gds.com',
      password_hash: 'password123',
      first_name: 'Super',
      last_name: 'Admin',
      mobile: '1234567890'
    });

    const regionalAdminUser = await User.create({
      email: 'regionaladmin@gds.com',
      password_hash: 'password123',
      first_name: 'Regional',
      last_name: 'Admin',
      mobile: '1234567891'
    });

    const schoolAdminUser = await User.create({
      email: 'schooladmin@gds.com',
      password_hash: 'password123',
      first_name: 'School',
      last_name: 'Admin',
      mobile: '1234567892'
    });

    // Attach Roles
    await superAdminUser.addRole(superAdminRole);
    await regionalAdminUser.addRole(regionalAdminRole);
    await schoolAdminUser.addRole(schoolAdminRole);

    // Initial User Preferences (using UserNotificationPreference)
    await UserNotificationPreference.create({ user_id: superAdminUser.id, email_notifications: 1 });
    await UserNotificationPreference.create({ user_id: regionalAdminUser.id, email_notifications: 1 });
    await UserNotificationPreference.create({ user_id: schoolAdminUser.id, email_notifications: 1 });

    // Seed scopes (Create state, district, school first using correct column names)
    const state = await sequelize.models.State.create({ state_name: 'Karnataka', state_code: 'KA' });
    const district = await sequelize.models.District.create({ state_id: state.id, district_name: 'Bengaluru', district_code: 'BLR' });
    const school = await sequelize.models.School.create({ 
      district_id: district.id, 
      school_name: 'Global Discovery School East', 
      school_code: 'GDS-KA-01',
      status: 'APPROVED'
    });

    await sequelize.models.RegionalAdminScope.create({
      user_id: regionalAdminUser.id,
      state_id: state.id
    });

    await sequelize.models.SchoolAdminMapping.create({
      user_id: schoolAdminUser.id,
      school_id: school.id
    });

    logger.info('Seeded user accounts, demo profiles, and scoping parameters.');
    logger.info('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Database seeding failed: %o', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
module.exports = seedDatabase;

