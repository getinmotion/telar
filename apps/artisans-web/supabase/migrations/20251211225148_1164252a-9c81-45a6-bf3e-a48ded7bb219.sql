-- Restaurar vista marketplace_products con todas las columnas necesarias
DROP VIEW IF EXISTS marketplace_products;

CREATE VIEW marketplace_products WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.short_description,
  p.price,
  p.images->>0 as image_url,
  p.images,
  COALESCE(p.inventory, 0) as stock,
  COALESCE((SELECT AVG(pr.rating) FROM product_reviews pr WHERE pr.product_id = p.id), 0) as rating,
  COALESCE((SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id = p.id), 0) as reviews_count,
  (p.created_at > NOW() - INTERVAL '30 days') as is_new,
  false as free_shipping,
  p.created_at,
  p.updated_at,
  p.moderation_status,
  p.tags,
  p.materials,
  p.techniques,
  p.category,
  p.subcategory,
  p.sku,
  p.active,
  p.featured,
  p.customizable,
  p.made_to_order,
  p.lead_time_days,
  p.shipping_data_complete,
  p.tags->1 as craft,
  p.tags->0 as material,
  s.id as shop_id,
  s.shop_name as store_name,
  s.shop_slug as store_slug,
  s.logo_url,
  s.banner_url,
  s.description as store_description,
  s.region,
  s.craft_type,
  s.bank_data_status,
  CASE 
    WHEN s.bank_data_status = 'complete' AND COALESCE(p.shipping_data_complete, false) = true 
    THEN true 
    ELSE false 
  END as can_purchase
FROM products p
LEFT JOIN artisan_shops s ON p.shop_id = s.id
WHERE p.moderation_status IN ('approved', 'approved_with_edits')
  AND s.publish_status = 'published'
  AND s.marketplace_approved = true;