-- Add deliverable_type column to agent_tasks table
ALTER TABLE agent_tasks 
ADD COLUMN IF NOT EXISTS deliverable_type TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_tasks_deliverable_type 
ON agent_tasks(deliverable_type);

-- Add comment explaining the column
COMMENT ON COLUMN agent_tasks.deliverable_type IS 'Specifies which specialized wizard/tool should handle this task (e.g., brand_identity_wizard, product_upload_wizard)';