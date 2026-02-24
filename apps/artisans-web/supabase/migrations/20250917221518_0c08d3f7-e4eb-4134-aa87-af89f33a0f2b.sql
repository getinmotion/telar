-- Create function to get all users with their types and details
CREATE OR REPLACE FUNCTION public.get_all_users_combined()
RETURNS TABLE(
    id uuid,
    email text,
    full_name text,
    user_type text,
    is_active boolean,
    created_at timestamp with time zone,
    shop_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Verify the user is admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied - admin permissions required';
    END IF;
    
    RETURN QUERY
    WITH auth_users_data AS (
        -- Get basic user data from profiles table which has user_id from auth.users
        SELECT 
            up.user_id,
            up.full_name,
            up.user_type::text as profile_user_type,
            up.created_at
        FROM user_profiles up
    ),
    combined_data AS (
        SELECT 
            aud.user_id as id,
            COALESCE(au.email, 'Unknown') as email,
            COALESCE(aud.full_name, au.email, 'Unknown') as full_name,
            CASE 
                WHEN au.email IS NOT NULL THEN 'admin'
                WHEN ash.user_id IS NOT NULL THEN 'shop_owner'
                WHEN aud.profile_user_type IS NOT NULL THEN aud.profile_user_type
                ELSE 'unclassified'
            END as user_type,
            COALESCE(au.is_active, true) as is_active,
            aud.created_at,
            ash.shop_name
        FROM auth_users_data aud
        LEFT JOIN admin_users au ON au.email = (
            SELECT users.email FROM auth.users users WHERE users.id = aud.user_id
        )
        LEFT JOIN artisan_shops ash ON ash.user_id = aud.user_id
        
        UNION
        
        -- Include admin users that might not have profiles
        SELECT 
            COALESCE(
                (SELECT users.id FROM auth.users users WHERE users.email = au.email),
                gen_random_uuid()
            ) as id,
            au.email,
            au.email as full_name,
            'admin' as user_type,
            au.is_active,
            au.created_at,
            null::text as shop_name
        FROM admin_users au
        WHERE au.email NOT IN (
            SELECT users.email FROM auth.users users 
            INNER JOIN user_profiles up ON up.user_id = users.id
        )
    )
    SELECT 
        cd.id,
        cd.email,
        cd.full_name,
        cd.user_type,
        cd.is_active,
        cd.created_at,
        cd.shop_name
    FROM combined_data cd
    ORDER BY cd.created_at DESC;
END;
$$;