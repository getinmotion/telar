-- ============================================
-- PRIORITY 3: Continuous Learning System
-- ============================================

-- Create table to store user interaction patterns
CREATE TABLE IF NOT EXISTS public.user_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Interaction tracking
  interactions_count INT DEFAULT 0,
  tasks_completed_count INT DEFAULT 0,
  tasks_abandoned_count INT DEFAULT 0,
  avg_task_completion_time_seconds INT DEFAULT 0,
  
  -- Behavioral patterns
  preferred_task_types JSONB DEFAULT '[]'::jsonb,
  active_hours JSONB DEFAULT '[]'::jsonb,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Learning insights
  struggling_areas JSONB DEFAULT '[]'::jsonb,
  strength_areas JSONB DEFAULT '[]'::jsonb,
  recommended_adjustments JSONB DEFAULT '{}'::jsonb,
  
  -- Maturity progression
  maturity_trend JSONB DEFAULT '[]'::jsonb,
  last_maturity_check TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_learning_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own learning patterns"
  ON public.user_learning_patterns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning patterns"
  ON public.user_learning_patterns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning patterns"
  ON public.user_learning_patterns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_learning_patterns_user_id ON public.user_learning_patterns(user_id);
CREATE INDEX idx_user_learning_patterns_updated_at ON public.user_learning_patterns(updated_at);

-- Function to auto-update learning patterns
CREATE OR REPLACE FUNCTION public.update_learning_patterns()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Update completion rate
  IF NEW.tasks_completed_count + NEW.tasks_abandoned_count > 0 THEN
    NEW.completion_rate = ROUND(
      (NEW.tasks_completed_count::DECIMAL / 
       (NEW.tasks_completed_count + NEW.tasks_abandoned_count)::DECIMAL) * 100, 
      2
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-update
CREATE TRIGGER trigger_update_learning_patterns
  BEFORE UPDATE ON public.user_learning_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_patterns();

-- Function to get personalized recommendations based on learning patterns
CREATE OR REPLACE FUNCTION public.get_personalized_recommendations(p_user_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_patterns RECORD;
  v_recommendations JSONB;
BEGIN
  -- Get user's learning patterns
  SELECT * INTO v_patterns
  FROM public.user_learning_patterns
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Return default recommendations for new users
    RETURN jsonb_build_object(
      'task_complexity', 'simple',
      'task_types', jsonb_build_array('validation', 'discovery'),
      'recommended_focus', 'idea_validation',
      'learning_stage', 'beginner'
    );
  END IF;
  
  -- Build personalized recommendations
  v_recommendations = jsonb_build_object(
    'task_complexity', 
      CASE 
        WHEN v_patterns.completion_rate >= 80 THEN 'advanced'
        WHEN v_patterns.completion_rate >= 50 THEN 'intermediate'
        ELSE 'simple'
      END,
    'task_types', v_patterns.preferred_task_types,
    'struggling_areas', v_patterns.struggling_areas,
    'strength_areas', v_patterns.strength_areas,
    'completion_rate', v_patterns.completion_rate,
    'recommended_focus', 
      CASE
        WHEN jsonb_array_length(v_patterns.struggling_areas) > 0 
        THEN v_patterns.struggling_areas->0->>'area'
        ELSE 'balanced_growth'
      END,
    'learning_stage',
      CASE
        WHEN v_patterns.tasks_completed_count >= 20 THEN 'advanced'
        WHEN v_patterns.tasks_completed_count >= 10 THEN 'intermediate'
        ELSE 'beginner'
      END
  );
  
  RETURN v_recommendations;
END;
$$ LANGUAGE plpgsql;