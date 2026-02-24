-- Create user type enum
CREATE TYPE user_type AS ENUM ('admin', 'shop_owner', 'regular');

-- Add user_type column to user_profiles table  
ALTER TABLE user_profiles ADD COLUMN user_type user_type DEFAULT 'regular';

-- Create index for user_type for better performance
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);

-- Create function to check existing user and their type
CREATE OR REPLACE FUNCTION public.check_user_exists_and_type(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to create user by type
CREATE OR REPLACE FUNCTION public.create_user_by_type(
    user_email text,
    user_password text,
    full_name text,
    selected_user_type user_type,
    additional_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    created_user_id uuid;
    result jsonb;
BEGIN
    -- Validate input
    IF NOT validate_email_format(user_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid email format');
    END IF;
    
    -- Check if user already exists
    IF EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'User already exists');
    END IF;
    
    -- This function should be called from an edge function that creates the auth user
    -- Here we just return success to indicate the user can be created
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User can be created',
        'user_type', selected_user_type,
        'email', user_email
    );
END;
$$;