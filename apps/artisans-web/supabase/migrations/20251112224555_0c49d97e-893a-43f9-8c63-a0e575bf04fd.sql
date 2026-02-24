-- Create a function to initialize admin user if it doesn't exist
CREATE OR REPLACE FUNCTION public.initialize_admin_user()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_email text := 'manuel@getinmotion.io';
  admin_exists boolean;
BEGIN
  -- Check if admin exists in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = admin_email
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Admin needs to be created through Supabase Dashboard or Auth API
    -- We can't directly insert into auth.users from SQL
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Admin user must be created through Supabase Dashboard',
      'email', admin_email,
      'action_required', 'Create user in Supabase Auth with email: ' || admin_email || ' and password: Simona!4849'
    );
  END IF;
  
  -- Ensure admin is in admin_users table
  INSERT INTO public.admin_users (email, is_active, created_at, updated_at)
  VALUES (admin_email, true, now(), now())
  ON CONFLICT (email) DO UPDATE
  SET is_active = true, updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Admin user verified in admin_users table',
    'email', admin_email
  );
END;
$$;

-- Call the function to check status
SELECT public.initialize_admin_user();