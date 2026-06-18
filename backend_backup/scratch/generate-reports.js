const fs = require('fs');
const path = require('path');

const dbSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_schema.json'), 'utf8'));
const compatReport = JSON.parse(fs.readFileSync(path.join(__dirname, 'compatibility_report.json'), 'utf8'));

const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// 1. Generate Database Relationship Report
function generateDbRelationshipReport() {
  let markdown = `# Database Relationship Report\n\n`;
  markdown += `This report outlines the structural details of all tables in the \`gds_portal\` database, including primary keys, foreign keys, referenced tables, and mapped Sequelize associations.\n\n`;
  markdown += `| Table Name | Primary Key | Foreign Keys | Referenced Table(s) | Associations |\n`;
  markdown += `|---|---|---|---|---|\n`;

  for (const [tableName, schema] of Object.entries(dbSchema)) {
    const pk = schema.columns.filter(c => c.key === 'PRI').map(c => c.name).join(', ') || 'None';
    const fks = schema.foreignKeys.map(fk => fk.column).join(', ') || 'None';
    const refTables = schema.foreignKeys.map(fk => fk.referencedTable).join(', ') || 'None';
    
    // Find associated models and their types
    const modelKey = Object.keys(compatReport.comparison.alignedModels).concat(compatReport.comparison.mismatches.map(m => m.modelName))
      .find(k => {
        try {
          const mod = require('../src/models/' + k.charAt(0).toLowerCase() + k.slice(1));
          return mod.tableName === tableName;
        } catch (e) {
          // Model naming might not map exactly
          return k.toLowerCase() === tableName.replace(/_/g, '');
        }
      });
      
    let assocStr = 'None';
    if (modelKey) {
      const assocs = compatReport.associations.filter(a => a.sourceModel === modelKey);
      if (assocs.length > 0) {
        assocStr = assocs.map(a => `${a.type} -> ${a.targetModel} (${a.foreignKey})`).join('<br>');
      }
    }
    
    markdown += `| \`${tableName}\` | ${pk} | ${fks} | ${refTables} | ${assocStr} |\n`;
  }

  fs.writeFileSync(path.join(reportsDir, 'database_relationship_report.md'), markdown);
  console.log('Saved database_relationship_report.md');
}

// 2. Generate Backend Compatibility Report
function generateBackendCompatibilityReport() {
  let markdown = `# Backend Compatibility Report\n\n`;
  markdown += `## Summary of Compatibility\n\n`;
  
  const comp = compatReport.comparison;
  const totalModels = comp.mismatches.length + Object.keys(comp.alignedModels).length;
  
  markdown += `- **Perfectly Aligned Models**: ${Object.keys(comp.alignedModels).length} / ${totalModels}\n`;
  markdown += `- **Mismatched Models**: ${comp.mismatches.length} / ${totalModels}\n`;
  markdown += `- **Missing Models (Tables in DB but no model)**: ${comp.missingModels.length}\n`;
  markdown += `- **Extra Models (Models in codebase but no table in DB)**: ${comp.extraModels.length}\n\n`;

  markdown += `## Missing Models (Need Creation)\n\n`;
  if (comp.missingModels.length > 0) {
    comp.missingModels.forEach(m => {
      markdown += `- \`${m}\` (Should create model file \`${m.replace(/_([a-z])/g, (g) => g[1].toUpperCase())}.js\`)\n`;
    });
  } else {
    markdown += `*No missing models identified.*\n`;
  }

  markdown += `\n## Extra Models (Need Removal/Refactoring)\n\n`;
  if (comp.extraModels.length > 0) {
    comp.extraModels.forEach(m => {
      markdown += `- Model: \`${m.modelName}\` (Table: \`${m.tableName}\`)\n`;
    });
  } else {
    markdown += `*No extra models identified.*\n`;
  }

  markdown += `\n## Model Column & Constraint Mismatches (Need Real Table Alignment)\n\n`;
  if (comp.mismatches.length > 0) {
    comp.mismatches.forEach(m => {
      markdown += `### Model: \`${m.modelName}\` (Table: \`${m.tableName}\`)\n\n`;
      if (m.missingColumns.length > 0) {
        markdown += `- **Missing Columns (in DB but not in Model)**:\n`;
        m.missingColumns.forEach(c => markdown += `  - \`${c}\`\n`);
      }
      if (m.extraColumns.length > 0) {
        markdown += `- **Extra Columns (in Model but not in DB)**:\n`;
        m.extraColumns.forEach(c => markdown += `  - \`${c}\`\n`);
      }
      if (m.pkMismatches.length > 0) {
        markdown += `- **Primary Key Mismatches**:\n`;
        m.pkMismatches.forEach(p => markdown += `  - Column \`${p.column}\`: DB PrimaryKey = ${p.dbPk}, Model PrimaryKey = ${p.modelPk}\n`);
      }
      if (m.nullableMismatches.length > 0) {
        markdown += `- **Nullability Mismatches**:\n`;
        m.nullableMismatches.forEach(n => markdown += `  - Column \`${n.column}\`: DB Nullable = ${n.dbNullable}, Model Nullable = ${n.modelNullable}\n`);
      }
      markdown += `\n`;
    });
  } else {
    markdown += `*All models are perfectly aligned with database tables.*\n`;
  }

  markdown += `\n## Broken Modules & Potential Issues\n\n`;
  markdown += `1. **ImpersonationSession & UserSession**: The database contains \`impersonation_sessions\` but does NOT contain \`user_sessions\` or \`user_preferences\` or \`admin_profiles\`. Authentication and impersonation logic must use \`users\` table columns (such as \`last_login\`, \`user_code\`, etc.) directly, or use the correct fields.\n`;
  markdown += `2. **School Admin Mapping**: The mapping of School Admins is handled by a new join table \`school_admin_mapping\` which references \`user_id\` and \`school_id\`. The \`AdminProfile\` model needs to be removed/refactored, and query references updated to join via \`school_admin_mapping\`.\n`;
  markdown += `3. **State Admin Scope**: Regional admins are assigned states in \`regional_admin_scope\` which references \`user_id\` and \`state_id\`. Scoping middleware must query this table rather than checking an \`AdminProfile\` state field.\n`;
  markdown += `4. **Role & Permission Naming**: The \`roles\` table uses column \`role_name\` (not \`name\`), and the \`permissions\` table uses \`permission_key\` and \`module_name\` (not \`name\` or \`code\`). These must be updated in models and throughout the RBAC code.\n`;

  fs.writeFileSync(path.join(reportsDir, 'backend_compatibility_report.md'), markdown);
  console.log('Saved backend_compatibility_report.md');
}

