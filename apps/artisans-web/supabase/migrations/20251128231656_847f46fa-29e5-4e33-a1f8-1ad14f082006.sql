-- Migración: Lógica Estricta de Publicación
-- Mover todos los productos reales (no-dummy) a cola de moderación

-- Paso 1: Mover productos de tiendas reales a pending_moderation
UPDATE products 
SET 
  moderation_status = 'pending_moderation',
  active = false,
  updated_at = now()
WHERE moderation_status IN ('draft', 'approved', 'approved_with_edits')
  AND shop_id IN (
    SELECT id FROM artisan_shops 
    WHERE user_id NOT IN (
      SELECT id FROM auth.users WHERE email LIKE 'dummy%@telar.app'
    )
  );

-- Paso 2: Asegurar que todas las tiendas reales están en pending_publish
-- (esto ya debería estar así, pero por consistencia)
UPDATE artisan_shops
SET 
  publish_status = 'pending_publish',
  updated_at = now()
WHERE publish_status != 'pending_publish'
  AND user_id NOT IN (
    SELECT id FROM auth.users WHERE email LIKE 'dummy%@telar.app'
  );

-- Comentario explicativo
COMMENT ON COLUMN products.moderation_status IS 
  'Estados: draft, pending_moderation, approved, approved_with_edits, changes_requested, rejected, archived. Todos los productos deben pasar por moderación antes de publicarse.';

COMMENT ON COLUMN artisan_shops.publish_status IS 
  'Estados: pending_publish, published. Las tiendas solo pueden publicarse cuando tienen ≥1 producto aprobado y datos bancarios completos.';