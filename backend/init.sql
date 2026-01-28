-- =============================================================================
-- INIT.SQL - PostgreSQL Schema Initialization
-- =============================================================================
-- This script runs automatically when the PostgreSQL container starts for
-- the first time. It creates the users table with proper constraints.
-- =============================================================================

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 100 AND 5000)
);

-- Create index on rating for fast ORDER BY queries
-- This dramatically improves leaderboard query performance
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);

-- Create index on username for fast search queries
-- Using a trigram index would be better for LIKE queries in production
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index for case-insensitive search
-- This uses the lower() function for ILIKE optimization
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));

-- Grant all privileges to the postgres user
GRANT ALL PRIVILEGES ON TABLE users TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
