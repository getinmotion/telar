-- Add new fields to artisan_shops table for brand integration and modern features

-- Brand color palette from wizard
ALTER TABLE artisan_shops 
ADD COLUMN IF NOT EXISTS primary_colors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS secondary_colors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS brand_claim TEXT;

-- Hero slider configuration
ALTER TABLE artisan_shops
ADD COLUMN IF NOT EXISTS hero_config JSONB DEFAULT '{
  "slides": [],
  "autoplay": true,
  "duration": 5000
}'::jsonb;

-- About page content
ALTER TABLE artisan_shops
ADD COLUMN IF NOT EXISTS about_content JSONB DEFAULT '{
  "title": "",
  "story": "",
  "mission": "",
  "vision": "",
  "values": []
}'::jsonb;

-- Contact page configuration
ALTER TABLE artisan_shops
ADD COLUMN IF NOT EXISTS contact_config JSONB DEFAULT '{
  "email": "",
  "phone": "",
  "whatsapp": "",
  "address": "",
  "hours": "",
  "map_embed": ""
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN artisan_shops.primary_colors IS 'Array of primary brand colors from brand wizard in hex format';
COMMENT ON COLUMN artisan_shops.secondary_colors IS 'Array of secondary brand colors from brand wizard in hex format';
COMMENT ON COLUMN artisan_shops.brand_claim IS 'Brand claim/slogan from brand wizard';
COMMENT ON COLUMN artisan_shops.hero_config IS 'Hero slider configuration with slides, autoplay settings';
COMMENT ON COLUMN artisan_shops.about_content IS 'About page content including story, mission, vision, values';
COMMENT ON COLUMN artisan_shops.contact_config IS 'Contact information and configuration';