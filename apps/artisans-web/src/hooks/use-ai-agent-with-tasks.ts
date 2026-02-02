import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/chat';

export interface ChatResponse {
  response: string;
  suggestedActions?: any[];
}

export const useAIAgentWithTasks = (agentType: string, taskId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendAIMessage = useCallback(async (userMessage: string): Promise<ChatResponse | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
      const conversationHistory = [
        ...messages,
        { role: 'user' as const, content: userMessage }
      ];
      
      const requestBody: any = {
        messages: conversationHistory,
        language: 'es',
        userId: user.id,
        agentId: agentType
      };
      
      // Add task context if available
      if (taskId) {
        requestBody.taskContext = {
          taskId,
          agentId: agentType,
          taskTitle: 'Task Title', // This should come from props or be fetched
          taskDescription: 'Task Description'
        };
      }
      
      console.log('Sending request to chat-assistant with task context:', requestBody);
      
      const { data: chatResponse, error: chatError } = await supabase.functions.invoke('chat-assistant', {
        body: requestBody
      });
      
      if (chatResponse && !chatError) {
        console.log('Chat response received:', chatResponse);
        
        // Add user message
        const userMsg: Message = { type: 'user', content: userMessage };
        // Add AI message
        const aiMsg: Message = { type: 'agent', content: chatResponse.response };
        
        setMessages(prev => [...prev, userMsg, aiMsg]);
        
        return {
          response: chatResponse.response,
          suggestedActions: chatResponse.suggestedActions || []
        };
      } else {
        console.error('Chat error:', chatError);
        return null;
      }
    } catch (error) {
      console.error('Error sending AI message:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, user, agentType, taskId]);

  return {
    messages,
    isLoading,
    sendAIMessage,
    setMessages
  };
};