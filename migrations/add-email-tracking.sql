-- Add email tracking columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS approval_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_email_sent_date TIMESTAMP;
