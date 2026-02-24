-- Add archiving support to agent_tasks
ALTER TABLE public.agent_tasks
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Optional index to filter archived tasks efficiently
CREATE INDEX IF NOT EXISTS idx_agent_tasks_is_archived ON public.agent_tasks (is_archived);
