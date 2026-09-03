-- Migration: Add per-campaign email and WhatsApp settings
-- Run this for databases that already have the campaigns table.

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(30),
ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT,
ADD COLUMN IF NOT EXISTS confirmation_email_text TEXT,
ADD COLUMN IF NOT EXISTS approval_email_text TEXT,
ADD COLUMN IF NOT EXISTS reminder_email_text TEXT,
ADD COLUMN IF NOT EXISTS email_next_steps TEXT,
ADD COLUMN IF NOT EXISTS email_footer_text TEXT;

COMMENT ON COLUMN campaigns.whatsapp_number IS 'WhatsApp number where participants should send payment receipts';
COMMENT ON COLUMN campaigns.whatsapp_group_link IS 'Campaign-specific WhatsApp group invitation link';
COMMENT ON COLUMN campaigns.confirmation_email_text IS 'Optional custom opening text for confirmation emails';
COMMENT ON COLUMN campaigns.approval_email_text IS 'Optional custom opening text for approval emails';
COMMENT ON COLUMN campaigns.reminder_email_text IS 'Optional custom opening text for reminder emails';
COMMENT ON COLUMN campaigns.email_next_steps IS 'Optional custom next steps text for confirmation emails';
COMMENT ON COLUMN campaigns.email_footer_text IS 'Optional custom footer/signoff note for campaign emails';
