-- Create agent_conversations table for storing conversation history
-- This table tracks all interactions with the multi-agent system

CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session and user identification
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Agent information
  agent_type TEXT NOT NULL CHECK (agent_type IN ('supervisor', 'onboarding', 'producto', 'legal', 'presencia_digital', 'faq')),
  
  -- Conversation data
  user_input TEXT NOT NULL,
  agent_output JSONB NOT NULL,
  
  -- Context and metadata
  context JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Supervisor routing info (only for supervisor agent)
  selected_agent TEXT,
  routing_confidence DECIMAL(3,2),
  routing_reasoning TEXT,
  
  -- Performance metrics
  execution_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_agent_conversations_session_id ON public.agent_conversations(session_id);
CREATE INDEX idx_agent_conversations_user_id ON public.agent_conversations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_agent_conversations_agent_type ON public.agent_conversations(agent_type);
CREATE INDEX idx_agent_conversations_created_at ON public.agent_conversations(created_at DESC);
CREATE INDEX idx_agent_conversations_session_created ON public.agent_conversations(session_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations" 
ON public.agent_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy: Service role can manage all conversations
CREATE POLICY "Service can manage all conversations" 
ON public.agent_conversations 
FOR ALL 
USING (true);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_agent_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_agent_conversations_updated_at_trigger
  BEFORE UPDATE ON public.agent_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_conversations_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.agent_conversations IS 'Stores conversation history for the multi-agent system';
COMMENT ON COLUMN public.agent_conversations.agent_type IS 'Type of agent that handled the request: supervisor, onboarding, producto, legal, presencia_digital, faq';
COMMENT ON COLUMN public.agent_conversations.agent_output IS 'JSON response from the agent';
COMMENT ON COLUMN public.agent_conversations.context IS 'Contextual information including onboarding data, previous interactions, etc.';

