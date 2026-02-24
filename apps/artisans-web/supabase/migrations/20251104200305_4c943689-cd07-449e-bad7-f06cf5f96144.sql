-- Create user_maturity_actions table to track all score-incrementing actions
CREATE TABLE IF NOT EXISTS public.user_maturity_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('sale', 'agent_use', 'task_completed', 'customer_interaction', 'milestone', 'increment')),
  category TEXT NOT NULL CHECK (category IN ('ideaValidation', 'userExperience', 'marketFit', 'monetization')),
  points INTEGER NOT NULL CHECK (points >= 0 AND points <= 100),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_maturity_actions_user_id ON public.user_maturity_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_maturity_actions_created_at ON public.user_maturity_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_maturity_actions_category ON public.user_maturity_actions(category);

-- Enable RLS
ALTER TABLE public.user_maturity_actions ENABLE ROW LEVEL SECURITY;

-- Users can view their own actions
CREATE POLICY "Users can view their own maturity actions"
  ON public.user_maturity_actions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service can insert actions
CREATE POLICY "Service can insert maturity actions"
  ON public.user_maturity_actions
  FOR INSERT
  WITH CHECK (true);

-- Create function to increment maturity scores
CREATE OR REPLACE FUNCTION public.increment_maturity_score(
  user_uuid UUID,
  score_category TEXT,
  increment_points INTEGER,
  action_description TEXT,
  action_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  idea_validation INTEGER,
  user_experience INTEGER,
  market_fit INTEGER,
  monetization INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_record RECORD;
  new_score INTEGER;
  column_name TEXT;
BEGIN
  -- Map category to column name
  column_name := CASE score_category
    WHEN 'ideaValidation' THEN 'idea_validation'
    WHEN 'userExperience' THEN 'user_experience'
    WHEN 'marketFit' THEN 'market_fit'
    WHEN 'monetization' THEN 'monetization'
    ELSE NULL
  END;
  
  IF column_name IS NULL THEN
    RAISE EXCEPTION 'Invalid score category: %', score_category;
  END IF;
  
  -- Get current scores
  SELECT * INTO current_record
  FROM user_maturity_scores
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no record exists, create one with initial values
  IF NOT FOUND THEN
    INSERT INTO user_maturity_scores (user_id, idea_validation, user_experience, market_fit, monetization)
    VALUES (user_uuid, 0, 0, 0, 0)
    RETURNING * INTO current_record;
  END IF;
  
  -- Calculate new score (cap at 100)
  new_score := LEAST(
    COALESCE(
      CASE column_name
        WHEN 'idea_validation' THEN current_record.idea_validation
        WHEN 'user_experience' THEN current_record.user_experience
        WHEN 'market_fit' THEN current_record.market_fit
        WHEN 'monetization' THEN current_record.monetization
      END, 
      0
    ) + increment_points, 
    100
  );
  
  -- Update the specific score column
  EXECUTE format(
    'UPDATE user_maturity_scores SET %I = $1, created_at = NOW() WHERE user_id = $2',
    column_name
  ) USING new_score, user_uuid;
  
  -- Log the action
  INSERT INTO user_maturity_actions (user_id, action_type, category, points, description, metadata)
  VALUES (user_uuid, 'increment', score_category, increment_points, action_description, action_metadata);
  
  -- Return updated scores
  RETURN QUERY
  SELECT ms.idea_validation, ms.user_experience, ms.market_fit, ms.monetization
  FROM user_maturity_scores ms
  WHERE ms.user_id = user_uuid
  ORDER BY ms.created_at DESC
  LIMIT 1;
END;
$$;