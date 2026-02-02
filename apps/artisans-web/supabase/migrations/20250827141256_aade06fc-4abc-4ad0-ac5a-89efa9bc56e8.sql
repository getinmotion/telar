-- Fix Critical Security Issues: Admin Users and Waitlist RLS Policies

-- 1. Fix admin_users table - Remove dangerous public policies and keep only admin-restricted ones
DROP POLICY IF EXISTS "Allow creating admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow deleting admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow updating admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow viewing admin users" ON public.admin_users;

-- Keep only the secure admin-restricted policies
-- These policies should already exist, but let's ensure they're correct
DROP POLICY IF EXISTS "Only admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;

-- Recreate the secure policies
CREATE POLICY "Only admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Only admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (is_admin());

-- 2. Fix waitlist table - Remove public access and restrict to admins only
DROP POLICY IF EXISTS "Allow public access for insert" ON public.waitlist;
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow admin access for select" ON public.waitlist;

-- Create secure waitlist policies
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view waitlist" 
ON public.waitlist 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Only admins can update waitlist" 
ON public.waitlist 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete waitlist entries" 
ON public.waitlist 
FOR DELETE 
USING (is_admin());

-- 3. Fix database functions - Add SET search_path = '' to prevent schema manipulation
-- Update all existing functions with proper search_path settings

CREATE OR REPLACE FUNCTION public.update_master_context_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.last_updated = now();
    NEW.context_version = OLD.context_version + 1;
    
    -- Si se actualiza business_profile o task_generation_context, actualizar last_assessment_date
    IF NEW.business_profile IS DISTINCT FROM OLD.business_profile 
    OR NEW.task_generation_context IS DISTINCT FROM OLD.task_generation_context THEN
        NEW.last_assessment_date = now();
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_authorized_user(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = user_email AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.increment_usage_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Only increment if last_used_at actually changed and is not null
  IF NEW.last_used_at IS DISTINCT FROM OLD.last_used_at AND NEW.last_used_at IS NOT NULL THEN
    NEW.usage_count = OLD.usage_count + 1;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_active_tasks_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Solo verificar en INSERT y UPDATE que cambie el status a activo
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'in_progress'))) THEN
        -- Contar tareas activas actuales del usuario
        IF (SELECT COUNT(*) 
            FROM public.agent_tasks 
            WHERE user_id = NEW.user_id 
            AND status IN ('pending', 'in_progress')
            AND (TG_OP = 'INSERT' OR id != NEW.id)
           ) >= 15 THEN
            RAISE EXCEPTION 'No puedes tener más de 15 tareas activas. Completa algunas tareas pendientes primero.';
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.disable_agent(p_user_id uuid, p_agent_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  UPDATE public.user_agents 
  SET is_enabled = false, updated_at = now()
  WHERE user_id = p_user_id AND agent_id = p_agent_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_latest_maturity_scores(user_uuid uuid)
RETURNS TABLE(idea_validation integer, user_experience integer, market_fit integer, monetization integer, created_at timestamp with time zone, profile_data jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    ums.idea_validation,
    ums.user_experience,
    ums.market_fit,
    ums.monetization,
    ums.created_at,
    ums.profile_data
  FROM public.user_maturity_scores ums
  WHERE ums.user_id = user_uuid
  ORDER BY ums.created_at DESC
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$function$;