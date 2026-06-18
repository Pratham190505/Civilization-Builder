const fs = require('fs');
const path = require('path');

const dbSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_schema.json'), 'utf8'));

console.log('--- Inspecting Roles & Permissions Schema ---');

// Search for any foreign keys referencing roles or permissions
for (const [tableName, schema] of Object.entries(dbSchema)) {
  const referencesRolesOrPermissions = schema.foreignKeys.some(fk => 
    fk.referencedTable === 'roles' || fk.referencedTable === 'permissions'
  );
  
  if (referencesRolesOrPermissions) {
    console.log(`Table '${tableName}' references roles or permissions:`);
    console.log(schema.foreignKeys);
  }
}

// Inspect role columns
console.log('\nroles table columns:');
console.log(dbSchema.roles ? dbSchema.roles.columns : 'not found');

// Inspect permissions columns
console.log('\npermissions table columns:');
console.log(dbSchema.permissions ? dbSchema.permissions.columns : 'not found');
