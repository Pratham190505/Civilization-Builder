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

async function findEnums() {
  try {
    await sequelize.authenticate();
    const [columns] = await sequelize.query(`
      SELECT table_name, column_name, column_type 
      FROM information_schema.columns 
      WHERE table_schema = :dbName AND data_type = 'enum'
    `, {
      replacements: { dbName: process.env.DB_NAME || 'gds_portal' }
    });

    console.log('--- ENUMS in Database ---');
    for (const col of columns) {
      console.log(`Table: ${col.TABLE_NAME || col.table_name}, Column: ${col.COLUMN_NAME || col.column_name}, Type/Values: ${col.COLUMN_TYPE || col.column_type}`);
    }

  } catch (error) {
    console.error('Error querying database enums:', error);
  } finally {
    await sequelize.close();
  }
}

findEnums();
