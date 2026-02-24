-- Drop existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Users can insert their own analytics" ON analytics_events;
DROP POLICY IF EXISTS "Service can insert analytics events" ON analytics_events;

-- Create new policy that allows both authenticated and anonymous inserts
CREATE POLICY "Allow analytics inserts for authenticated and anonymous users"
ON analytics_events
FOR INSERT
WITH CHECK (
  -- Allow if user is authenticated and user_id matches
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow if user is anonymous (no auth) and user_id is NULL
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Keep the SELECT policy for authenticated users only
-- (Anonymous users don't need to read analytics)