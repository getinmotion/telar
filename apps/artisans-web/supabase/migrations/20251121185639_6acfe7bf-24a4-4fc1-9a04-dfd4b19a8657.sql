-- Sync banner_url from hero_config.slides for existing shops
UPDATE artisan_shops
SET banner_url = (hero_config->'slides'->0->>'imageUrl')
WHERE banner_url IS NULL 
  AND hero_config->'slides' IS NOT NULL 
  AND jsonb_array_length(hero_config->'slides') > 0;