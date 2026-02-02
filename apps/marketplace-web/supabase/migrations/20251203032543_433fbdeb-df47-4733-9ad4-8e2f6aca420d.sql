-- Add money_movement_id and payment_status columns to cart_items
ALTER TABLE public.cart_items 
ADD COLUMN money_movement_id TEXT,
ADD COLUMN payment_status TEXT;