-- Enable pgvector extension for vector similarity search
-- This extension provides vector data types and similarity search operations

-- Create the extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify the extension is enabled
COMMENT ON EXTENSION vector IS 'Vector similarity search for PostgreSQL';

