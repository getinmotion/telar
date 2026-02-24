-- Add creation tracking fields to artisan_shops
ALTER TABLE public.artisan_shops 
ADD COLUMN creation_status text DEFAULT 'complete' CHECK (creation_status IN ('draft', 'incomplete', 'complete')),
ADD COLUMN creation_step integer DEFAULT 0;

-- Create unique constraint to enforce one shop per user
ALTER TABLE public.artisan_shops 
ADD CONSTRAINT unique_user_shop UNIQUE (user_id);

-- Update existing shops to 'complete' status
UPDATE public.artisan_shops 
SET creation_status = 'complete', creation_step = 0 
WHERE creation_status IS NULL;

-- Create function to handle shop creation validation
CREATE OR REPLACE FUNCTION public.validate_single_shop_per_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user already has a shop (excluding the current one for updates)
    IF EXISTS (
        SELECT 1 FROM public.artisan_shops 
        WHERE user_id = NEW.user_id 
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
        RAISE EXCEPTION 'SHOP_LIMIT_EXCEEDED: Un usuario solo puede tener una tienda';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for shop validation
CREATE TRIGGER enforce_single_shop_per_user
    BEFORE INSERT OR UPDATE ON public.artisan_shops
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_single_shop_per_user();