-- Add marketplace_approved fields to artisan_shops
ALTER TABLE public.artisan_shops 
ADD COLUMN IF NOT EXISTS marketplace_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketplace_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketplace_approved_by UUID;

-- Update the marketplace_products view to only show products from approved shops
DROP VIEW IF EXISTS public.marketplace_products;

CREATE VIEW public.marketplace_products AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.short_description,
  p.price,
  p.compare_price,
  p.images,
  p.category AS original_category,
  public.map_artisan_category(p.category) AS category,
  p.subcategory,
  p.tags,
  p.sku,
  p.inventory AS stock,
  p.materials,
  p.techniques,
  p.active,
  p.featured,
  p.customizable,
  p.made_to_order,
  p.lead_time_days,
  p.created_at,
  p.updated_at,
  p.shop_id,
  s.shop_name AS store_name,
  s.shop_slug AS store_slug,
  s.logo_url AS store_logo,
  s.banner_url,
  s.craft_type AS craft,
  s.region,
  s.description AS store_description,
  (p.images::jsonb->0)::text AS image_url,
  CASE WHEN p.created_at > (now() - interval '30 days') THEN true ELSE false END AS is_new,
  CASE WHEN p.compare_price IS NOT NULL AND p.compare_price > p.price THEN true ELSE false END AS free_shipping,
  4.5 AS rating,
  0 AS reviews_count
FROM products p
LEFT JOIN artisan_shops s ON p.shop_id = s.id
WHERE p.active = true 
  AND s.marketplace_approved = true
  AND p.moderation_status IN ('approved', 'approved_with_edits');