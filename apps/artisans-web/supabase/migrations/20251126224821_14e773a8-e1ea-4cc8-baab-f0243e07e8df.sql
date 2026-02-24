-- Create server-side rate limiting table
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  identifier TEXT PRIMARY KEY,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  last_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked_until 
ON public.auth_rate_limits(blocked_until) 
WHERE blocked_until IS NOT NULL;

-- Enable RLS on rate limits table
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (edge functions only)
CREATE POLICY "Service role full access" ON public.auth_rate_limits
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Cleanup old entries function (run daily via cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.auth_rate_limits
  WHERE first_attempt < NOW() - INTERVAL '1 day';
END;
$$;

-- Fix waitlist RLS policy to prevent spam
DROP POLICY IF EXISTS "Anyone can insert to waitlist" ON public.waitlist;

CREATE POLICY "Public can insert waitlist with validation" ON public.waitlist
FOR INSERT TO anon, authenticated
WITH CHECK (
  -- Email must be valid format
  email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  AND
  -- Full name must be reasonable length
  LENGTH(TRIM(full_name)) >= 2 AND LENGTH(TRIM(full_name)) <= 200
);

-- Fix cart_items RLS to properly validate session_id
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anonymous users can manage cart by session" ON public.cart_items;

CREATE POLICY "Authenticated users manage own cart" ON public.cart_items
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous cart access by session" ON public.cart_items
FOR ALL TO anon
USING (
  user_id IS NULL 
  AND session_id IS NOT NULL
  AND LENGTH(session_id) >= 32 -- Ensure session_id is sufficiently long
)
WITH CHECK (
  user_id IS NULL 
  AND session_id IS NOT NULL
  AND LENGTH(session_id) >= 32
);

-- Add comment for future developers
COMMENT ON TABLE public.auth_rate_limits IS 
'Server-side rate limiting for authentication. Tracks failed login attempts to prevent brute force attacks. Cleaned up daily by cleanup_old_rate_limits() function.';

COMMENT ON POLICY "Public can insert waitlist with validation" ON public.waitlist IS
'Allows public signup but validates email format and name length to prevent spam. Consider adding CAPTCHA or additional rate limiting.';

COMMENT ON POLICY "Anonymous cart access by session" ON public.cart_items IS
'Anonymous carts require session_id >= 32 chars (cryptographically secure). Frontend must generate secure session IDs.';