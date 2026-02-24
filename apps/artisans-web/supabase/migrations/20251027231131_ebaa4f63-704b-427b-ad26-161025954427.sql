
-- Eliminar el trigger problemático que está causando el conflicto
-- Este trigger usa NEW.id en lugar de NEW.user_id, causando IDs incorrectos
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;

-- Comentario explicativo
COMMENT ON TABLE public.user_profiles IS 
  'User profiles are created and managed by the register-user edge function. 
   The trigger on_user_profile_created was removed because it was using NEW.id 
   instead of NEW.user_id, causing foreign key violations.';
