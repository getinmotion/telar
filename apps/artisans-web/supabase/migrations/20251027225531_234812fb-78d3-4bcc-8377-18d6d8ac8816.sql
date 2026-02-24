
-- Corregir la foreign key de user_progress
-- El problema es que apunta a auth.users en lugar de user_profiles

-- Primero, eliminar la constraint incorrecta
ALTER TABLE public.user_progress 
DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;

-- Crear la nueva constraint apuntando a user_profiles
ALTER TABLE public.user_progress
ADD CONSTRAINT user_progress_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.user_profiles(user_id) 
ON DELETE CASCADE;

-- Agregar índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
ON public.user_progress(user_id);
