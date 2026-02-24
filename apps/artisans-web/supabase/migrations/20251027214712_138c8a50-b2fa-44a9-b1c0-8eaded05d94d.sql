-- Migration: Fix Supabase Linter Warnings - Set search_path on functions

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix update_master_context_timestamp function
CREATE OR REPLACE FUNCTION public.update_master_context_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  );
END;
$$;

-- 4. Fix check_admin_access function
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  );
END;
$$;

-- 5. Fix increment_usage_count function
CREATE OR REPLACE FUNCTION public.increment_usage_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.usage_count = COALESCE(OLD.usage_count, 0) + 1;
  NEW.last_used_at = now();
  RETURN NEW;
END;
$$;

-- 6. Fix generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'ORD-' || LPAD(nextval('public.order_number_seq')::TEXT, 8, '0');
  RETURN new_number;
END;
$$;

-- 7. Fix set_order_number function
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- 8. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_progress (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 9. Drop and recreate get_latest_maturity_scores function with search_path
DROP FUNCTION IF EXISTS public.get_latest_maturity_scores(uuid);

CREATE FUNCTION public.get_latest_maturity_scores(user_uuid uuid)
RETURNS TABLE (
  idea_validation integer,
  user_experience integer,
  market_fit integer,
  monetization integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ums.idea_validation,
    ums.user_experience,
    ums.market_fit,
    ums.monetization,
    ums.created_at
  FROM public.user_maturity_scores ums
  WHERE ums.user_id = user_uuid
  ORDER BY ums.created_at DESC
  LIMIT 1;
END;
$$;

-- 10. Fix check_active_tasks_limit function
CREATE OR REPLACE FUNCTION public.check_active_tasks_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO active_count
  FROM public.agent_tasks
  WHERE user_id = NEW.user_id
  AND status IN ('pending', 'in_progress');

  IF active_count >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 active tasks reached';
  END IF;

  RETURN NEW;
END;
$$;