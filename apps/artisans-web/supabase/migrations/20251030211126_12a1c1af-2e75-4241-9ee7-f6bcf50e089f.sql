-- Eliminar el trigger existente problemático
DROP TRIGGER IF EXISTS update_master_context_timestamp_trigger ON public.user_master_context;

-- Recrear la función de trigger correctamente para user_master_context
CREATE OR REPLACE FUNCTION public.update_master_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Crear el trigger correctamente
CREATE TRIGGER update_master_context_timestamp_trigger
BEFORE UPDATE ON public.user_master_context
FOR EACH ROW
EXECUTE FUNCTION public.update_master_context_timestamp();