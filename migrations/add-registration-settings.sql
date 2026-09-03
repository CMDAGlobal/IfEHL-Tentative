-- Create settings table for registration configuration
CREATE TABLE IF NOT EXISTS registration_settings (
    id SERIAL PRIMARY KEY,
    registration_open BOOLEAN DEFAULT true,
    close_reason VARCHAR(500) DEFAULT 'Registration has closed as we have met the target number of participants.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Insert default settings
INSERT INTO registration_settings (registration_open, close_reason)
VALUES (true, 'Registration has closed as we have met the target number of participants.')
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE registration_settings IS 'Stores global registration settings and status';
COMMENT ON COLUMN registration_settings.registration_open IS 'Whether registration is currently open or closed';
COMMENT ON COLUMN registration_settings.close_reason IS 'Message to display when registration is closed';
