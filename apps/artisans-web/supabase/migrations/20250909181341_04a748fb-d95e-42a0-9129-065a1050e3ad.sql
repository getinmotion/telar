-- Create access_codes table for secure access code management
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage access codes
CREATE POLICY "Only admins can view access codes"
ON public.access_codes
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can create access codes"
ON public.access_codes
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update access codes"
ON public.access_codes
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete access codes"
ON public.access_codes
FOR DELETE
TO authenticated
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_access_codes_updated_at
BEFORE UPDATE ON public.access_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the existing access code as a seed
INSERT INTO public.access_codes (code, description, is_active, max_uses)
VALUES ('motionproject', 'Initial access code for early access', true, null);