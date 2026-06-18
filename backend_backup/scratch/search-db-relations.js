const fs = require('fs');
const path = require('path');

const dbSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_schema.json'), 'utf8'));

console.log('Tables in DB:');
console.log(Object.keys(dbSchema));

console.log('\nTables containing "permission" or "role":');
for (const tableName of Object.keys(dbSchema)) {
  if (tableName.includes('permission') || tableName.includes('role')) {
    console.log(`- ${tableName}`);
  }
}
