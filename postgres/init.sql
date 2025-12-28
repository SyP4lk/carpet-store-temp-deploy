-- Initial database setup for Carpet Store
-- This script runs when PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create some initial indexes for performance
-- (These will be created by Prisma migrations, but good to have ready)

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Carpet Store database initialized successfully at %', now();
END $$;