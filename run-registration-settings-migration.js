#!/usr/bin/env node

// This script runs the registration settings migration
// Usage: node run-registration-settings-migration.js

const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const migrationFile = path.join(__dirname, 'migrations', 'add-registration-settings.sql');

if (!fs.existsSync(migrationFile)) {
  console.error(`ERROR: Migration file not found: ${migrationFile}`);
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('Running migration to add registration_settings table...');
    
    const sql = neon(DATABASE_URL);
    
    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS registration_settings (
        id SERIAL PRIMARY KEY,
        registration_open BOOLEAN DEFAULT true,
        close_reason VARCHAR(500) DEFAULT 'Registration has closed as we have met the target number of participants.',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(255)
      )
    `;
    
    // Insert default settings if not exists
    await sql`
      INSERT INTO registration_settings (id, registration_open, close_reason)
      VALUES (1, true, 'Registration has closed as we have met the target number of participants.')
      ON CONFLICT (id) DO NOTHING
    `;
    
    console.log('✅ Migration completed successfully');
    console.log('Registration settings table created with default values');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
