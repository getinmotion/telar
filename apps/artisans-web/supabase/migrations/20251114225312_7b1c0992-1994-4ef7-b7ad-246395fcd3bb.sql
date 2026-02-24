-- Migration: Sync brand_name from user_master_context to user_profiles
-- This fixes existing users who have brand names in user_master_context but not in user_profiles

-- Update user_profiles.brand_name from user_master_context.business_profile->>'brandName'
-- Only for users where brand_name is generic or NULL
UPDATE user_profiles up
SET 
  brand_name = umc.business_profile->>'brandName',
  updated_at = NOW()
FROM user_master_context umc
WHERE up.user_id = umc.user_id
  AND (
    up.brand_name IS NULL 
    OR up.brand_name = '' 
    OR up.brand_name = 'Tu Negocio'
    OR up.brand_name = 'Tu Emprendimiento'
    OR up.brand_name = 'Tu Empresa'
    OR up.brand_name = 'Tu Proyecto'
    OR up.brand_name = 'Tu Startup'
  )
  AND umc.business_profile->>'brandName' IS NOT NULL
  AND umc.business_profile->>'brandName' != ''
  AND umc.business_profile->>'brandName' != 'Tu Negocio'
  AND umc.business_profile->>'brandName' != 'Sin nombre definido';

-- Log the results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Brand name sync completed. Updated % user profiles.', updated_count;
END $$;