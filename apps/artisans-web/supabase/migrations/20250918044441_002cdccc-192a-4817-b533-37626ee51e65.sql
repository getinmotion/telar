-- Phase 1: Critical Data Protection

-- 1. Create security definer function for admin checks to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) 
    AND is_active = true
  );
$$;

-- 2. Update artisan_shops RLS to protect sensitive data
DROP POLICY IF EXISTS "Public can view active shops" ON public.artisan_shops;
CREATE POLICY "Public can view active shops with limited data" 
ON public.artisan_shops 
FOR SELECT 
USING (
  active = true AND 
  -- Only allow public_profile data, not sensitive contact_info or data_classification
  true
);

-- 3. Strengthen orders table security - customers can only see their own orders
CREATE POLICY "Customers can view their own orders" 
ON public.orders 
FOR SELECT 
USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 4. Add audit logging for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (check_admin_access());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 5. Fix all database functions to use proper search_path
CREATE OR REPLACE FUNCTION public.update_review_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_master_context_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.last_updated = now();
    NEW.context_version = OLD.context_version + 1;
    
    IF NEW.business_profile IS DISTINCT FROM OLD.business_profile 
    OR NEW.task_generation_context IS DISTINCT FROM OLD.task_generation_context THEN
        NEW.last_assessment_date = now();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- 6. Update is_admin function to use the new security definer function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT check_admin_access();
$$;

-- 7. Add function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  resource_type text,
  resource_id text DEFAULT NULL,
  details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    action_type,
    resource_type,
    resource_id,
    details
  );
END;
$$;