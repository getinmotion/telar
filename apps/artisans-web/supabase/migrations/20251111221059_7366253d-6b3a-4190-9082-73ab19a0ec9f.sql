-- Create brand diagnosis history table
CREATE TABLE IF NOT EXISTS public.brand_diagnosis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnosis_data JSONB NOT NULL,
  changed_element TEXT CHECK (changed_element IN ('logo', 'colors', 'claim', 'typography', 'full')),
  score_before NUMERIC,
  score_after NUMERIC,
  average_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.brand_diagnosis_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own diagnosis history"
  ON public.brand_diagnosis_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnosis history"
  ON public.brand_diagnosis_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_brand_diagnosis_history_user_created 
  ON public.brand_diagnosis_history(user_id, created_at DESC);

COMMENT ON TABLE public.brand_diagnosis_history IS 'Tracks brand diagnosis evolution over time for each user';
COMMENT ON COLUMN public.brand_diagnosis_history.changed_element IS 'Which brand element was modified: logo, colors, claim, typography, or full re-diagnosis';
COMMENT ON COLUMN public.brand_diagnosis_history.score_before IS 'Score before the change (for specific dimension)';
COMMENT ON COLUMN public.brand_diagnosis_history.score_after IS 'Score after the change (for specific dimension)';
COMMENT ON COLUMN public.brand_diagnosis_history.average_score IS 'Overall brand diagnosis score at this point in time';