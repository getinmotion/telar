-- Publicar todas las tiendas que tengan al menos 1 producto aprobado
UPDATE artisan_shops 
SET 
  publish_status = 'published',
  active = true,
  updated_at = now()
WHERE id IN (
  SELECT DISTINCT s.id 
  FROM artisan_shops s
  INNER JOIN products p ON p.shop_id = s.id
  WHERE p.moderation_status IN ('approved', 'approved_with_edits')
  AND s.publish_status = 'pending_publish'
);