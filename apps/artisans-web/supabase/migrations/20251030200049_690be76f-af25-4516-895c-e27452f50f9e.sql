-- Check if updated_at column exists and add it if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    
    COMMENT ON COLUMN public.user_profiles.updated_at IS 'Timestamp when the profile was last updated';
  END IF;
END $$;

-- Create or replace the trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate it
DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON public.user_profiles;

CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at();