const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function runMigration() {
  // Read .env.local manually
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
  
  const sql = neon(dbUrl);
  
  console.log('Running campaigns migration...\n');
  
  // Create campaigns table
  await sql`
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      location VARCHAR(255) NOT NULL,
      venue_details TEXT,
      registration_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
      registration_deadline DATE,
      status VARCHAR(20) DEFAULT 'draft',
      is_registration_open BOOLEAN DEFAULT false,
      target_participants INTEGER,
      banner_image_url TEXT,
      logo_image_url TEXT,
      contact_phone VARCHAR(20),
      contact_email VARCHAR(255),
      payment_account_name VARCHAR(255),
      payment_account_number VARCHAR(50),
      payment_bank VARCHAR(100),
      payment_instructions TEXT,
      social_facebook VARCHAR(255),
      social_twitter VARCHAR(255),
      social_instagram VARCHAR(255),
      social_youtube VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP WITH TIME ZONE
    )
  `;
  console.log('✓ Created campaigns table');
  
  // Create campaign_registrations table
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_registrations (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      first_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      alt_phone VARCHAR(20),
      gender VARCHAR(10) NOT NULL,
      dob DATE NOT NULL,
      marital_status VARCHAR(20),
      city VARCHAR(100),
      address TEXT,
      institute VARCHAR(255),
      professional_status VARCHAR(100),
      workplace VARCHAR(255),
      attended BOOLEAN,
      expectations TEXT,
      hear_about TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      payment_status VARCHAR(20) DEFAULT 'unpaid',
      payment_reference VARCHAR(100),
      payment_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_email_per_campaign UNIQUE (campaign_id, email)
    )
  `;
  console.log('✓ Created campaign_registrations table');
  
  // Create campaign_images table
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_images (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      image_type VARCHAR(50) DEFAULT 'gallery',
      alt_text VARCHAR(255),
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✓ Created campaign_images table');
  
  // Create campaign_email_tracking table
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_email_tracking (
      id SERIAL PRIMARY KEY,
      registration_id INTEGER NOT NULL REFERENCES campaign_registrations(id) ON DELETE CASCADE,
      email_type VARCHAR(50) NOT NULL,
      sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✓ Created campaign_email_tracking table');
  
  // Create indices
  await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_registrations_campaign_id ON campaign_registrations(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_registrations_email ON campaign_registrations(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_images_campaign_id ON campaign_images(campaign_id)`;
  console.log('✓ Created indices');
  
  // Insert the existing IFEHL 2025-03 as first campaign
  const existingCampaign = await sql`SELECT id FROM campaigns WHERE slug = 'ifehl-2025-03' LIMIT 1`;
  
  if (existingCampaign.length === 0) {
    await sql`
      INSERT INTO campaigns (
        slug, title, subtitle, description, start_date, end_date, location, venue_details,
        registration_fee, registration_deadline, status, is_registration_open,
        contact_phone, payment_account_name, payment_account_number, payment_bank, payment_instructions
      ) VALUES (
        'ifehl-2025-03',
        'IFEHL 2025 (03)',
        'Institute for Excellence in Healthcare and Leadership',
        'A transformative program for medical professionals',
        '2025-11-16',
        '2025-11-23',
        'Wholeness House, Gwagalada, Abuja',
        'Wholeness House, Gwagalada, Abuja',
        50000,
        '2025-10-31',
        'published',
        true,
        '08091533339',
        'Christian Medical and Dental Association of Nigeria',
        '1018339742',
        'UBA',
        'Add "IFEHL 2025(03)" to the narration when making transfer for registration.'
      )
    `;
    console.log('✓ Created initial campaign: IFEHL 2025 (03)');
  } else {
    console.log('! Campaign IFEHL 2025 (03) already exists');
  }
  
  console.log('\n✓ Migration completed successfully!');
  
  // Show tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log('\nCurrent tables:');
  tables.forEach(t => console.log('  -', t.table_name));
}

runMigration().catch(console.error);
