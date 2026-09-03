-- Migration: Link existing registrations to campaigns
-- This migration adds campaign support to the existing registrations table

-- Step 1: Add campaign_id column to registrations table (allow NULL initially)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL;

-- Step 2: Create index for campaign_id
CREATE INDEX IF NOT EXISTS idx_registrations_campaign_id ON registrations(campaign_id);

-- Step 3: Create a default "Legacy" campaign for existing registrations
-- This will be the campaign for all registrations that were created before the campaigns feature
INSERT INTO campaigns (
    slug,
    title,
    subtitle,
    description,
    start_date,
    end_date,
    location,
    registration_fee,
    status,
    is_registration_open,
    created_at
) VALUES (
    'ifehl-legacy',
    'IFEHL - Legacy Registrations',
    'Historical registrations before multi-campaign system',
    'This campaign contains all registrations that were created before the multi-campaign feature was implemented.',
    '2024-01-01',
    '2025-12-31',
    'Nigeria',
    0,
    'archived',
    false,
    CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Step 4: Update all existing registrations without a campaign_id to link to the legacy campaign
UPDATE registrations
SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'ifehl-legacy')
WHERE campaign_id IS NULL;

-- Step 5: Add comment to document the new column
COMMENT ON COLUMN registrations.campaign_id IS 'References the campaign this registration belongs to (NULL allowed for backwards compatibility)';

-- Note: We intentionally keep campaign_id as nullable to maintain backwards compatibility
-- New registrations should always have a campaign_id, but old ones might not
