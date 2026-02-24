-- Security Fixes: Add search_path and fix auth.users access
-- Generated: 2025-01-29

-- =============================================
-- 1. Add search_path to existing functions
-- =============================================

ALTER FUNCTION public.is_admin() SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user() SET search_path TO 'public';
ALTER FUNCTION public.check_admin_access() SET search_path TO 'public';

-- =============================================
-- 2. Fix functions accessing auth.users
-- =============================================

-- Drop and recreate get_all_users_combined
DROP FUNCTION IF EXISTS public.get_all_users_combined();

CREATE FUNCTION public.get_all_users_combined()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  user_type text,
  is_active boolean,
  created_at timestamp with time zone,
  shop_name text
) 
SECURITY DEFINER
SET search_path TO 'public'
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied - admin permissions required';
  END IF;

  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.full_name,
    COALESCE(up.user_type, 'regular') as user_type,
    COALESCE(up.is_active, true) as is_active,
    up.created_at,
    ashop.shop_name
  FROM user_profiles up
  LEFT JOIN artisan_shops ashop ON ashop.user_id = up.id
  WHERE up.id IS NOT NULL
  ORDER BY up.created_at DESC;
END;
$$;

-- Drop and recreate check_user_exists_and_type
DROP FUNCTION IF EXISTS public.check_user_exists_and_type(text);

CREATE FUNCTION public.check_user_exists_and_type(p_email text)
RETURNS TABLE (
  user_exists boolean,
  user_id uuid,
  user_type text,
  has_shop boolean
) 
SECURITY DEFINER
SET search_path TO 'public'
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_user_type text;
  v_has_shop boolean;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied - admin permissions required';
  END IF;

  SELECT 
    up.id,
    COALESCE(up.user_type, 'regular'),
    EXISTS(SELECT 1 FROM artisan_shops WHERE user_id = up.id)
  INTO v_user_id, v_user_type, v_has_shop
  FROM user_profiles up
  WHERE LOWER(up.email) = LOWER(p_email)
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    RETURN QUERY SELECT true, v_user_id, v_user_type, v_has_shop;
  ELSE
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, false;
  END IF;
END;
$$;

-- =============================================
-- 3. Convert marketplace_products view
-- =============================================

DROP VIEW IF EXISTS public.marketplace_products CASCADE;

CREATE VIEW public.marketplace_products
WITH (security_invoker = true)
AS
SELECT 
  p.id, p.name, p.description, p.short_description, p.price, p.compare_price,
  p.images, p.category, p.subcategory, p.tags, p.materials, p.techniques,
  p.sku, p.created_at, p.updated_at, p.active, p.featured,
  s.shop_name as store_name, s.shop_slug as store_slug, s.logo_url as store_logo,
  s.banner_url, s.description as store_description, s.region, s.craft_type as craft,
  s.id as shop_id, p.lead_time_days, p.made_to_order, p.customizable,
  (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as reviews_count,
  (SELECT AVG(rating)::numeric(10,2) FROM product_reviews WHERE product_id = p.id) as rating,
  false as free_shipping, false as is_new,
  COALESCE((SELECT SUM(stock) FROM product_variants WHERE product_id = p.id), p.inventory) as stock
FROM products p
INNER JOIN artisan_shops s ON p.shop_id = s.id
WHERE p.active = true AND s.active = true 
  AND s.publish_status = 'published' AND s.marketplace_approved = true
  AND p.moderation_status IN ('approved', 'approved_with_edits');

GRANT SELECT ON public.marketplace_products TO authenticated, anon;