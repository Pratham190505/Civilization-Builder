const path = require('path');
const backendDir = 'c:/Users/Rana Ruchi/OneDrive/Desktop/internship 2.o/final/Civilization-Builder/backend';
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
dotenv.config({ path: path.join(backendDir, '.env') });

const { sequelize } = require(path.join(backendDir, 'src/models'));

async function inspect() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10");
    console.log('Last 10 audit logs:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspect();
