-- Add middle_name column to the registrations table if it doesn't exist
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);

-- Add comment to document the column
COMMENT ON COLUMN registrations.middle_name IS 'Participant''s middle name (optional)';

-- Create an index on middle_name for potential future searches
CREATE INDEX IF NOT EXISTS idx_registrations_middle_name ON registrations(middle_name);
