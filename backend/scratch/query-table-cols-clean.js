const fs = require('fs');
const path = require('path');

const dbSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_schema.json'), 'utf8'));

const targetTables = [
  'users',
  'roles',
  'permissions',
  'user_role_assignments',
  'regional_admin_scope',
  'school_admin_mapping',
  'schools',
  'states',
  'districts'
];

for (const tableName of targetTables) {
  console.log(`\n================= TABLE: ${tableName} =================`);
  const schema = dbSchema[tableName];
  if (!schema) {
    console.log('NOT FOUND');
    continue;
  }
  console.log('Columns:');
  for (const c of schema.columns) {
    console.log(`- ${c.name}: type=${c.type}, nullable=${c.nullable}, default=${c.default}, key=${c.key}, extra=${c.extra}`);
  }
  console.log('Foreign Keys:');
  for (const fk of schema.foreignKeys) {
    console.log(`- ${fk.column} references ${fk.referencedTable}(${fk.referencedColumn}) via ${fk.constraintName}`);
  }
}
