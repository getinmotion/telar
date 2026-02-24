-- Create user_onboarding_profiles table for storing onboarding assessment results
-- This table stores the maturity assessment results from the onboarding agent

CREATE TABLE IF NOT EXISTS public.user_onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User identification
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  -- User basic information
  nombre TEXT,
  ubicacion TEXT,
  tipo_artesania TEXT,
  
  -- Maturity scores per category
  madurez_identidad_artesanal TEXT NOT NULL CHECK (madurez_identidad_artesanal IN ('Inicial', 'Intermedio', 'Avanzado')),
  madurez_identidad_artesanal_razon TEXT,
  madurez_identidad_artesanal_tareas TEXT[],
  
  madurez_realidad_comercial TEXT NOT NULL CHECK (madurez_realidad_comercial IN ('Inicial', 'Intermedio', 'Avanzado')),
  madurez_realidad_comercial_razon TEXT,
  madurez_realidad_comercial_tareas TEXT[],
  
  madurez_clientes_y_mercado TEXT NOT NULL CHECK (madurez_clientes_y_mercado IN ('Inicial', 'Intermedio', 'Avanzado')),
  madurez_clientes_y_mercado_razon TEXT,
  madurez_clientes_y_mercado_tareas TEXT[],
  
  madurez_operacion_y_crecimiento TEXT NOT NULL CHECK (madurez_operacion_y_crecimiento IN ('Inicial', 'Intermedio', 'Avanzado')),
  madurez_operacion_y_crecimiento_razon TEXT,
  madurez_operacion_y_crecimiento_tareas TEXT[],
  
  -- Overall maturity
  madurez_general TEXT NOT NULL CHECK (madurez_general IN ('Inicial', 'Intermedio', 'Avanzado')),
  
  -- Summary and recommendations
  resumen TEXT NOT NULL,
  
  -- Raw responses from the 16 questions
  raw_responses JSONB NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_onboarding_profiles_user_id ON public.user_onboarding_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_user_onboarding_profiles_session_id ON public.user_onboarding_profiles(session_id);
CREATE INDEX idx_user_onboarding_profiles_madurez_general ON public.user_onboarding_profiles(madurez_general);
CREATE INDEX idx_user_onboarding_profiles_tipo_artesania ON public.user_onboarding_profiles(tipo_artesania) WHERE tipo_artesania IS NOT NULL;
CREATE INDEX idx_user_onboarding_profiles_created_at ON public.user_onboarding_profiles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_onboarding_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profiles
CREATE POLICY "Users can view own onboarding profiles" 
ON public.user_onboarding_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy: Service role can manage all profiles
CREATE POLICY "Service can manage all onboarding profiles" 
ON public.user_onboarding_profiles 
FOR ALL 
USING (true);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_onboarding_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_onboarding_profiles_updated_at_trigger
  BEFORE UPDATE ON public.user_onboarding_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_onboarding_profiles_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.user_onboarding_profiles IS 'Stores maturity assessment results from the onboarding agent';
COMMENT ON COLUMN public.user_onboarding_profiles.madurez_general IS 'Overall maturity level: Inicial, Intermedio, or Avanzado';
COMMENT ON COLUMN public.user_onboarding_profiles.raw_responses IS 'Complete JSON object of the 16 onboarding question responses';
COMMENT ON COLUMN public.user_onboarding_profiles.resumen IS 'Human-friendly motivational summary of the assessment';

