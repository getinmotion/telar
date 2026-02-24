-- Fix security vulnerabilities: Add missing search_path and improve waitlist data protection

-- 1. Fix functions with mutable search_path (CRITICAL SECURITY FIX)
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

CREATE OR REPLACE FUNCTION public.validate_email_format(email_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
    -- Validación básica de formato email
    IF email_input !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
        RETURN false;
    END IF;
    
    -- Validaciones adicionales de seguridad
    IF length(email_input) > 254 THEN
        RETURN false;
    END IF;
    
    -- No permitir emails con doble punto
    IF email_input LIKE '%..%' THEN
        RETURN false;
    END IF;
    
    -- No permitir algunos caracteres peligrosos
    IF email_input ~ '[<>"\\'']' THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_date_range(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
    -- Verificar que las fechas no sean null
    IF start_date IS NULL OR end_date IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar que start_date sea anterior a end_date
    IF start_date >= end_date THEN
        RETURN false;
    END IF;
    
    -- Verificar que las fechas no sean muy antiguas (más de 100 años)
    IF start_date < (now() - interval '100 years') THEN
        RETURN false;
    END IF;
    
    -- Verificar que las fechas no sean muy en el futuro (más de 10 años)
    IF end_date > (now() + interval '10 years') THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_json_structure(json_input jsonb, required_keys text[])
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
    key text;
BEGIN
    -- Verificar que sea un objeto JSON válido
    IF json_input IS NULL OR jsonb_typeof(json_input) != 'object' THEN
        RETURN false;
    END IF;
    
    -- Verificar que contenga todas las claves requeridas
    FOREACH key IN ARRAY required_keys
    LOOP
        IF NOT json_input ? key THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_text_input(text_input text, max_length integer DEFAULT 1000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
    cleaned_text text;
BEGIN
    -- Retornar null si input es null
    IF text_input IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Limpiar el texto
    cleaned_text := trim(text_input);
    
    -- Remover caracteres de control peligrosos
    cleaned_text := regexp_replace(cleaned_text, '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
    
    -- Remover scripts y contenido peligroso
    cleaned_text := regexp_replace(cleaned_text, '<script[^>]*>.*?</script>', '', 'gi');
    cleaned_text := regexp_replace(cleaned_text, '<iframe[^>]*>.*?</iframe>', '', 'gi');
    cleaned_text := regexp_replace(cleaned_text, 'javascript:', '', 'gi');
    cleaned_text := regexp_replace(cleaned_text, 'data:text/html', '', 'gi');
    
    -- Truncar si excede la longitud máxima
    IF length(cleaned_text) > max_length THEN
        cleaned_text := substring(cleaned_text, 1, max_length);
    END IF;
    
    RETURN cleaned_text;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_and_clean_agent_task()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- Validar y limpiar título
    NEW.title := sanitize_text_input(NEW.title, 200);
    IF NEW.title IS NULL OR length(trim(NEW.title)) = 0 THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: El título de la tarea no puede estar vacío';
    END IF;
    
    -- Validar y limpiar descripción
    NEW.description := sanitize_text_input(NEW.description, 2000);
    
    -- Validar prioridad
    IF NEW.priority < 1 OR NEW.priority > 5 THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: La prioridad debe estar entre 1 y 5';
    END IF;
    
    -- Validar porcentaje de progreso
    IF NEW.progress_percentage < 0 OR NEW.progress_percentage > 100 THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: El porcentaje de progreso debe estar entre 0 y 100';
    END IF;
    
    -- Validar fecha de vencimiento
    IF NEW.due_date IS NOT NULL AND NEW.due_date < now() - interval '1 day' THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: La fecha de vencimiento no puede ser más de 1 día en el pasado';
    END IF;
    
    -- Validar que subtasks sea un array válido
    IF NEW.subtasks IS NOT NULL AND jsonb_typeof(NEW.subtasks) != 'array' THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: Subtasks debe ser un array JSON válido';
    END IF;
    
    -- Validar que resources sea un array válido
    IF NEW.resources IS NOT NULL AND jsonb_typeof(NEW.resources) != 'array' THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: Resources debe ser un array JSON válido';
    END IF;
    
    -- Validar tiempo invertido
    IF NEW.time_spent < 0 THEN
        NEW.time_spent := 0;
    END IF;
    
    -- Limpiar notas
    NEW.notes := sanitize_text_input(NEW.notes, 5000);
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_by_type(user_email text, user_password text, full_name text, selected_user_type user_type, additional_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    created_user_id uuid;
    result jsonb;
BEGIN
    -- Validate input
    IF NOT validate_email_format(user_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid email format');
    END IF;
    
    -- Check if user already exists
    IF EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'User already exists');
    END IF;
    
    -- This function should be called from an edge function that creates the auth user
    -- Here we just return success to indicate the user can be created
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User can be created',
        'user_type', selected_user_type,
        'email', user_email
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_secure_admin_user(user_email text, invited_by_admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
    inviter_exists boolean;
BEGIN
    -- Validar que el invitador es un admin activo
    SELECT EXISTS(
        SELECT 1 FROM admin_users 
        WHERE email = invited_by_admin_email AND is_active = true
    ) INTO inviter_exists;
    
    IF NOT inviter_exists THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Invitador no autorizado'
        );
    END IF;
    
    -- Validar formato de email
    IF NOT validate_email_format(user_email) THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Formato de email inválido'
        );
    END IF;
    
    -- Crear nuevo admin
    INSERT INTO admin_users (email, is_active, created_by)
    VALUES (
        user_email, 
        true, 
        (SELECT id FROM admin_users WHERE email = invited_by_admin_email LIMIT 1)
    );
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Usuario admin creado exitosamente'
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'El usuario ya existe'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Error interno del sistema'
        );
END;
$$;

-- 2. Add missing access_code column to waitlist table for better validation
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS access_code text;

-- 3. Create function to sanitize waitlist data on insert/update
CREATE OR REPLACE FUNCTION public.sanitize_waitlist_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Sanitize all text inputs
    NEW.full_name := sanitize_text_input(NEW.full_name, 200);
    NEW.email := lower(trim(NEW.email));
    NEW.phone := sanitize_text_input(NEW.phone, 50);
    NEW.role := sanitize_text_input(NEW.role, 100);
    NEW.city := sanitize_text_input(NEW.city, 100);
    NEW.country := sanitize_text_input(NEW.country, 100);
    NEW.sector := sanitize_text_input(NEW.sector, 200);
    NEW.description := sanitize_text_input(NEW.description, 2000);
    NEW.problem_to_solve := sanitize_text_input(NEW.problem_to_solve, 2000);
    NEW.language := sanitize_text_input(NEW.language, 10);
    NEW.access_code := sanitize_text_input(NEW.access_code, 50);
    
    -- Validate email format
    IF NOT validate_email_format(NEW.email) THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;
    
    -- Ensure required fields are not empty
    IF NEW.full_name IS NULL OR length(trim(NEW.full_name)) = 0 THEN
        RAISE EXCEPTION 'Full name is required';
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Create trigger to sanitize waitlist data
DROP TRIGGER IF EXISTS sanitize_waitlist_trigger ON public.waitlist;
CREATE TRIGGER sanitize_waitlist_trigger
    BEFORE INSERT OR UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION public.sanitize_waitlist_data();

-- 5. Add audit logging for waitlist access
CREATE OR REPLACE FUNCTION public.log_waitlist_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log admin access to waitlist data
    INSERT INTO public.data_access_audit (
        user_id,
        action,
        resource_type,
        resource_id,
        metadata
    ) VALUES (
        auth.uid(),
        TG_OP,
        'waitlist',
        COALESCE(NEW.id::text, OLD.id::text),
        jsonb_build_object(
            'timestamp', now(),
            'table', 'waitlist',
            'admin_email', (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 6. Create audit trigger for waitlist
DROP TRIGGER IF EXISTS audit_waitlist_access ON public.waitlist;
CREATE TRIGGER audit_waitlist_access
    AFTER INSERT OR UPDATE OR DELETE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION public.log_waitlist_access();