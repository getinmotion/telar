-- Create conversation_insights table for deep analysis wizard
CREATE TABLE IF NOT EXISTS public.conversation_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  insight_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversation_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-scoped access
CREATE POLICY "Users can view own insights"
  ON public.conversation_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.conversation_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.conversation_insights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_conversation_insights_user_id 
  ON public.conversation_insights(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_insights_type 
  ON public.conversation_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_conversation_insights_created_at 
  ON public.conversation_insights(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_conversation_insights_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_insights_updated_at
  BEFORE UPDATE ON public.conversation_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_insights_updated_at();