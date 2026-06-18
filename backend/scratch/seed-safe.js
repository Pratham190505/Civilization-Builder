const bcrypt = require('bcryptjs');
const { 
  sequelize, User, Role, State, District, School, SchoolAdminMapping, RegionalAdminScope, UserRoleAssignment 
} = require('../src/models');

async function seedSafe() {
  console.log('Starting safe seeding...');
  try {
    await sequelize.authenticate();
    console.log('Database connection OK.');

    // 1. Fetch or verify existing roles
    const roles = await Role.findAll();
    console.log(`Found ${roles.length} roles in DB:`, roles.map(r => r.role_name));

    const superAdminRole = roles.find(r => r.role_name === 'SUPER_ADMIN') || await Role.create({ role_name: 'SUPER_ADMIN', description: 'Global access' });
    const regionalAdminRole = roles.find(r => r.role_name === 'REGIONAL_ADMIN') || await Role.create({ role_name: 'REGIONAL_ADMIN', description: 'State level access' });
    const schoolAdminRole = roles.find(r => r.role_name === 'SCHOOL_ADMIN') || await Role.create({ role_name: 'SCHOOL_ADMIN', description: 'School level access' });

    // 2. Clear existing test data to avoid duplicates or double-hashing
    await UserRoleAssignment.destroy({ where: {} });
    await SchoolAdminMapping.destroy({ where: {} });
    await RegionalAdminScope.destroy({ where: {} });
    await User.destroy({ where: {} });

    // 3. Create Users (pass plain text password; the hooks will hash it once)
    const superAdminUser = await User.create({
      email: 'superadmin@gds.com',
      first_name: 'Super',
      last_name: 'Admin',
      mobile: '1234567890',
      password_hash: 'password123',
      status: 'ACTIVE',
      created_at: new Date()
    });
    console.log('Super Admin User ready.');

    const regionalAdminUser = await User.create({
      email: 'regionaladmin@gds.com',
      first_name: 'Regional',
      last_name: 'Admin',
      mobile: '1234567891',
      password_hash: 'password123',
      status: 'ACTIVE',
      created_at: new Date()
    });
    console.log('Regional Admin User ready.');

    const schoolAdminUser = await User.create({
      email: 'schooladmin@gds.com',
      first_name: 'School',
      last_name: 'Admin',
      mobile: '1234567892',
      password_hash: 'password123',
      status: 'ACTIVE',
      created_at: new Date()
    });
    console.log('School Admin User ready.');

    // 4. Assign Roles
    await UserRoleAssignment.findOrCreate({
      where: { user_id: superAdminUser.id, role_id: superAdminRole.id },
      defaults: { assigned_at: new Date() }
    });
    await UserRoleAssignment.findOrCreate({
      where: { user_id: regionalAdminUser.id, role_id: regionalAdminRole.id },
      defaults: { assigned_at: new Date() }
    });
    await UserRoleAssignment.findOrCreate({
      where: { user_id: schoolAdminUser.id, role_id: schoolAdminRole.id },
      defaults: { assigned_at: new Date() }
    });
    console.log('Roles assigned to users.');

    // 5. Seed Geography
    const [state] = await State.findOrCreate({
      where: { state_code: 'KA' },
      defaults: {
        state_name: 'Karnataka',
        is_active: 1,
        created_at: new Date()
      }
    });
    console.log('State ready:', state.state_name);

    const [district] = await District.findOrCreate({
      where: { district_code: 'BLR' },
      defaults: {
        state_id: state.id,
        district_name: 'Bengaluru',
        is_active: 1,
        created_at: new Date()
      }
    });
    console.log('District ready:', district.district_name);

    const [school] = await School.findOrCreate({
      where: { school_code: 'GDS-KA-01' },
      defaults: {
        district_id: district.id,
        school_name: 'Global Discovery School East',
        udise_code: '29200100201',
        principal_name: 'Dr. Jane Smith',
        mobile: '9876543210',
        student_count: 500,
        teacher_count: 35,
        status: 'APPROVED',
        media_upload_enabled: 1,
        created_at: new Date()
      }
    });
    console.log('School ready:', school.school_name);

    // 6. Seed Mappings
    await SchoolAdminMapping.findOrCreate({
      where: { school_id: school.id, user_id: schoolAdminUser.id }
    });
    console.log('School Admin mapped to School.');

    await RegionalAdminScope.findOrCreate({
      where: { user_id: regionalAdminUser.id, state_id: state.id }
    });
    console.log('Regional Admin scoped to State.');

    console.log('Safe seeding successfully completed!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await sequelize.close();
  }
}

seedSafe();
