
-- Add task_id column to agent_conversations table to link conversations with specific tasks
ALTER TABLE agent_conversations 
ADD COLUMN task_id uuid REFERENCES agent_tasks(id) ON DELETE SET NULL;

-- Add index for better performance when querying conversations by task
CREATE INDEX idx_agent_conversations_task_id ON agent_conversations(task_id);

-- Add index for querying conversations by agent and task together  
CREATE INDEX idx_agent_conversations_agent_task ON agent_conversations(agent_id, task_id);
