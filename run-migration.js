#!/usr/bin/env node

// This script runs the migration to add the middle_name field to the database
// Usage: node run-migration.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const migrationFile = path.join(__dirname, 'migrations', 'add-middle-name.sql');

if (!fs.existsSync(migrationFile)) {
  console.error(`ERROR: Migration file not found: ${migrationFile}`);
  process.exit(1);
}

try {
  console.log('Running migration to add middle_name column...');
  
  // Using neon CLI if available
  try {
    execSync(`neonctl sql --file ${migrationFile}`, { stdio: 'inherit' });
  } catch (error) {
    // Fallback to psql if neonctl is not available
    execSync(`psql "${DATABASE_URL}" -f ${migrationFile}`, { stdio: 'inherit' });
  }
  
  console.log('Migration completed successfully');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
