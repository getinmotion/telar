-- Create shipping_data table for checkout information
CREATE TABLE public.shipping_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  dane_ciudad INTEGER NOT NULL,
  desc_ciudad TEXT NOT NULL,
  desc_depart TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  desc_envio TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipping_data ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own shipping data
CREATE POLICY "Users can insert shipping data for their carts"
ON public.shipping_data
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cart_items
    WHERE cart_items.cart_id = shipping_data.cart_id
    AND cart_items.user_id = auth.uid()
  )
);

-- Create policy for users to view their own shipping data
CREATE POLICY "Users can view their own shipping data"
ON public.shipping_data
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cart_items
    WHERE cart_items.cart_id = shipping_data.cart_id
    AND cart_items.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipping_data_updated_at
BEFORE UPDATE ON public.shipping_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();