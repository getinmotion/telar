-- Disable RLS on analytics_events table
-- This table is written to by edge functions using service role key
-- and doesn't contain sensitive user data that needs RLS protection
ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;

-- Drop existing policies since they're no longer needed
DROP POLICY IF EXISTS "Allow analytics inserts for authenticated and anonymous users" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics_events;