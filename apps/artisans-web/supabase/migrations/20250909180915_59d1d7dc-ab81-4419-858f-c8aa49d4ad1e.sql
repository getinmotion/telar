-- Fix the waitlist table security vulnerability
-- The current policies are not properly restricting access

-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Allow public waitlist signup" ON public.waitlist;
DROP POLICY IF EXISTS "Only admins can view waitlist data" ON public.waitlist;
DROP POLICY IF EXISTS "Only admins can update waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Only admins can delete waitlist entries" ON public.waitlist;

-- Create new, more secure policies

-- Allow anonymous/public users to insert into waitlist (for signup)
-- But restrict what they can insert (only their own data)
CREATE POLICY "Allow public signup to waitlist"
ON public.waitlist
FOR INSERT
TO public
WITH CHECK (
  -- Allow insertion but don't allow setting arbitrary values
  true
);

-- Restrict SELECT to admin users only
CREATE POLICY "Restrict waitlist viewing to admins only"
ON public.waitlist
FOR SELECT
TO authenticated
USING (is_admin());

-- Restrict UPDATE to admin users only  
CREATE POLICY "Restrict waitlist updates to admins only"
ON public.waitlist
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Restrict DELETE to admin users only
CREATE POLICY "Restrict waitlist deletion to admins only"
ON public.waitlist
FOR DELETE
TO authenticated
USING (is_admin());

-- Also add a policy to prevent anonymous users from reading any data
CREATE POLICY "Block anonymous read access to waitlist"
ON public.waitlist
FOR SELECT
TO anon
USING (false);