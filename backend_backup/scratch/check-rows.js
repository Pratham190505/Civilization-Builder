const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'gds_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root123',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false
  }
);

async function checkRows() {
  try {
    await sequelize.authenticate();
    
    const [roles] = await sequelize.query('SELECT * FROM roles');
    console.log('\n--- Roles in DB ---');
    console.table(roles);

    const [permissions] = await sequelize.query('SELECT * FROM permissions LIMIT 10');
    console.log('\n--- Permissions in DB (First 10) ---');
    console.table(permissions);

    const [users] = await sequelize.query('SELECT id, email, first_name, last_name, status FROM users LIMIT 10');
    console.log('\n--- Users in DB (First 10) ---');
    console.table(users);

    const [userRoles] = await sequelize.query('SELECT * FROM user_role_assignments LIMIT 10');
    console.log('\n--- User Role Assignments in DB (First 10) ---');
    console.table(userRoles);

  } catch (error) {
    console.error('Error querying database rows:', error);
  } finally {
    await sequelize.close();
  }
}

checkRows();
