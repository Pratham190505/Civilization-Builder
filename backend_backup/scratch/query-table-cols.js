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
  console.table(schema.columns.map(c => ({
    Name: c.name,
    Type: c.type,
    Nullable: c.nullable,
    Default: c.default,
    Key: c.key,
    Extra: c.extra
  })));
  console.log('Foreign Keys:');
  console.table(schema.foreignKeys);
}
