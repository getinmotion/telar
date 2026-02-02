-- Drop and recreate the function with correct column references
CREATE OR REPLACE FUNCTION public.get_all_users_combined()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  user_type text,
  is_active boolean,
  created_at timestamptz,
  shop_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied - admin permissions required';
  END IF;

  RETURN QUERY
  SELECT 
    up.user_id as id,
    au.email::text,
    up.full_name,
    COALESCE(up.user_type, 'regular')::text as user_type,
    true as is_active,
    up.created_at,
    ashop.shop_name
  FROM user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  LEFT JOIN artisan_shops ashop ON ashop.user_id = up.user_id
  WHERE up.user_id IS NOT NULL
  ORDER BY up.created_at DESC;
END;
$$;