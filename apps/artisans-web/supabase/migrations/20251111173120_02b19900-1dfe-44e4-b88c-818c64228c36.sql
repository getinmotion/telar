-- Create milestone_progress_history table to track progress over time
CREATE TABLE IF NOT EXISTS public.milestone_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  progress NUMERIC NOT NULL CHECK (progress >= 0 AND progress <= 100),
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT milestone_progress_history_unique UNIQUE(user_id, milestone_id, recorded_at)
);

-- Create indexes for performance
CREATE INDEX idx_milestone_progress_history_user_id ON public.milestone_progress_history(user_id);
CREATE INDEX idx_milestone_progress_history_milestone_id ON public.milestone_progress_history(milestone_id);
CREATE INDEX idx_milestone_progress_history_recorded_at ON public.milestone_progress_history(recorded_at);

-- Enable RLS
ALTER TABLE public.milestone_progress_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own milestone progress history"
  ON public.milestone_progress_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestone progress history"
  ON public.milestone_progress_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add milestone-specific achievements to catalog
INSERT INTO public.achievements_catalog (id, title, description, icon, unlock_criteria, category, display_order) VALUES
  ('milestone_formalization', 'Formalización Completada', 'Completaste el hito de Formalización', 'file-check', '{"type": "milestone_completed", "milestone": "formalization"}', 'milestone', 10),
  ('milestone_brand', 'Identidad de Marca Creada', 'Completaste el hito de Identidad de Marca', 'palette', '{"type": "milestone_completed", "milestone": "brand"}', 'milestone', 11),
  ('milestone_shop', 'Tienda Online Lista', 'Completaste el hito de Tienda Online', 'store', '{"type": "milestone_completed", "milestone": "shop"}', 'milestone', 12),
  ('milestone_sales', 'Primeras Ventas Logradas', 'Completaste el hito de Primeras Ventas', 'trending-up', '{"type": "milestone_completed", "milestone": "sales"}', 'milestone', 13),
  ('milestone_community', 'Comunidad Establecida', 'Completaste el hito de Comunidad', 'users', '{"type": "milestone_completed", "milestone": "community"}', 'milestone', 14)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.milestone_progress_history IS 'Historial de progreso de milestones para gráficos temporales';
COMMENT ON COLUMN public.milestone_progress_history.recorded_at IS 'Timestamp cuando se registró este snapshot de progreso';