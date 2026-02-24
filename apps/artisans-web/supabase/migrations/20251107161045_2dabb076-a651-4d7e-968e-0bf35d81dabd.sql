-- ============================================
-- Migration: Clean up generic brand names
-- Purpose: Set generic brand/shop names to NULL
--          to force users to input real names
-- ============================================

-- Clean up generic names in user_profiles table
UPDATE user_profiles 
SET 
  brand_name = NULL,
  updated_at = now()
WHERE brand_name IN (
  'Tu Negocio',
  'Tu Emprendimiento', 
  'Tu Empresa',
  'Tu Proyecto',
  'Tu Startup',
  'Tu Taller Artesanal',
  'Tu Sello Musical',
  'Tu Productora Musical',
  'Tu Estudio Creativo',
  'Tu Consultoría',
  'Tu Agencia'
);

-- Clean up generic names in artisan_shops table
UPDATE artisan_shops 
SET 
  shop_name = CASE 
    WHEN shop_name IN (
      'Tu Negocio',
      'Tu Emprendimiento',
      'Tu Empresa', 
      'Tu Proyecto',
      'Tu Startup',
      'Tu Taller Artesanal',
      'Tu Sello Musical',
      'Tu Productora Musical',
      'Tu Estudio Creativo',
      'Tu Consultoría',
      'Tu Agencia'
    ) THEN user_id::text || '_shop'
    ELSE shop_name
  END,
  updated_at = now()
WHERE shop_name IN (
  'Tu Negocio',
  'Tu Emprendimiento',
  'Tu Empresa',
  'Tu Proyecto', 
  'Tu Startup',
  'Tu Taller Artesanal',
  'Tu Sello Musical',
  'Tu Productora Musical',
  'Tu Estudio Creativo',
  'Tu Consultoría',
  'Tu Agencia'
);

-- Clean up business_profile in user_master_context
UPDATE user_master_context
SET 
  business_profile = jsonb_set(
    COALESCE(business_profile, '{}'::jsonb),
    '{brandName}',
    'null'::jsonb
  ),
  last_updated = now()
WHERE 
  business_profile->>'brandName' IN (
    'Tu Negocio',
    'Tu Emprendimiento',
    'Tu Empresa',
    'Tu Proyecto',
    'Tu Startup',
    'Tu Taller Artesanal',
    'Tu Sello Musical',
    'Tu Productora Musical',
    'Tu Estudio Creativo',
    'Tu Consultoría',
    'Tu Agencia'
  )
  OR business_profile->>'brand_name' IN (
    'Tu Negocio',
    'Tu Emprendimiento',
    'Tu Empresa',
    'Tu Proyecto',
    'Tu Startup',
    'Tu Taller Artesanal',
    'Tu Sello Musical',
    'Tu Productora Musical',
    'Tu Estudio Creativo',
    'Tu Consultoría',
    'Tu Agencia'
  );