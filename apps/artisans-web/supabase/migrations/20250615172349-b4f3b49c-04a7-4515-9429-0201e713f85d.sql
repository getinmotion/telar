
-- Enable Row Level Security on the agent_tasks table to ensure users can only access their own data.
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to SELECT (read) their own tasks.
-- This is crucial for displaying tasks in the dashboard.
CREATE POLICY "Users can view their own agent tasks"
ON public.agent_tasks FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy to allow users to INSERT (create) new tasks for themselves.
-- This is needed for the task creation functionality.
CREATE POLICY "Users can create their own agent tasks"
ON public.agent_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow users to UPDATE their own tasks.
-- This allows for changing task status, description, etc.
CREATE POLICY "Users can update their own agent tasks"
ON public.agent_tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Create a policy to allow users to DELETE their own tasks.
CREATE POLICY "Users can delete their own agent tasks"
ON public.agent_tasks FOR DELETE
USING (auth.uid() = user_id);
