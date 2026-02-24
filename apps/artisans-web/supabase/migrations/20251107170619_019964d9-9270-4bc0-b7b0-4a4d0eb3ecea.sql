
-- Add RLS policies for analytics_events table

-- Policy: Users can insert their own analytics events
CREATE POLICY "Users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can insert analytics events
CREATE POLICY "Anonymous users can insert analytics events"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Policy: Service can insert all analytics events
CREATE POLICY "Service can insert all analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own analytics events
CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can view all analytics events
CREATE POLICY "Admins can view all analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.email = (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid()
    )
    AND admin_users.is_active = true
  )
);
