-- Enable RLS on whatsapp_sessions table
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for whatsapp_sessions
CREATE POLICY "Service role can manage whatsapp sessions"
ON public.whatsapp_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own whatsapp sessions"
ON public.whatsapp_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());