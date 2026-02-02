import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

import { TaskStep } from './_deprecated/types/taskStepTypes';

export interface StepAIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useStepAI = (step: TaskStep) => {
  const { user } = useAuth();
  const language = 'en'; // Fixed to English only
  const [messages, setMessages] = useState<StepAIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!step || !user) return;

    const userMessage: StepAIMessage = { 
      role: 'user', 
      content, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('step-ai-assistant', {
        body: { 
          message: content,
          step: {
            id: step.id,
            title: step.title,
            description: step.description,
            input_type: step.input_type,
            ai_context_prompt: step.ai_context_prompt,
            user_input_data: step.user_input_data
          },
          language,
          conversation_history: messages
        },
      });

      if (error) throw error;

      const assistantMessage: StepAIMessage = { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Log AI assistance
      await supabase
        .from('task_steps')
        .update({
          ai_assistance_log: [
            ...step.ai_assistance_log,
            {
              timestamp: new Date().toISOString(),
              message: content,
              type: 'question'
            },
            {
              timestamp: new Date().toISOString(),
              message: data.response,
              type: 'response'
            }
          ]
        })
        .eq('id', step.id);

    } catch (error) {
      console.error("Error calling step-ai-assistant function:", error);
      
      const errorMessage = "I'm sorry, I can't help you with this step right now.";
      
      const errorResponse: StepAIMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [step, language, user, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages 
  };
};