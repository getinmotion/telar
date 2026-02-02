-- Fix RLS policies for design_system_config to avoid auth.users access errors

-- Drop the overly broad admin policy
DROP POLICY IF EXISTS "Only admins can manage design system config" ON public.design_system_config;

-- Create separate policies for admin operations (INSERT, UPDATE, DELETE only)
CREATE POLICY "Only admins can insert design system config"
ON public.design_system_config
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Only admins can update design system config"
ON public.design_system_config
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Only admins can delete design system config"
ON public.design_system_config
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND admin_users.is_active = true
  )
);

-- Keep the existing public read policy for active global config (already exists)
-- "Users can view active global config" allows anyone to read global config without auth.users access