-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pg_trgm extension for similarity search (optional, for autocomplete)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Set default timezone
SET timezone = 'UTC';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE wiki_dev TO wiki_user;
