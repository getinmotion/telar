-- Add artisan_profile fields to artisan_shops table
ALTER TABLE public.artisan_shops 
ADD COLUMN IF NOT EXISTS artisan_profile JSONB DEFAULT NULL;

ALTER TABLE public.artisan_shops 
ADD COLUMN IF NOT EXISTS artisan_profile_completed BOOLEAN DEFAULT FALSE;

-- Add index for querying completed profiles
CREATE INDEX IF NOT EXISTS idx_artisan_shops_profile_completed 
ON public.artisan_shops(artisan_profile_completed) 
WHERE artisan_profile_completed = true;