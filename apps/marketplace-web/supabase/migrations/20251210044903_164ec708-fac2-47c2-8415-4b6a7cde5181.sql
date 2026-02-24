-- Fix 1: Stricter RLS for shipping_data table
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert shipping data for their carts" ON public.shipping_data;
DROP POLICY IF EXISTS "Users can view their own shipping data" ON public.shipping_data;

-- Create stricter policies that verify user owns the cart through cart_items
-- Only the user who created the cart items can access shipping data
CREATE POLICY "Users can insert shipping data for their own carts"
ON public.shipping_data
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cart_items
    WHERE cart_items.cart_id = shipping_data.cart_id 
    AND cart_items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own shipping data"
ON public.shipping_data
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cart_items
    WHERE cart_items.cart_id = shipping_data.cart_id 
    AND cart_items.user_id = auth.uid()
    LIMIT 1
  )
);

-- Add update policy for shipping_data 
CREATE POLICY "Users can update their own shipping data"
ON public.shipping_data
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cart_items
    WHERE cart_items.cart_id = shipping_data.cart_id 
    AND cart_items.user_id = auth.uid()
    LIMIT 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cart_items
    WHERE cart_items.cart_id = shipping_data.cart_id 
    AND cart_items.user_id = auth.uid()
    LIMIT 1
  )
);

-- Fix 2: Add proper RLS policies for otp_codes table
-- OTP codes should only be accessible via service role (edge functions)
-- Users should NOT be able to read OTP codes directly
CREATE POLICY "OTP codes are only accessible by service role"
ON public.otp_codes
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);