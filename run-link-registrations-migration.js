const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  // Database connection string from environment variable
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables')
    console.error('Make sure .env.local exists with DATABASE_URL')
    process.exit(1)
  }
  
  console.log('🔗 Connecting to database...')
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  })

  try {
    console.log('🔗 Starting migration to link registrations to campaigns...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'link-registrations-to-campaigns.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute the migration
    await pool.query(migrationSQL)
    
    console.log('✅ Migration completed successfully!')
    
    // Check results
    const result = await pool.query(`
      SELECT 
        c.title as campaign,
        COUNT(r.id) as registration_count
      FROM registrations r
      LEFT JOIN campaigns c ON r.campaign_id = c.id
      GROUP BY c.id, c.title
      ORDER BY registration_count DESC
    `)
    
    console.log('\n📊 Registrations by Campaign:')
    result.rows.forEach(row => {
      console.log(`   ${row.campaign || 'No Campaign'}: ${row.registration_count} registrations`)
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
