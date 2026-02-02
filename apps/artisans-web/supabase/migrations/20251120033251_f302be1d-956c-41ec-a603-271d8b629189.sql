-- FASE 1: Crear trigger automático para nuevos usuarios
-- Función que crea perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insertar perfil en user_profiles
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insertar progreso inicial en user_progress
  INSERT INTO public.user_progress (
    user_id,
    experience_points,
    level,
    completed_missions,
    next_level_xp,
    current_streak,
    longest_streak,
    total_time_spent,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0,
    1,
    0,
    100,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear nuevo trigger que se ejecuta después de insertar un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- FASE 2: Reparar usuarios existentes sin perfil
-- Crear perfiles para usuarios que no tienen
INSERT INTO public.user_profiles (
  user_id,
  full_name,
  avatar_url,
  created_at,
  updated_at
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuario'),
  COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Crear progreso para usuarios que no tienen
INSERT INTO public.user_progress (
  user_id,
  experience_points,
  level,
  completed_missions,
  next_level_xp,
  current_streak,
  longest_streak,
  total_time_spent,
  created_at,
  updated_at
)
SELECT 
  u.id,
  0,
  1,
  0,
  100,
  0,
  0,
  0,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN user_progress prog ON prog.user_id = u.id
WHERE prog.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Comentario de confirmación
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente perfil y progreso para nuevos usuarios';