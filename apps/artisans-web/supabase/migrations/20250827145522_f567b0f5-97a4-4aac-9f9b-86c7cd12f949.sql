-- Fix critical security vulnerability: Remove public read access to waitlist table
-- This ensures customer personal information (emails, phone numbers, names) is protected

-- Drop any existing policies that might allow public read access
DROP POLICY IF EXISTS "Allow public access for insert" ON public.waitlist;
DROP POLICY IF EXISTS "Public can read waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Anyone can view waitlist" ON public.waitlist;

-- Ensure we have the correct policies:
-- 1. Only admins can view waitlist entries (protects customer data)
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Only admins can view waitlist" ON public.waitlist;

CREATE POLICY "Only admins can view waitlist data" 
ON public.waitlist 
FOR SELECT 
USING (is_admin());

-- 2. Anyone can join the waitlist (allows new signups)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

CREATE POLICY "Allow public waitlist signup" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- 3. Only admins can modify waitlist entries
DROP POLICY IF EXISTS "Only admins can update waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Only admins can delete waitlist entries" ON public.waitlist;

CREATE POLICY "Only admins can update waitlist" 
ON public.waitlist 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete waitlist entries" 
ON public.waitlist 
FOR DELETE 
USING (is_admin());