
import React, { useState, useEffect } from 'react';
import { useAgentTasks, AgentTask } from '@/hooks/useAgentTasks';
import { Button } from '@/components/ui/button';
import { UnifiedAgentHeader } from './chat/UnifiedAgentHeader';
import { SimpleTaskInterface } from './SimpleTaskInterface';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AgentTasksPanelProps {
  agentId: string;
  language: 'en' | 'es';
  onChatWithAgent?: (taskId: string, taskTitle: string) => void;
  showHeader?: boolean;
  onBack?: () => void;
}

export const AgentTasksPanel: React.FC<AgentTasksPanelProps> = ({ 
  agentId, 
  language, 
  onChatWithAgent,
  showHeader = false,
  onBack
}) => {
  
  const { user } = useAuth();
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);


  // Enhanced chat handler that creates task-specific conversations and opens chat immediately
  const handleChatWithAgent = async (taskId: string, taskTitle: string) => {
    if (!user || !onChatWithAgent || processingTaskId === taskId) return;

    setIsLoadingChat(true);
    setProcessingTaskId(taskId);

    try {
      // First, validate that the task exists
      const { data: taskExists } = await supabase
        .from('agent_tasks')
        .select('id')
        .eq('id', taskId as any)
        .eq('user_id', user.id as any)
        .maybeSingle();

      if (!taskExists) {
        console.error('Task not found:', taskId);
        return;
      }

      // Check if a conversation already exists for this task
      const { data: existingConversation } = await supabase
        .from('agent_chat_conversations')
        .select('id')
        .eq('user_id', user.id as any)
        .eq('agent_id', agentId as any)
        .eq('task_id', taskId as any)
        .maybeSingle();

      let conversationId = (existingConversation as any)?.id;

      // If no conversation exists, create one
      if (!conversationId) {
        const { data: newConversation, error } = await supabase
          .from('agent_chat_conversations')
          .insert({
            user_id: user.id,
            agent_id: agentId,
            task_id: taskId,
            title: `Desarrollo: ${taskTitle}`,
            is_archived: false
          } as any)
          .select('id')
          .single();

        if (error) {
          console.error('Error creating conversation:', error);
          // Fallback to basic chat without task context
          onChatWithAgent(taskId, taskTitle);
          return;
        }
        
        conversationId = (newConversation as any)?.id;

        // Add initial context message about the task development
        const initialMessage = language === 'es' 
          ? `¡Perfecto! Vamos a desarrollar juntos la tarea "${taskTitle}". 

Como tu guía especializada en esta misión, te voy a guiar paso a paso para completar esta tarea de manera exitosa. 

🎯 **Mi enfoque será:**
- Dividir la tarea en pasos claros y manejables
- Proporcionarte recursos y herramientas específicas
- Resolver cualquier duda que tengas en el proceso
- Ayudarte a superar obstáculos que puedan surgir

¿Estás listo para empezar? Cuéntame, ¿hay algún aspecto específico de esta tarea con el que te gustaría comenzar o alguna pregunta inicial que tengas?`
          : `Perfect! Let's develop the task "${taskTitle}" together.

As your specialized agent, I'll guide you step by step to complete this task successfully.

🎯 **My approach will be:**
- Break down the task into clear, manageable steps
- Provide you with specific resources and tools
- Resolve any questions you have in the process
- Help you overcome obstacles that may arise

Are you ready to start? Tell me, is there any specific aspect of this task you'd like to begin with, or do you have any initial questions?`;

        await supabase
          .from('agent_messages')
          .insert({
            conversation_id: conversationId,
            message_type: 'agent',
            content: initialMessage
          } as any);
      }

      // Call the original handler with conversation context
      onChatWithAgent(conversationId, taskTitle);
    } catch (error) {
      console.error('Error setting up task conversation:', error);
      // Fallback to basic chat with task ID
      onChatWithAgent(taskId, taskTitle);
    } finally {
      setIsLoadingChat(false);
      setProcessingTaskId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header unificado opcional */}
      {showHeader && (
        <div className="mb-4">
          <UnifiedAgentHeader
            agentId={agentId}
            language={language}
            onBack={onBack}
            variant="embedded"
            showHeader={true}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        <SimpleTaskInterface
          agentId={agentId}
          language={language}
          onStartMission={handleChatWithAgent}
          isLoadingChat={isLoadingChat}
          processingTaskId={processingTaskId}
        />
      </div>
    </div>
  );
};
