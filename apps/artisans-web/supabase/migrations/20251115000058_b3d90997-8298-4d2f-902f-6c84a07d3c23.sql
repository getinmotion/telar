-- Fix RLS policies for design_system_config table
-- The issue is that policies are trying to access auth.users without proper permissions

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert design system config" ON public.design_system_config;
DROP POLICY IF EXISTS "Only admins can update design system config" ON public.design_system_config;
DROP POLICY IF EXISTS "Only admins can delete design system config" ON public.design_system_config;
DROP POLICY IF EXISTS "Users can view active global config" ON public.design_system_config;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get current user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if user is in admin_users table
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
    AND is_active = true
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- Create new policies using the security definer function
CREATE POLICY "Users can view active global config"
ON public.design_system_config
FOR SELECT
TO public
USING ((user_id IS NULL) AND (is_active = true));

CREATE POLICY "Admins can insert design system config"
ON public.design_system_config
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update design system config"
ON public.design_system_config
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can delete design system config"
ON public.design_system_config
FOR DELETE
TO authenticated
USING (public.is_admin_user());