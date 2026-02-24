-- Agregar campos para capturar información detallada del negocio
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_market TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_stage TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_goals TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monthly_revenue_goal INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS time_availability TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_challenges TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sales_channels TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS social_media_presence JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_location TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS years_in_business INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS initial_investment_range TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS primary_skills TEXT[];