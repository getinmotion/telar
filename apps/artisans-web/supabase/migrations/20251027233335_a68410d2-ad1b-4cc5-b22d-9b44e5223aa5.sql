-- Crear tabla para conversaciones de chat de agentes
CREATE TABLE IF NOT EXISTS public.agent_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  title TEXT,
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_agent_chat_conversations_user_id ON public.agent_chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_chat_conversations_agent_id ON public.agent_chat_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_chat_conversations_task_id ON public.agent_chat_conversations(task_id);

-- RLS Policies
ALTER TABLE public.agent_chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat conversations"
ON public.agent_chat_conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat conversations"
ON public.agent_chat_conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat conversations"
ON public.agent_chat_conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat conversations"
ON public.agent_chat_conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Actualizar agent_messages para referenciar agent_chat_conversations
ALTER TABLE public.agent_messages 
DROP CONSTRAINT IF EXISTS agent_messages_conversation_id_fkey;

ALTER TABLE public.agent_messages
ADD CONSTRAINT agent_messages_conversation_id_fkey
FOREIGN KEY (conversation_id) REFERENCES public.agent_chat_conversations(id) ON DELETE CASCADE;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_agent_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_chat_conversations_updated_at
BEFORE UPDATE ON public.agent_chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_chat_conversations_updated_at();

COMMENT ON TABLE public.agent_chat_conversations IS 'Conversaciones de chat entre usuarios y agentes especializados';