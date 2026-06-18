const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load DB Schema
const dbSchemaPath = path.join(__dirname, 'db_schema.json');
if (!fs.existsSync(dbSchemaPath)) {
  console.error('db_schema.json not found! Run inspect-db.js first.');
  process.exit(1);
}
const dbSchema = JSON.parse(fs.readFileSync(dbSchemaPath, 'utf8'));

// Import models
const models = require('../src/models');
const { sequelize } = models;

function getSequelizeTypeString(attr) {
  const typeObj = attr.type;
  if (!typeObj) return 'unknown';
  // Standard representation
  return typeObj.constructor.name || typeObj.toString();
}

async function analyze() {
  console.log('--- Database-to-Backend Model Comparison ---');
  
  const results = {
    missingModels: [], // tables in DB with no model
    extraModels: [],   // models with no table in DB
    alignedModels: {},
    mismatches: []
  };

  // List of tables in database
  const dbTables = Object.keys(dbSchema);
  
  // List of Sequelize models
  const modelKeys = Object.keys(models).filter(k => k !== 'sequelize' && k !== 'Sequelize');
  
  // Create a mapping of tableName -> modelName
  const tableNameToModelName = {};
  const modelNameToTableName = {};
  
  for (const modelKey of modelKeys) {
    const model = models[modelKey];
    tableNameToModelName[model.tableName] = modelKey;
    modelNameToTableName[modelKey] = model.tableName;
  }

  // Find missing models (tables in DB but no model mapped to it)
  for (const table of dbTables) {
    if (!tableNameToModelName[table]) {
      results.missingModels.push(table);
    }
  }

  // Find extra models (models mapped to tables that don't exist in DB)
  for (const modelKey of modelKeys) {
    const model = models[modelKey];
    if (!dbTables.includes(model.tableName)) {
      results.extraModels.push({ modelName: modelKey, tableName: model.tableName });
    }
  }

  // Compare columns for models that exist in both
  for (const modelKey of modelKeys) {
    const model = models[modelKey];
    const tableName = model.tableName;
    
    if (!dbTables.includes(tableName)) continue;
    
    const dbTable = dbSchema[tableName];
    const dbColumns = dbTable.columns;
    const modelAttributes = model.rawAttributes;
    
    const modelColNames = Object.keys(modelAttributes).map(k => modelAttributes[k].field || k);
    const dbColNames = dbColumns.map(c => c.name);
    
    const modelFieldsToAttributes = {};
    for (const attrName of Object.keys(modelAttributes)) {
      const field = modelAttributes[attrName].field || attrName;
      modelFieldsToAttributes[field] = attrName;
    }

    const missingColumns = []; // in DB but not in Model
    const extraColumns = [];   // in Model but not in DB
    const typeMismatches = [];
    const pkMismatches = [];
    const nullableMismatches = [];

    // Find missing columns in Sequelize Model
    for (const dbCol of dbColumns) {
      if (!modelColNames.includes(dbCol.name)) {
        missingColumns.push(dbCol);
      } else {
        // Compare details
        const attrName = modelFieldsToAttributes[dbCol.name];
        const attr = modelAttributes[attrName];
        
        // PK comparison
        const isDbPk = dbCol.key === 'PRI';
        const isModelPk = !!attr.primaryKey;
        if (isDbPk !== isModelPk) {
          pkMismatches.push({
            column: dbCol.name,
            dbPk: isDbPk,
            modelPk: isModelPk
          });
        }

        // Nullable comparison
        const isDbNullable = dbCol.nullable;
        const isModelNullable = attr.allowNull !== false; // default in Sequelize is true
        if (isDbNullable !== isModelNullable) {
          nullableMismatches.push({
            column: dbCol.name,
            dbNullable: isDbNullable,
            modelNullable: isModelNullable
          });
        }
      }
    }

    // Find extra columns in Sequelize Model
    for (const modelCol of modelColNames) {
      if (!dbColNames.includes(modelCol)) {
        extraColumns.push(modelCol);
      }
    }

    if (missingColumns.length > 0 || extraColumns.length > 0 || pkMismatches.length > 0 || nullableMismatches.length > 0) {
      results.mismatches.push({
        modelName: modelKey,
        tableName,
        missingColumns: missingColumns.map(c => `${c.name} (${c.type})`),
        extraColumns,
        pkMismatches,
        nullableMismatches
      });
    } else {
      results.alignedModels[modelKey] = tableName;
    }
  }

  // Analysis of foreign keys vs Associations
  console.log('\n--- Association & Foreign Key Audit ---');
  // Let's get associations defined in Sequelize
  const associationsReport = [];
  for (const modelKey of modelKeys) {
    const model = models[modelKey];
    const assocKeys = Object.keys(model.associations);
    
    for (const assocKey of assocKeys) {
      const association = model.associations[assocKey];
      associationsReport.push({
        sourceModel: modelKey,
        targetModel: association.target.name,
        type: association.associationType, // HasMany, BelongsTo, BelongsToMany, HasOne
        foreignKey: association.foreignKey,
        otherKey: association.otherKey,
        through: association.through ? association.through.model.name : null
      });
    }
  }

  // Dump detailed reports
  const fullReport = {
    comparison: results,
    associations: associationsReport
  };

  fs.writeFileSync(
    path.join(__dirname, 'compatibility_report.json'),
    JSON.stringify(fullReport, null, 2)
  );
  console.log('Saved compatibility_report.json');

  console.log(`\nSummary:`);
  console.log(`- Missing Models: ${results.missingModels.length}`);
  console.log(`- Extra Models: ${results.extraModels.length}`);
  console.log(`- Mismatched Models: ${results.mismatches.length}`);
  console.log(`- Perfectly Aligned Models: ${Object.keys(results.alignedModels).length}`);
  
  if (results.missingModels.length > 0) {
    console.log('\nMissing Models (tables in DB but no model):');
    console.log(results.missingModels);
  }
  
  if (results.extraModels.length > 0) {
    console.log('\nExtra Models (models in code but no table in DB):');
    console.log(results.extraModels);
  }

  if (results.mismatches.length > 0) {
    console.log('\nMismatched Models details (first 5):');
    console.log(JSON.stringify(results.mismatches.slice(0, 5), null, 2));
  }
  
  await sequelize.close();
}

analyze().catch(err => {
  console.error(err);
  sequelize.close();
});
