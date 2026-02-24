-- Bloque 3: Sistema de Aprendizaje IA - Tablas de Analytics

-- Tabla para tracking de comportamiento de usuarios
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id uuid,
  timestamp timestamptz DEFAULT now(),
  duration_seconds integer,
  success boolean,
  maturity_level text,
  agent_id text,
  task_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_behavior_user_id ON public.user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_event_type ON public.user_behavior_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_behavior_timestamp ON public.user_behavior_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_agent_id ON public.user_behavior_analytics(agent_id);

-- Tabla para insights agregados y patrones detectados
CREATE TABLE IF NOT EXISTS public.aggregated_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL,
  category text,
  pattern_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  sample_size integer DEFAULT 0,
  generated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  impact_level text CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  recommendation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para insights
CREATE INDEX IF NOT EXISTS idx_insights_type ON public.aggregated_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_active ON public.aggregated_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_insights_impact ON public.aggregated_insights(impact_level);

-- RLS Policies para user_behavior_analytics
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics events"
  ON public.user_behavior_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics"
  ON public.user_behavior_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert analytics events"
  ON public.user_behavior_analytics
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies para aggregated_insights
ALTER TABLE public.aggregated_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active insights"
  ON public.aggregated_insights
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service can manage insights"
  ON public.aggregated_insights
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para actualizar updated_at en insights
CREATE OR REPLACE FUNCTION update_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_aggregated_insights_updated_at
  BEFORE UPDATE ON public.aggregated_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_insights_updated_at();