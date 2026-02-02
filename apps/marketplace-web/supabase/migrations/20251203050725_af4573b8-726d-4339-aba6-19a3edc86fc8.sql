-- Delete existing cart_items records
DELETE FROM public.cart_items;

-- Add cart_id column to cart_items table
ALTER TABLE public.cart_items 
ADD COLUMN cart_id UUID NOT NULL;