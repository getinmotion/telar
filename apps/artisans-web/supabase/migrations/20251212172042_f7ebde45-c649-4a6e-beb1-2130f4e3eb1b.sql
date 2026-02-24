-- Add structured location fields to artisan_shops
ALTER TABLE public.artisan_shops 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS municipality TEXT;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_artisan_shops_department ON public.artisan_shops(department);
CREATE INDEX IF NOT EXISTS idx_artisan_shops_municipality ON public.artisan_shops(municipality);

-- Add comment for documentation
COMMENT ON COLUMN public.artisan_shops.department IS 'Colombian department (validated against datos.gov.co API)';
COMMENT ON COLUMN public.artisan_shops.municipality IS 'Colombian municipality within the department';
COMMENT ON COLUMN public.artisan_shops.region IS 'DEPRECATED: Legacy field, use department/municipality instead. Format: Municipality, Department';