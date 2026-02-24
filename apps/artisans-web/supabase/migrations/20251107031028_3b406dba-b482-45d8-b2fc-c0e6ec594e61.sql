-- Create table for task routing analytics
CREATE TABLE IF NOT EXISTS task_routing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  
  -- Routing information
  route_type TEXT NOT NULL CHECK (route_type IN ('redirect', 'generic')),
  destination TEXT, -- URL if redirect, NULL if generic
  wizard_name TEXT, -- Brand Wizard, Product Upload Wizard, etc.
  
  -- Task metadata at time of routing
  task_title TEXT NOT NULL,
  task_agent_id TEXT NOT NULL,
  task_deliverable_type TEXT,
  
  -- Decision factors
  matched_by TEXT NOT NULL CHECK (matched_by IN ('task_id', 'deliverable_type', 'agent_keyword', 'fallback')),
  matched_value TEXT, -- The specific value that caused the match
  
  -- Performance tracking
  routed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_to_complete_seconds INTEGER,
  
  -- Outcome tracking
  was_successful BOOLEAN,
  completion_method TEXT, -- 'wizard', 'generic', 'abandoned', 'error'
  error_message TEXT,
  
  -- Metadata
  user_agent TEXT,
  session_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE task_routing_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own routing analytics"
  ON task_routing_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routing analytics"
  ON task_routing_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routing analytics"
  ON task_routing_analytics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_task_routing_analytics_user_id ON task_routing_analytics(user_id);
CREATE INDEX idx_task_routing_analytics_task_id ON task_routing_analytics(task_id);
CREATE INDEX idx_task_routing_analytics_route_type ON task_routing_analytics(route_type);
CREATE INDEX idx_task_routing_analytics_routed_at ON task_routing_analytics(routed_at DESC);
CREATE INDEX idx_task_routing_analytics_matched_by ON task_routing_analytics(matched_by);

-- Create a view for easy analytics querying
CREATE OR REPLACE VIEW task_routing_summary AS
SELECT 
  route_type,
  wizard_name,
  matched_by,
  COUNT(*) as total_routes,
  COUNT(CASE WHEN was_successful = true THEN 1 END) as successful_routes,
  COUNT(CASE WHEN was_successful = false THEN 1 END) as failed_routes,
  COUNT(CASE WHEN completion_method = 'abandoned' THEN 1 END) as abandoned_routes,
  AVG(time_to_complete_seconds) as avg_completion_time_seconds,
  MIN(routed_at) as first_route,
  MAX(routed_at) as last_route
FROM task_routing_analytics
GROUP BY route_type, wizard_name, matched_by;

-- Grant access to the view
GRANT SELECT ON task_routing_summary TO authenticated;

-- Function to automatically calculate time_to_complete when completed_at is set
CREATE OR REPLACE FUNCTION calculate_routing_completion_time()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.time_to_complete_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.routed_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-calculate completion time
CREATE TRIGGER trigger_calculate_routing_completion_time
  BEFORE UPDATE ON task_routing_analytics
  FOR EACH ROW
  EXECUTE FUNCTION calculate_routing_completion_time();

-- Comment on table
COMMENT ON TABLE task_routing_analytics IS 'Tracks task routing decisions and their outcomes for analytics and optimization';