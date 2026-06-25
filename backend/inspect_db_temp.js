const { sequelize } = require('./src/models');

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    const [auditLogColumns] = await sequelize.query("DESCRIBE audit_logs");
    console.log('--- audit_logs columns ---');
    console.log(auditLogColumns);

    const [logs] = await sequelize.query("SELECT * FROM audit_logs LIMIT 5");
    console.log('--- audit_logs sample ---');
    console.log(JSON.stringify(logs, null, 2));

  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    process.exit(0);
  }
}

inspect();
