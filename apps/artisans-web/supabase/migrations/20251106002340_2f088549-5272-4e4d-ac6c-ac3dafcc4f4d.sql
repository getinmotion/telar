
-- ============================================
-- FIX: Eliminar triggers duplicados y recrearlos correctamente
-- ============================================

-- 1. Eliminar TODOS los triggers problemáticos existentes
DROP TRIGGER IF EXISTS update_master_context_timestamp ON public.user_master_context;
DROP TRIGGER IF EXISTS update_master_context_timestamp_trigger ON public.user_master_context;
DROP TRIGGER IF EXISTS update_master_context_timestamp_trigger ON public.master_coordinator_context;

-- 2. Eliminar la función problemática
DROP FUNCTION IF EXISTS public.update_master_context_timestamp();

-- 3. Crear función específica para user_master_context (usa last_updated)
CREATE OR REPLACE FUNCTION public.update_user_master_context_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

-- 4. Crear función específica para master_coordinator_context (usa updated_at)
CREATE OR REPLACE FUNCTION public.update_coordinator_context_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Recrear trigger para user_master_context
CREATE TRIGGER update_user_master_context_timestamp_trigger
  BEFORE UPDATE ON public.user_master_context
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_master_context_timestamp();

-- 6. Recrear trigger para master_coordinator_context
CREATE TRIGGER update_coordinator_context_timestamp_trigger
  BEFORE UPDATE ON public.master_coordinator_context
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coordinator_context_timestamp();

-- Comentario de verificación
COMMENT ON FUNCTION public.update_user_master_context_timestamp IS 'Actualiza last_updated en user_master_context';
COMMENT ON FUNCTION public.update_coordinator_context_timestamp IS 'Actualiza updated_at en master_coordinator_context';
