-- Create admin user in auth.users if it doesn't exist
-- This uses a DO block to conditionally create the user

DO $$
DECLARE
  admin_user_id uuid;
  admin_email text := 'manuel@getinmotion.io';
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  -- If user doesn't exist, we need to create it
  -- Note: We can't directly insert into auth.users from SQL
  -- The user should be created through Supabase Auth API
  
  IF admin_user_id IS NULL THEN
    -- Log that admin user needs to be created
    RAISE NOTICE 'Admin user % does not exist in auth.users. Please create it through Supabase dashboard or Auth API.', admin_email;
  ELSE
    -- Ensure the user is in admin_users table
    INSERT INTO public.admin_users (email, is_active, created_at, updated_at)
    VALUES (admin_email, true, now(), now())
    ON CONFLICT (email) DO UPDATE
    SET is_active = true, updated_at = now();
    
    RAISE NOTICE 'Admin user % verified in admin_users table.', admin_email;
  END IF;
END $$;