-- Add admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
