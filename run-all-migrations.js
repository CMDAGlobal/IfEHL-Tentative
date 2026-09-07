const { Client } = require('pg')
require('dotenv').config()

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const migrations = [
  // 1. Base tables
  `CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
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
    campaign_id INTEGER,
    approval_email_sent BOOLEAN DEFAULT FALSE,
    reminder_email_sent BOOLEAN DEFAULT FALSE,
    last_email_sent_date TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_email_registration UNIQUE (email)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email)`,
  `CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone)`,
  `CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_registrations_middle_name ON registrations(middle_name)`,
  `CREATE INDEX IF NOT EXISTS idx_registrations_campaign_id ON registrations(campaign_id)`,

  // 2. Admin users
  `CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)`,

  // 3. Campaigns
  `CREATE TABLE IF NOT EXISTS campaigns (
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
    whatsapp_number VARCHAR(30),
    whatsapp_group_link TEXT,
    payment_account_name VARCHAR(255),
    payment_account_number VARCHAR(50),
    payment_bank VARCHAR(100),
    payment_instructions TEXT,
    confirmation_email_text TEXT,
    approval_email_text TEXT,
    reminder_email_text TEXT,
    email_next_steps TEXT,
    email_footer_text TEXT,
    social_facebook VARCHAR(255),
    social_twitter VARCHAR(255),
    social_instagram VARCHAR(255),
    social_youtube VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`,

  // 4. Campaign registrations
  `CREATE TABLE IF NOT EXISTS campaign_registrations (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_campaign_registrations_campaign_id ON campaign_registrations(campaign_id)`,
  `CREATE INDEX IF NOT EXISTS idx_campaign_registrations_email ON campaign_registrations(email)`,

  // 5. Campaign images
  `CREATE TABLE IF NOT EXISTS campaign_images (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'gallery',
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_campaign_images_campaign_id ON campaign_images(campaign_id)`,

  // 6. Campaign email tracking
  `CREATE TABLE IF NOT EXISTS campaign_email_tracking (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL REFERENCES campaign_registrations(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_campaign_email_tracking_registration_id ON campaign_email_tracking(registration_id)`,

  // 7. Registration settings
  `CREATE TABLE IF NOT EXISTS registration_settings (
    id SERIAL PRIMARY KEY,
    registration_open BOOLEAN DEFAULT true,
    close_reason VARCHAR(500) DEFAULT 'Registration has closed as we have met the target number of participants.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
  )`,
  `INSERT INTO registration_settings (registration_open, close_reason) VALUES (true, 'Registration has closed as we have met the target number of participants.') ON CONFLICT DO NOTHING`,

  // 8. Email templates
  `CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('confirmation', 'approval', 'reminder')),
    name VARCHAR(120) NOT NULL,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_campaign_email_template UNIQUE (campaign_id, email_type)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS unique_global_email_template ON email_templates(email_type) WHERE campaign_id IS NULL`,

  // 9. Admin user (password: admin123)
  `INSERT INTO admin_users (email, password_hash) VALUES ('admin@cmdanigeria.org', '$2a$10$YQ8GvJxHdHpHvCWmhPzCHOJhZpCOhjqS3qgVChHRXXI5Ymj3eXGCy') ON CONFLICT (email) DO NOTHING`,

  // 10. Default campaign
  `INSERT INTO campaigns (slug, title, subtitle, description, start_date, end_date, location, registration_fee, status, is_registration_open, contact_phone, contact_email) VALUES ('ifehl-2026', 'IfEHL 2026', 'Building the next generation of Christian healthcare leaders', 'Institute for Excellence In Healthcare and Leadership - 2026 Cohort', '2026-06-07', '2026-06-14', 'Wholeness House, Gwagalada, Abuja', 50000, 'published', true, '08091533339', 'ifehl@cmdanigeria.org') ON CONFLICT (slug) DO NOTHING`
]

async function runMigrations() {
  await client.connect()
  console.log('Connected to Neon database')
  
  for (let i = 0; i < migrations.length; i++) {
    try {
      await client.query(migrations[i])
      console.log(`Migration ${i + 1}/${migrations.length} OK`)
    } catch (error) {
      console.error(`Migration ${i + 1} failed:`, error.message)
    }
  }
  
  await client.end()
  console.log('All done!')
}

runMigrations()
