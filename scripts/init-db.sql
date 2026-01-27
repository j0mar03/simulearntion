-- PostgreSQL Initialization Script
-- This runs when the PostgreSQL container is first created

-- Grant all privileges to the application user
GRANT ALL PRIVILEGES ON DATABASE gokgok_db TO gokgok_user;

-- Create extension for UUID support (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log initialization
SELECT 'PostgreSQL initialized successfully for SimuLearntion' AS status;
