-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_email_registration UNIQUE (email)
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);

-- Add comments to document the table and columns
COMMENT ON TABLE registrations IS 'Stores registration information for IfEHL participants';
COMMENT ON COLUMN registrations.id IS 'Unique identifier for each registration';
COMMENT ON COLUMN registrations.first_name IS 'Participant''s first name';
COMMENT ON COLUMN registrations.middle_name IS 'Participant''s middle name (optional)';
COMMENT ON COLUMN registrations.last_name IS 'Participant''s last name';
COMMENT ON COLUMN registrations.email IS 'Participant''s email address (must be unique)';
COMMENT ON COLUMN registrations.phone IS 'Primary phone number';
COMMENT ON COLUMN registrations.alt_phone IS 'Alternative phone number (optional)';
COMMENT ON COLUMN registrations.gender IS 'Participant''s gender';
COMMENT ON COLUMN registrations.dob IS 'Date of birth';
COMMENT ON COLUMN registrations.marital_status IS 'Marital status (optional)';
COMMENT ON COLUMN registrations.city IS 'City of residence (optional)';
COMMENT ON COLUMN registrations.address IS 'Contact address (optional)';
COMMENT ON COLUMN registrations.institute IS 'Institute of undergraduate training (optional)';
COMMENT ON COLUMN registrations.professional_status IS 'Professional status/cadre (optional)';
COMMENT ON COLUMN registrations.workplace IS 'Current workplace (optional)';
COMMENT ON COLUMN registrations.attended IS 'Whether they have attended before (optional)';
COMMENT ON COLUMN registrations.expectations IS 'Expectations from the program (optional)';
COMMENT ON COLUMN registrations.hear_about IS 'How they heard about the program (optional)';
COMMENT ON COLUMN registrations.created_at IS 'Timestamp when the registration was created';
