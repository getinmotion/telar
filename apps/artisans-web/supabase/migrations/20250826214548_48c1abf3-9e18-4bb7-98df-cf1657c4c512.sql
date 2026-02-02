-- Add language preference to user_master_context table
ALTER TABLE user_master_context ALTER COLUMN language_preference SET DEFAULT 'es';

-- Add language preference to user_profiles table  
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'es';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_language ON user_profiles(language_preference);
CREATE INDEX IF NOT EXISTS idx_user_master_context_language ON user_master_context(language_preference);