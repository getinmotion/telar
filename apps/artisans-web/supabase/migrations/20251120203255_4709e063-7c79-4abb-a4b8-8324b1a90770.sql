-- =====================================================
-- OPCIÓN A: Limpieza de tiendas huérfanas y monitoreo
-- =====================================================

-- Función para desactivar tiendas cuyos usuarios no existen
CREATE OR REPLACE FUNCTION cleanup_orphaned_shops()
RETURNS TABLE(
  shop_id uuid,
  shop_name text,
  shop_slug text,
  action text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  UPDATE artisan_shops
  SET 
    active = false,
    updated_at = now()
  WHERE user_id NOT IN (SELECT id FROM auth.users)
    AND active = true
  RETURNING 
    id as shop_id,
    artisan_shops.shop_name,
    artisan_shops.shop_slug,
    'Desactivada - Usuario eliminado' as action;
END;
$$;

-- Función para verificar datos huérfanos en múltiples tablas
CREATE OR REPLACE FUNCTION check_orphaned_data()
RETURNS TABLE(
  table_name text,
  orphaned_count bigint,
  severity text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Tiendas huérfanas
  RETURN QUERY
  SELECT 
    'artisan_shops'::text,
    COUNT(*)::bigint,
    CASE 
      WHEN COUNT(*) > 10 THEN 'high'
      WHEN COUNT(*) > 0 THEN 'medium'
      ELSE 'none'
    END::text
  FROM artisan_shops
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  -- Perfiles huérfanos
  RETURN QUERY
  SELECT 
    'user_profiles'::text,
    COUNT(*)::bigint,
    CASE 
      WHEN COUNT(*) > 10 THEN 'high'
      WHEN COUNT(*) > 0 THEN 'medium'
      ELSE 'none'
    END::text
  FROM user_profiles
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  -- Tareas huérfanas
  RETURN QUERY
  SELECT 
    'agent_tasks'::text,
    COUNT(*)::bigint,
    CASE 
      WHEN COUNT(*) > 50 THEN 'high'
      WHEN COUNT(*) > 0 THEN 'medium'
      ELSE 'none'
    END::text
  FROM agent_tasks
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  -- Conversaciones huérfanas
  RETURN QUERY
  SELECT 
    'agent_conversations'::text,
    COUNT(*)::bigint,
    CASE 
      WHEN COUNT(*) > 100 THEN 'high'
      WHEN COUNT(*) > 0 THEN 'medium'
      ELSE 'none'
    END::text
  FROM agent_conversations
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  -- Contexto maestro huérfano
  RETURN QUERY
  SELECT 
    'user_master_context'::text,
    COUNT(*)::bigint,
    CASE 
      WHEN COUNT(*) > 10 THEN 'high'
      WHEN COUNT(*) > 0 THEN 'medium'
      ELSE 'none'
    END::text
  FROM user_master_context
  WHERE user_id NOT IN (SELECT id FROM auth.users);
END;
$$;

-- Ejecutar limpieza inmediata de las 20 tiendas huérfanas identificadas
SELECT * FROM cleanup_orphaned_shops();