const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function checkCampaigns() {
  // Read .env.local
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
  
  const sql = neon(dbUrl);
  
  console.log('Checking campaigns table...\n');
  
  // Get table structure
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'campaigns' 
    ORDER BY ordinal_position
  `;
  
  console.log('Campaigns table columns:');
  columns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
  
  // Get all campaigns
  const campaigns = await sql`
    SELECT * FROM campaigns ORDER BY created_at DESC
  `;
  
  console.log(`\nTotal campaigns: ${campaigns.length}\n`);
  
  if (campaigns.length > 0) {
    console.log('Latest campaign:');
    console.log(JSON.stringify(campaigns[0], null, 2));
  } else {
    console.log('No campaigns found in database.');
  }
}

checkCampaigns().catch(console.error);
