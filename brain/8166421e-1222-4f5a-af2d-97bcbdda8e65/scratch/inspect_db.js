const { sequelize } = require('c:/Users/Rana Ruchi/OneDrive/Desktop/internship 2.o/final/Civilization-Builder/backend/src/models');

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    const [auditLogColumns] = await sequelize.query("DESCRIBE audit_logs");
    console.log('--- audit_logs columns ---');
    console.log(auditLogColumns);
    
    const [schoolsColumns] = await sequelize.query("DESCRIBE schools");
    console.log('--- schools columns ---');
    console.log(schoolsColumns);

    const [logs] = await sequelize.query("SELECT * FROM audit_logs LIMIT 5");
    console.log('--- audit_logs sample ---');
    console.log(logs);

  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    process.exit(0);
  }
}

inspect();
