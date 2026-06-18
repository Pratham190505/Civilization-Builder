const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'gds_portal',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  dialect: 'mysql',
  logging: false
};

console.log('Connecting to database with config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  password: '***'
});

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: false
});

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // 1. Get list of all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = :dbName
    `, {
      replacements: { dbName: dbConfig.database }
    });

    const tableNames = tables.map(t => t.table_name || t.TABLE_NAME);
    console.log(`Found ${tableNames.length} tables in database.`);

    // 2. Get column information for each table
    const dbSchema = {};
    for (const tableName of tableNames) {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default, column_key, extra
        FROM information_schema.columns
        WHERE table_schema = :dbName AND table_name = :tableName
        ORDER BY ordinal_position
      `, {
        replacements: { dbName: dbConfig.database, tableName }
      });

      const [foreignKeys] = await sequelize.query(`
        SELECT 
          column_name, 
          referenced_table_name, 
          referenced_column_name,
          constraint_name
        FROM information_schema.key_column_usage
        WHERE table_schema = :dbName 
          AND table_name = :tableName 
          AND referenced_table_name IS NOT NULL
      `, {
        replacements: { dbName: dbConfig.database, tableName }
      });

      dbSchema[tableName] = {
        columns: columns.map(c => ({
          name: c.column_name || c.COLUMN_NAME,
          type: c.data_type || c.DATA_TYPE,
          nullable: (c.is_nullable || c.IS_NULLABLE) === 'YES',
          default: c.column_default || c.COLUMN_DEFAULT,
          key: c.column_key || c.COLUMN_KEY,
          extra: c.extra || c.EXTRA
        })),
        foreignKeys: foreignKeys.map(fk => ({
          column: fk.column_name || fk.COLUMN_NAME,
          referencedTable: fk.referenced_table_name || fk.REFERENCED_TABLE_NAME,
          referencedColumn: fk.referenced_column_name || fk.REFERENCED_COLUMN_NAME,
          constraintName: fk.constraint_name || fk.CONSTRAINT_NAME
        }))
      };
    }

    // Write DB schema to JSON for references
    fs.writeFileSync(
      path.join(__dirname, 'db_schema.json'),
      JSON.stringify(dbSchema, null, 2)
    );
    console.log('Saved db_schema.json');

    // 3. Scan Sequelize models directory
    const modelsDir = path.join(__dirname, '../src/models');
    const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');
    console.log(`Found ${modelFiles.length} model files in src/models.`);

    const modelMappings = [];
    for (const modelFile of modelFiles) {
      try {
        const modelModule = require(path.join(modelsDir, modelFile));
        // Some files might export sequelize model directly or function.
        // Let's inspect model.
        let model = modelModule;
        if (typeof modelModule === 'function') {
          // If it is a function that takes sequelize, we can't easily execute it without context,
          // but let's check its name or properties.
        }
        
        // Let's read file content directly to parse or get model name/tableName
        const content = fs.readFileSync(path.join(modelsDir, modelFile), 'utf8');
        // Extract define name and tableName
        const defineMatch = content.match(/sequelize\.define\(\s*['"]([^'"]+)['"]/);
        const tableNameMatch = content.match(/tableName:\s*['"]([^'"]+)['"]/);
        
        let modelName = defineMatch ? defineMatch[1] : modelFile.replace('.js', '');
        let tableName = tableNameMatch ? tableNameMatch[1] : null;
        
        if (!tableName) {
          // Check if defined as class extending Model or using define
          const classMatch = content.match(/class\s+(\w+)\s+extends/);
          if (classMatch) {
            modelName = classMatch[1];
          }
          // Try to find tableName in init options
          const initTableMatch = content.match(/tableName:\s*['"]([^'"]+)['"]/);
          if (initTableMatch) {
            tableName = initTableMatch[1];
          }
        }
        
        if (!tableName) {
          // Guess tableName using underscore convention or lowercase
          tableName = modelName.replace(/([A-Z])/g, '_$1').toLowerCase();
          if (tableName.startsWith('_')) tableName = tableName.substring(1);
          // Sequelize plurals by default, but let's see.
        }

        modelMappings.push({
          file: modelFile,
          modelName,
          guessedTableName: tableName,
          existsInDb: tableNames.includes(tableName)
        });
      } catch (err) {
        console.error(`Error analyzing model file ${modelFile}:`, err.message);
      }
    }

    fs.writeFileSync(
      path.join(__dirname, 'model_mappings.json'),
      JSON.stringify(modelMappings, null, 2)
    );
    console.log('Saved model_mappings.json');
    console.log('Inspection complete.');
  } catch (error) {
    console.error('Error running inspection script:', error);
  } finally {
    await sequelize.close();
  }
}

main();
