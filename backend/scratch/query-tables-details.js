const fs = require('fs');
const path = require('path');

const dbSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_schema.json'), 'utf8'));

const targetTables = [
  'impersonation_sessions',
  'audit_logs',
  'webhook_events',
  'media_assets',
  'media_submissions',
  'media_submission_versions',
  'media_version_assets',
  'submission_reviews',
  'submission_review_steps',
  'media_publications'
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
