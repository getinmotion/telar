
-- Eliminar el trigger problemático que está causando el error
-- Este trigger intenta crear user_profiles automáticamente pero falla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar el trigger de user_profiles que crea user_progress
-- Ya que ahora lo manejamos manualmente en la edge function
DROP TRIGGER IF EXISTS init_user_progress_on_profile ON public.user_profiles;

-- Comentario explicativo
COMMENT ON TABLE public.user_profiles IS 
  'User profiles are now created manually by the register-user edge function';
