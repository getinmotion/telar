-- Add unique constraint to artisan_analytics table to prevent duplicate entries
ALTER TABLE public.artisan_analytics 
ADD CONSTRAINT unique_shop_date UNIQUE (shop_id, date);