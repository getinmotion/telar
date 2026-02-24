-- Trigger para inicializar progreso del usuario automáticamente
CREATE OR REPLACE FUNCTION public.initialize_user_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Crear registro inicial de progreso
  INSERT INTO public.user_progress (
    user_id,
    level,
    experience_points,
    next_level_xp,
    completed_missions,
    current_streak,
    longest_streak,
    last_activity_date,
    total_time_spent
  )
  VALUES (
    NEW.id,
    1,
    0,
    100,
    0,
    0,
    0,
    CURRENT_DATE,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Crear trigger que se ejecuta después de crear un perfil de usuario
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_progress();

-- Inicializar progreso para usuarios existentes sin registro
INSERT INTO public.user_progress (
  user_id,
  level,
  experience_points,
  next_level_xp,
  completed_missions,
  current_streak,
  longest_streak,
  last_activity_date,
  total_time_spent
)
SELECT 
  up.user_id,
  1,
  0,
  100,
  0,
  0,
  0,
  CURRENT_DATE,
  0
FROM public.user_profiles up
LEFT JOIN public.user_progress prog ON prog.user_id = up.user_id
WHERE prog.id IS NULL
ON CONFLICT (user_id) DO NOTHING;