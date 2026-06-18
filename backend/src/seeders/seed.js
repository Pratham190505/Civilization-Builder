const { 
  sequelize, User, Role, Permission, RankTier, ScoreCategory, Badge, UserPreference, AdminProfile, UserRoleAssignment, RolePermission 
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
      { name: 'View States', code: 'VIEW_STATES', description: 'Can view state lists' },
      { name: 'Manage States', code: 'MANAGE_STATES', description: 'Can create/edit/delete states' },
      { name: 'View Districts', code: 'VIEW_DISTRICTS', description: 'Can view district lists' },
      { name: 'Manage Districts', code: 'MANAGE_DISTRICTS', description: 'Can create/edit/delete districts' },
      { name: 'View Schools', code: 'VIEW_SCHOOLS', description: 'Can view school profiles' },
      { name: 'Create School', code: 'CREATE_SCHOOL', description: 'Can onboarding submit schools' },
      { name: 'Update School', code: 'UPDATE_SCHOOL', description: 'Can edit school profiles' },
      { name: 'Delete School', code: 'DELETE_SCHOOL', description: 'Can delete schools' },
      { name: 'Approve School', code: 'APPROVE_SCHOOL', description: 'Can approve/reject school onboarding' },
      { name: 'Review Media', code: 'REVIEW_MEDIA', description: 'Can review media submissions' },
      { name: 'Approve Media', code: 'APPROVE_MEDIA', description: 'Can approve media submissions' },
      { name: 'Publish Media', code: 'PUBLISH_MEDIA', description: 'Can publish approved media to social accounts' },
      { name: 'Recalculate Rankings', code: 'RECALCULATE_RANKINGS', description: 'Can trigger manual scores calculation' },
      { name: 'View Analytics', code: 'VIEW_ANALYTICS', description: 'Can view analytical charts' },
      { name: 'View Audit Logs', code: 'VIEW_AUDIT_LOGS', description: 'Can inspect system audit logs' },
      { name: 'Manage Security', code: 'MANAGE_SECURITY', description: 'Can start user impersonations' },
      { name: 'Manage Recommendations', code: 'MANAGE_RECOMMENDATIONS', description: 'Can issue improvements recommendations' },
      { name: 'Schedule Inspections', code: 'SCHEDULE_INSPECTIONS', description: 'Can assign inspectors and schedule dates' },
      { name: 'Complete Inspections', code: 'COMPLETE_INSPECTIONS', description: 'Can input inspection scores and comments' }
    ];

    const permissions = await Permission.bulkCreate(permissionsData);
    logger.info(`Seeded ${permissions.length} permissions.`);

    // 2. Create Roles
    const superAdminRole = await Role.create({ name: 'Super Admin', description: 'Global unrestricted operations' });
    const regionalAdminRole = await Role.create({ name: 'Regional Admin', description: 'State-bound restricted operations' });
    const schoolAdminRole = await Role.create({ name: 'School Admin', description: 'School-bound restricted operations' });
    logger.info('Seeded administrative roles.');

    // 3. Map Roles to Permissions
    // Super Admin gets all permissions
    await superAdminRole.addPermissions(permissions);

    // Regional Admin permissions
    const regionalPermissions = permissions.filter(p => [
      'VIEW_STATES', 'VIEW_DISTRICTS', 'VIEW_SCHOOLS', 'CREATE_SCHOOL', 'UPDATE_SCHOOL',
      'REVIEW_MEDIA', 'PUBLISH_MEDIA', 'VIEW_ANALYTICS', 'SCHEDULE_INSPECTIONS',
      'COMPLETE_INSPECTIONS', 'MANAGE_RECOMMENDATIONS'
    ].includes(p.code));
    await regionalAdminRole.addPermissions(regionalPermissions);

    // School Admin permissions
    const schoolPermissions = permissions.filter(p => [
      'VIEW_SCHOOLS', 'UPDATE_SCHOOL', 'VIEW_ANALYTICS'
    ].includes(p.code));
    await schoolAdminRole.addPermissions(schoolPermissions);

    logger.info('Mapped role permissions.');

    // 4. Create Tiers
    const rankTiers = await RankTier.bulkCreate([
      { name: 'Platinum', min_score: 900, max_score: 1000, color: '#e5e4e2' },
      { name: 'Gold', min_score: 750, max_score: 899, color: '#ffd700' },
      { name: 'Silver', min_score: 500, max_score: 749, color: '#c0c0c0' },
      { name: 'Bronze', min_score: 250, max_score: 499, color: '#cd7f32' },
      { name: 'Not Ranked', min_score: 0, max_score: 249, color: '#808080' }
    ]);
    logger.info(`Seeded ${rankTiers.length} ranking tiers.`);

    // 5. Create Score Categories
    const scoreCategories = await ScoreCategory.bulkCreate([
      { name: 'Academics', weight: 300 },
      { name: 'Achievements', weight: 300 },
      { name: 'Media Uploads', weight: 300 },
      { name: 'Participation', weight: 100 }
    ]);
    logger.info(`Seeded ${scoreCategories.length} score categories.`);

    // 6. Create Badges
    const badges = await Badge.bulkCreate([
      { name: 'Top Tier Elite', description: 'Awarded for reaching the Platinum Rank tier', criteria: 'Reach Platinum Rank' },
      { name: 'Rising Star', description: 'Awarded for improving rank positions monthly', criteria: 'Positive Rank Delta' },
      { name: 'Active Contributor', description: 'Awarded for posting more than 10 media uploads', criteria: 'Media Submissions > 10' }
    ]);
    logger.info(`Seeded ${badges.length} badges.`);

    // 7. Create Demo Users
    // Hash is automatically calculated by user model hooks (password: 'password123')
    const superAdminUser = await User.create({
      email: 'superadmin@gds.com',
      password_hash: 'password123',
      first_name: 'Super',
      last_name: 'Admin',
      phone: '1234567890'
    });

    const regionalAdminUser = await User.create({
      email: 'regionaladmin@gds.com',
      password_hash: 'password123',
      first_name: 'Regional',
      last_name: 'Admin',
      phone: '1234567891'
    });

    const schoolAdminUser = await User.create({
      email: 'schooladmin@gds.com',
      password_hash: 'password123',
      first_name: 'School',
      last_name: 'Admin',
      phone: '1234567892'
    });

    // Attach Roles
    await superAdminUser.addRole(superAdminRole);
    await regionalAdminUser.addRole(regionalAdminRole);
    await schoolAdminUser.addRole(schoolAdminRole);

    // Initial User Preferences
    await UserPreference.create({ user_id: superAdminUser.id, theme: 'DARK' });
    await UserPreference.create({ user_id: regionalAdminUser.id, theme: 'LIGHT' });
    await UserPreference.create({ user_id: schoolAdminUser.id, theme: 'LIGHT' });

    // Seed scopes in AdminProfile (Regional bound to state #1, School bound to school #1)
    // Create state, district, school first to map them properly
    const state = await sequelize.models.State.create({ name: 'Karnataka', code: 'KA' });
    const district = await sequelize.models.District.create({ state_id: state.id, name: 'Bengaluru', code: 'BLR' });
    const school = await sequelize.models.School.create({ 
      district_id: district.id, 
      name: 'Global Discovery School East', 
      code: 'GDS-KA-01',
      status: 'APPROVED'
    });

    await AdminProfile.create({
      user_id: regionalAdminUser.id,
      state_id: state.id
    });

    await AdminProfile.create({
      user_id: schoolAdminUser.id,
      state_id: state.id,
      district_id: district.id,
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
