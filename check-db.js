const { neon } = require('@neondatabase/serverless');

async function checkDB() {
  // Read .env.local manually
  const fs = require('fs');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
  
  const sql = neon(dbUrl);
  
  console.log('Checking database tables...\n');
  
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  
  console.log('Tables found:');
  tables.forEach(t => console.log('  -', t.table_name));
  
  // Check registrations table structure if it exists
  const regTable = tables.find(t => t.table_name === 'registrations');
  if (regTable) {
    console.log('\nRegistrations table columns:');
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations' 
      ORDER BY ordinal_position
    `;
    cols.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
    
    console.log('\nRegistration count:');
    const count = await sql`SELECT COUNT(*) as count FROM registrations`;
    console.log('  Total:', count[0].count);
  }
}

checkDB().catch(console.error);
