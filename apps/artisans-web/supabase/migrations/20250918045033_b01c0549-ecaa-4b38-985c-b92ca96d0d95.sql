-- Fix remaining functions with missing search_path

CREATE OR REPLACE FUNCTION public.check_active_tasks_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'in_progress'))) THEN
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
$$;

CREATE OR REPLACE FUNCTION public.disable_agent(p_user_id uuid, p_agent_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_agents 
  SET is_enabled = false, updated_at = now()
  WHERE user_id = p_user_id AND agent_id = p_agent_id;
$$;

CREATE OR REPLACE FUNCTION public.get_validation_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_tasks', (SELECT COUNT(*) FROM agent_tasks),
        'active_tasks', (SELECT COUNT(*) FROM agent_tasks WHERE status IN ('pending', 'in_progress') AND is_archived = false),
        'completed_tasks', (SELECT COUNT(*) FROM agent_tasks WHERE status = 'completed'),
        'archived_tasks', (SELECT COUNT(*) FROM agent_tasks WHERE is_archived = true),
        'users_with_tasks', (SELECT COUNT(DISTINCT user_id) FROM agent_tasks),
        'avg_tasks_per_user', (SELECT ROUND(AVG(task_count), 2) FROM (
            SELECT COUNT(*) as task_count 
            FROM agent_tasks 
            WHERE status IN ('pending', 'in_progress') AND is_archived = false
            GROUP BY user_id
        ) subquery),
        'tasks_over_limit', (SELECT COUNT(*) FROM (
            SELECT user_id, COUNT(*) as task_count 
            FROM agent_tasks 
            WHERE status IN ('pending', 'in_progress') AND is_archived = false
            GROUP BY user_id
            HAVING COUNT(*) > 15
        ) over_limit),
        'validation_timestamp', now()
    ) INTO stats;
    
    RETURN stats;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_latest_maturity_scores(user_uuid uuid)
RETURNS TABLE(idea_validation integer, user_experience integer, market_fit integer, monetization integer, created_at timestamp with time zone, profile_data jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_data_inconsistencies()
RETURNS TABLE(table_name text, issue_type text, issue_description text, affected_count bigint, severity text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'agent_tasks'::text,
        'date_inconsistency'::text,
        'Tareas completadas sin fecha de finalización'::text,
        COUNT(*)::bigint,
        'medium'::text
    FROM agent_tasks 
    WHERE status = 'completed' AND completed_at IS NULL
    HAVING COUNT(*) > 0;
    
    RETURN QUERY
    SELECT 
        'agent_tasks'::text,
        'progress_inconsistency'::text,
        'Tareas completadas con progreso menor a 100%'::text,
        COUNT(*)::bigint,
        'low'::text
    FROM agent_tasks 
    WHERE status = 'completed' AND progress_percentage < 100
    HAVING COUNT(*) > 0;
    
    RETURN QUERY
    SELECT 
        'agent_tasks'::text,
        'active_tasks_limit'::text,
        'Usuarios con más de 15 tareas activas'::text,
        COUNT(DISTINCT user_id)::bigint,
        'high'::text
    FROM agent_tasks 
    WHERE status IN ('pending', 'in_progress') 
    AND is_archived = false
    GROUP BY user_id
    HAVING COUNT(*) > 15;
    
    RETURN QUERY
    SELECT 
        'agent_tasks'::text,
        'orphaned_tasks'::text,
        'Tareas sin usuario válido'::text,
        COUNT(*)::bigint,
        'critical'::text
    FROM agent_tasks 
    WHERE user_id IS NULL
    HAVING COUNT(*) > 0;
    
    RETURN QUERY
    SELECT 
        'user_profiles'::text,
        'orphaned_profiles'::text,
        'Perfiles sin usuario correspondiente en auth'::text,
        COUNT(*)::bigint,
        'medium'::text
    FROM user_profiles up
    LEFT JOIN auth.users au ON up.user_id = au.id
    WHERE au.id IS NULL
    HAVING COUNT(*) > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.repair_data_inconsistencies()
RETURNS TABLE(action_taken text, records_affected bigint, details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_count bigint;
BEGIN
    UPDATE agent_tasks 
    SET completed_at = updated_at 
    WHERE status = 'completed' AND completed_at IS NULL;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    IF affected_count > 0 THEN
        RETURN QUERY SELECT 
            'updated_completion_dates'::text,
            affected_count,
            'Actualizadas fechas de finalización para tareas completadas'::text;
    END IF;
    
    UPDATE agent_tasks 
    SET progress_percentage = 100 
    WHERE status = 'completed' AND progress_percentage < 100;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    IF affected_count > 0 THEN
        RETURN QUERY SELECT 
            'updated_progress'::text,
            affected_count,
            'Actualizado progreso a 100% para tareas completadas'::text;
    END IF;
    
    UPDATE agent_tasks 
    SET is_archived = true, updated_at = now()
    WHERE status = 'cancelled' 
    AND created_at < now() - interval '30 days'
    AND is_archived = false;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    IF affected_count > 0 THEN
        RETURN QUERY SELECT 
            'archived_old_cancelled_tasks'::text,
            affected_count,
            'Archivadas tareas canceladas antiguas (>30 días)'::text;
    END IF;
    
    DELETE FROM agent_tasks WHERE user_id IS NULL;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    IF affected_count > 0 THEN
        RETURN QUERY SELECT 
            'deleted_orphaned_tasks'::text,
            affected_count,
            'Eliminadas tareas huérfanas sin user_id'::text;
    END IF;
END;
$$;