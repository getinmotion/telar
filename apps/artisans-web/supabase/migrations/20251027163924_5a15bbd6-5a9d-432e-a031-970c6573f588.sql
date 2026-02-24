-- Create app_role enum for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'shop_owner', 'user');

-- Create user_roles table with proper RBAC structure
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

-- Create has_role function with SECURITY DEFINER to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Migrate existing admin_users to user_roles (match by email)
INSERT INTO public.user_roles (user_id, role, granted_at, granted_by)
SELECT 
  u.id,
  'admin'::app_role,
  au.created_at,
  CASE 
    WHEN au.created_by IS NOT NULL THEN (
      SELECT u2.id FROM auth.users u2 
      JOIN public.admin_users au2 ON au2.email = u2.email 
      WHERE au2.id = au.created_by 
      LIMIT 1
    )
    ELSE NULL
  END
FROM public.admin_users au
JOIN auth.users u ON u.email = au.email
WHERE au.is_active = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Update is_admin() to use the new RBAC system for backwards compatibility
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Update check_admin_access() to use the new RBAC system
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Add indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      NEW.granted_by,
      'ROLE_GRANTED',
      'user_roles',
      NEW.user_id::text,
      jsonb_build_object(
        'role', NEW.role,
        'granted_at', NEW.granted_at
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'ROLE_REVOKED',
      'user_roles',
      OLD.user_id::text,
      jsonb_build_object(
        'role', OLD.role,
        'revoked_at', now()
      )
    );
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_user_role_changes
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();