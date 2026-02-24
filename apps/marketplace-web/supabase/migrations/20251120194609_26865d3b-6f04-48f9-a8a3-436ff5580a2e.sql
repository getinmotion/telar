-- Enable the unaccent extension for text normalization
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Verify the extension is working
COMMENT ON EXTENSION unaccent IS 'Extension for removing accents from text in normalize_text function';
