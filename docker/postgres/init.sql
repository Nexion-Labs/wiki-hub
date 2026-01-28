-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE wikidb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'wikidb')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wikidb TO postgres;
