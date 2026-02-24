-- Fix trigger that references wrong column name
-- The table uses 'updated_at' but the trigger was using 'last_updated'

DROP TRIGGER IF EXISTS update_master_context_timestamp_trigger ON public.user_master_context;

-- Recreate function to use correct column name
CREATE OR REPLACE FUNCTION public.update_master_context_timestamp()
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

-- Recreate trigger
CREATE TRIGGER update_master_context_timestamp_trigger
BEFORE UPDATE ON public.user_master_context
FOR EACH ROW
EXECUTE FUNCTION public.update_master_context_timestamp();