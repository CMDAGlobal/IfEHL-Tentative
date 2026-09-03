-- Migration: Add multi-campaign support
-- Run this migration to add campaigns and campaign-specific registrations

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,  -- e.g., 'ifehl-2025-03', 'ifehl-2026-01'
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    venue_details TEXT,
    registration_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    registration_deadline DATE,
    status VARCHAR(20) DEFAULT 'draft',  -- draft, published, closed, archived
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
);

-- Create campaign registrations table
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
);

-- Create campaign images table (for gallery images)
CREATE TABLE IF NOT EXISTS campaign_images (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'gallery',  -- banner, gallery, logo, sponsor
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign email tracking table
CREATE TABLE IF NOT EXISTS campaign_email_tracking (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL REFERENCES campaign_registrations(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL,  -- confirmation, approval, reminder
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_campaign_id ON campaign_registrations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_email ON campaign_registrations(email);
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_created_at ON campaign_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_images_campaign_id ON campaign_images(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_email_tracking_registration_id ON campaign_email_tracking(registration_id);

-- Add comments
COMMENT ON TABLE campaigns IS 'Stores campaign/event information for IfEHL';
COMMENT ON TABLE campaign_registrations IS 'Stores registrations linked to specific campaigns';
COMMENT ON TABLE campaign_images IS 'Stores images for campaigns (gallery, banners, etc.)';
COMMENT ON COLUMN campaigns.slug IS 'URL-friendly identifier for the campaign, used in subdomain routing';
COMMENT ON COLUMN campaigns.status IS 'draft: not visible, published: visible and accepting registrations, closed: visible but not accepting, archived: hidden';