// 3. Generate Backend Readiness Report
function generateBackendReadinessReport() {
  let markdown = `# Backend Readiness Report\n\n`;
  markdown += `This report outlines the status of major features and modules in the backend, identifying their current readiness state and the required fixes to achieve compatibility with the real production database.\n\n`;
  
  markdown += `| Module / Feature | Status | Mapped to Schema | Actions Required |\n`;
  markdown += `|---|---|---|---|\n`;
  
  markdown += `| **Authentication** | ⚠️ Needs Update | Yes (partially) | Update JWT login and registration logic to query actual \`users\` columns. Remove references to \`user_sessions\` and \`user_preferences\`. |\n`;
  markdown += `| **RBAC** | ⚠️ Needs Update | Yes (partially) | Align models for \`users\`, \`roles\`, \`permissions\`, and \`user_role_assignments\`. Refactor RBAC middlewares (Auth, Permission, Scope) to query correct table columns (\`role_name\`, \`permission_key\`, \`module_name\`). |\n`;
  markdown += `| **School Admin Scope** | 🔴 Incompatible | No (using placeholder \`admin_profiles\`) | Map \`school_admin_mapping\` table, update Middleware and controllers to verify if a user has access to a school. |\n`;
  markdown += `| **State Admin Scope** | 🔴 Incompatible | No (using placeholder \`admin_profiles\`) | Map \`regional_admin_scope\` table, update Middleware and controllers to filter requests by the regional admin's state. |\n`;
  markdown += `| **Media Workflow** | ⚠️ Needs Update | Yes (partially) | Align models (\`media_assets\`, \`media_submissions\`, \`media_submission_versions\`, \`media_version_assets\`, \`submission_reviews\`, \`submission_review_steps\`, \`media_publications\`) and update approval endpoints. |\n`;
  markdown += `| **Ranking System** | ⚠️ Needs Update | Yes (partially) | Refactor ranking calculation queries to use correct table mappings for score components, category, rule, history, and snapshots. |\n`;
  markdown += `| **Recommendations** | ⚠️ Needs Update | Yes (partially) | Align models (\`school_recommendations\`, \`recommendation_status_history\`, \`proposal_call_requests\`, \`service_packages\`, \`school_package_proposals\`) and adjust query structures. |\n`;
  markdown += `| **Reports & Inspections** | ⚠️ Needs Update | Yes (partially) | Align models (\`inspection_requests\`, \`inspection_reports\`, \`generated_reports\`) and fix controller/service logic. |\n`;
  markdown += `| **Notifications** | ⚠️ Needs Update | Yes (partially) | Update Socket.IO dynamic notifications to query actual \`notifications\`, \`notification_recipients\` and \`user_notification_preferences\`. |\n`;
  markdown += `| **Analytics** | ⚠️ Needs Update | Yes (partially) | Adjust National/State/School queries to fetch from \`district_performance_snapshots\`, \`school_metric_snapshots\`, and \`social_daily_metrics\`. |\n`;
  markdown += `| **Audit & Security** | ⚠️ Needs Update | Yes (partially) | Align models \`audit_logs\`, \`impersonation_sessions\`, and \`webhook_events\`. Implement full audit logging across login, logout, approvals, rejections, ranking changes, etc. |\n`;

  fs.writeFileSync(path.join(reportsDir, 'backend_readiness_report.md'), markdown);
  console.log('Saved backend_readiness_report.md');
}

generateDbRelationshipReport();
generateBackendCompatibilityReport();
generateBackendReadinessReport();
