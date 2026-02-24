-- Fix remaining functions with missing search_path (CRITICAL SECURITY FIX)

CREATE OR REPLACE FUNCTION public.check_user_exists_and_type(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    auth_user_exists boolean := false;
    admin_exists boolean := false;
    shop_owner_exists boolean := false;
    user_profile_type text := null;
    result jsonb;
BEGIN
    -- Check if user exists in auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) INTO auth_user_exists;
    
    -- Check if user is admin
    SELECT EXISTS(SELECT 1 FROM admin_users WHERE email = user_email) INTO admin_exists;
    
    -- Check if user has shop
    SELECT EXISTS(
        SELECT 1 FROM artisan_shops 
        WHERE user_id IN (SELECT id FROM auth.users WHERE email = user_email)
    ) INTO shop_owner_exists;
    
    -- Get user profile type if exists
    SELECT up.user_type::text INTO user_profile_type
    FROM user_profiles up
    JOIN auth.users au ON up.user_id = au.id
    WHERE au.email = user_email;
    
    -- Build result
    result := jsonb_build_object(
        'exists', auth_user_exists,
        'is_admin', admin_exists,
        'is_shop_owner', shop_owner_exists,
        'user_type', user_profile_type,
        'email', user_email
    );
    
    RETURN result;
END;
$$;