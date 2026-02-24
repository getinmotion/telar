-- Fix remaining security_path issues for all functions

CREATE OR REPLACE FUNCTION public.cleanup_obsolete_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE agent_tasks 
    SET is_archived = true, updated_at = now()
    WHERE status = 'cancelled' 
    AND created_at < now() - interval '30 days'
    AND is_archived = false;
    
    UPDATE agent_tasks 
    SET is_archived = true, updated_at = now()
    WHERE status = 'completed' 
    AND created_at < now() - interval '90 days'
    AND is_archived = false;
    
    RAISE NOTICE 'Cleanup completed successfully';
END;
$$;

CREATE OR REPLACE FUNCTION public.is_authorized_user(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = user_email AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_usage_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_used_at IS DISTINCT FROM OLD.last_used_at AND NEW.last_used_at IS NOT NULL THEN
    NEW.usage_count = OLD.usage_count + 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_active_task_limits()
RETURNS TABLE(user_id uuid, active_count bigint, action_taken text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            at.user_id,
            COUNT(*) as active_tasks
        FROM agent_tasks at
        WHERE at.status IN ('pending', 'in_progress') 
        AND at.is_archived = false
        GROUP BY at.user_id
        HAVING COUNT(*) > 15
    ),
    updates AS (
        UPDATE agent_tasks 
        SET status = 'cancelled', 
            updated_at = now(),
            notes = COALESCE(notes, '') || ' [AUTO-CANCELLED: Exceeds limit]'
        WHERE id IN (
            SELECT at.id 
            FROM agent_tasks at
            INNER JOIN user_stats us ON at.user_id = us.user_id
            WHERE at.status = 'pending' 
            AND at.is_archived = false
            ORDER BY at.created_at DESC
            OFFSET 15
        )
        RETURNING agent_tasks.user_id
    )
    SELECT 
        us.user_id,
        us.active_tasks,
        'AUTO-CANCELLED excess tasks'::text
    FROM user_stats us;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_active_tasks_limit_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    active_count integer;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status IN ('pending', 'in_progress')) OR 
       (TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'in_progress') AND OLD.status NOT IN ('pending', 'in_progress')) THEN
        
        SELECT COUNT(*) INTO active_count
        FROM agent_tasks 
        WHERE user_id = NEW.user_id 
        AND status IN ('pending', 'in_progress')
        AND is_archived = false
        AND (TG_OP = 'INSERT' OR id != NEW.id);
        
        IF active_count >= 15 THEN
            RAISE EXCEPTION 'TASK_LIMIT_EXCEEDED: No puedes tener más de 15 tareas activas (tienes: %). Completa algunas tareas pendientes primero.', active_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users_combined()
RETURNS TABLE(id uuid, email text, full_name text, user_type text, is_active boolean, created_at timestamp with time zone, shop_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT check_admin_access() THEN
        RAISE EXCEPTION 'Access denied - admin permissions required';
    END IF;
    
    RETURN QUERY
    WITH auth_users_data AS (
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