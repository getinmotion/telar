-- Create LangGraph checkpoint tables for conversation memory
-- These tables store the state of LangGraph workflows for resumption

-- Main checkpoint table
CREATE TABLE IF NOT EXISTS public.checkpoints (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    type TEXT,
    checkpoint JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

-- Checkpoint writes table (for tracking writes to channels)
CREATE TABLE IF NOT EXISTS public.checkpoint_writes (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INTEGER NOT NULL,
    channel TEXT NOT NULL,
    type TEXT,
    value JSONB,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx),
    FOREIGN KEY (thread_id, checkpoint_ns, checkpoint_id) 
        REFERENCES public.checkpoints(thread_id, checkpoint_ns, checkpoint_id) 
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_id ON public.checkpoints(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_parent_id ON public.checkpoints(parent_checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_thread_id ON public.checkpoint_writes(thread_id);

-- Enable Row Level Security
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoint_writes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role can manage all checkpoints
CREATE POLICY "Service can manage all checkpoints" 
ON public.checkpoints 
FOR ALL 
USING (true);

CREATE POLICY "Service can manage all checkpoint writes" 
ON public.checkpoint_writes 
FOR ALL 
USING (true);

-- Add helpful comments
COMMENT ON TABLE public.checkpoints IS 'LangGraph checkpoint storage for conversation state persistence';
COMMENT ON TABLE public.checkpoint_writes IS 'LangGraph checkpoint writes for tracking channel updates';


