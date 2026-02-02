-- Add milestone_category column to agent_tasks table
ALTER TABLE agent_tasks 
ADD COLUMN IF NOT EXISTS milestone_category text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_tasks_milestone_category 
ON agent_tasks(milestone_category);

-- Add index for combined milestone + user queries
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_milestone 
ON agent_tasks(user_id, milestone_category);

-- Add check constraint to ensure valid milestone categories
ALTER TABLE agent_tasks
ADD CONSTRAINT check_milestone_category 
CHECK (
  milestone_category IS NULL OR 
  milestone_category IN ('formalization', 'brand', 'shop', 'sales', 'community')
);

COMMENT ON COLUMN agent_tasks.milestone_category IS 'Categoría de milestone del Camino del Artesano: formalization, brand, shop, sales, community';