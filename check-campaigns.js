const { Client } = require('pg')
require('dotenv').config()

async function checkCampaigns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  await client.connect()
  const result = await client.query('SELECT id, slug, title, status FROM campaigns ORDER BY id')
  console.log('Campaigns:')
  result.rows.forEach(r => console.log(`  ID: ${r.id}, Slug: ${r.slug}, Title: ${r.title}, Status: ${r.status}`))
  await client.end()
}

checkCampaigns()
