-- Fix the RLS policy that tries to access auth.users directly
-- Drop the problematic policy
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;

-- Recreate using auth.email() function instead of subquery to auth.users
CREATE POLICY "Customers can view their own orders" 
ON public.orders 
FOR SELECT 
USING (customer_email = auth.email());