
import { useState } from 'react';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define agent types and their system prompts
export const agentSystemPrompts: Record<string, string> = {
  admin: "You are an Administrative Assistant AI. You help users organize their files, manage appointments, and handle correspondence. Be professional, efficient, and helpful. Focus on organizational tasks, scheduling, and administrative support. Provide clear and concise responses.",
  
  accounting: "You are an Accounting Agent AI specialized in cultural and creative industries. You help artists, craftspeople, and cultural entrepreneurs track expenses, prepare for tax filings, and manage financial records. Be precise, detail-oriented, and knowledgeable about financial regulations that apply to the cultural sector. Focus on financial management, tax preparation for creative professionals, and budget planning for cultural projects. Provide accurate calculations and clear financial advice tailored to creative businesses.",
  
  legal: "You are a Legal Advisor AI specialized in cultural industries. You help cultural creators understand legal requirements for their projects, review contracts for exhibitions/performances, and manage intellectual property issues. Be professional, precise, and tailored to the cultural sector. Always clarify that you provide general guidance, not legal representation. Focus on contract reviews for cultural projects, copyright and IP rights, and legal compliance specific to cultural organizations.",
  
  operations: "You are an Operations Manager AI focused on cultural projects. You help creative professionals streamline processes, manage creative workflows, and optimize productivity for cultural initiatives. Be practical, efficient, and solutions-oriented with a focus on the unique challenges of cultural production. Focus on process improvement for creative teams, coordination of cultural projects, and operational efficiency for cultural organizations.",
  
  cultural: "You are a Cultural Creator Agent AI. You help artists, performers, craftspeople, and cultural organizations with contracts, cost calculations, portfolio creation, and export strategies. Be creative, supportive, and knowledgeable about the cultural sector. Focus on the specific needs of cultural creators, including project management, grant applications, audience development, and creative industry best practices.",
  
  "contract-generator": "You are a Contract Generator AI specialized in cultural projects. You help artists, performers, and cultural organizations draft professional contracts. Be detailed, precise, and knowledgeable about intellectual property rights, payment terms, and cultural industry standards. Focus on creating clear agreements that protect the creator's interests while being fair to all parties. Provide explanations for important contract clauses and suggest additions based on the specific project context. Respond in the same language the user is using. When generating contracts or legal documents, also create corresponding tasks and deliverables for the user to track their progress.",

  "cost-calculator": "You are a Cost Calculator AI specialized in cultural projects. You help cultural creators calculate project costs, set appropriate prices for their work, and develop financial plans. Be precise, practical, and knowledgeable about cultural sector economics. Focus on helping users properly value their creative work, account for all direct and indirect costs, and establish sustainable pricing strategies. Provide specific calculations and formulas tailored to different types of cultural work. Respond in the same language the user is using. When providing cost calculations, create detailed breakdowns as deliverables and suggest budget management tasks."
};

// Agent ID mapping to associate dashboard agent IDs with system prompt types
export const agentIdMapping: Record<string, string> = {
  "contract-generator": "contract-generator",
  "cost-calculator": "cost-calculator",
  "maturity-evaluator": "operations"
};

export function useAIAgent(agentType: string = 'admin') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendMessage = async (content: string): Promise<string | null> => {
    if (!content.trim()) return null;
    
    console.log('=== AI Agent Send Message ===');
    console.log('Message content:', content);
    console.log('Agent type:', agentType);
    
    // Add user message immediately
    const userMessage: Message = { type: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    
    setIsProcessing(true);
    
    try {
      // Map agent type to system prompt
      const mappedAgentType = agentIdMapping[agentType] || agentType;
      const systemPrompt = agentSystemPrompts[mappedAgentType] || agentSystemPrompts.admin;
      
      console.log('Using system prompt for agent:', mappedAgentType);
      console.log('System prompt:', systemPrompt.substring(0, 100) + '...');
      
      // Prepare conversation history for API (exclude current message as it's already in messages state)
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add current message to conversation
      conversationHistory.push({ role: 'user', content });
      
      const requestPayload = {
        systemPrompt,
        messages: conversationHistory
      };
      
      console.log('Calling edge function with payload:', {
        systemPrompt: systemPrompt.substring(0, 50) + '...',
        messagesCount: conversationHistory.length,
        lastMessage: content.substring(0, 50) + '...'
      });
      
      // Try to use master context system if user is authenticated
      let finalPayload = requestPayload;
      
      if (user?.id) {
        try {
          console.log('Attempting to use master context for user:', user.id, 'agent:', agentType);
          
          const { data: chatResponse, error: chatError } = await supabase.functions.invoke('chat-assistant', {
            body: {
              messages: conversationHistory,
              language: 'es', // Default to Spanish, could be made configurable
              userId: user.id,
              agentId: agentType
            }
          });
          
          if (chatResponse && !chatError) {
            console.log('Master context response received');
            const aiResponse = chatResponse.response;
            
            // Add AI message
            const aiMessage: Message = { type: 'agent', content: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
            
            return aiResponse;
          } else {
            console.warn('Master context failed, falling back to legacy system:', chatError);
          }
        } catch (masterError) {
          console.warn('Master context error, falling back to legacy system:', masterError);
        }
      }
      
      // Fallback to original openai-chat function
      console.log('Using legacy openai-chat function');
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: finalPayload
      });
      
      console.log('Edge function response - data:', data);
      console.log('Edge function response - error:', error);
      
      // Handle Supabase function invocation errors
      if (error) {
        console.error('Supabase function invoke error:', error);
        throw new Error(`Service error: ${error.message || 'Unknown error'}`);
      }
      
      // Handle case where no data is returned
      if (!data) {
        console.error('No data returned from edge function');
        throw new Error('No response received from AI service');
      }
      
      // Handle edge function returned an error
      if (data.error) {
        console.error('Edge function returned error:', data);
        
        // Provide specific error messages based on the error type
        let errorMessage = 'AI service error occurred';
        
        if (data.error.includes('API key') || data.error.includes('OPENAI_API_KEY')) {
          errorMessage = 'OpenAI API key is not configured properly. Please contact support.';
        } else if (data.error.includes('rate limit') || data.status === 429) {
          errorMessage = 'AI service is busy. Please try again in a moment.';
        } else if (data.error.includes('timeout')) {
          errorMessage = 'AI service took too long to respond. Please try again.';
        } else if (data.error.includes('Invalid request')) {
          errorMessage = 'Invalid request format. Please try rephrasing your message.';
        } else {
          errorMessage = data.error;
        }
        
        throw new Error(errorMessage);
      }
      
      // Extract AI response from OpenAI response format
      let aiResponse = 'Sorry, I could not generate a response.';
      
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const choice = data.choices[0];
        if (choice.message && choice.message.content) {
          aiResponse = choice.message.content.trim();
        }
      }
      
      if (!aiResponse || aiResponse === 'Sorry, I could not generate a response.') {
        console.error('No valid content in OpenAI response:', data);
        throw new Error('AI service returned an empty response');
      }
      
      console.log('AI response received successfully:', aiResponse.substring(0, 100) + '...');
      
      // Add AI message
      const aiMessage: Message = { type: 'agent', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
      
      return aiResponse;
      
    } catch (error) {
      console.error('=== AI Agent Error ===');
      console.error('Error details:', error);
      
      // Show user-friendly error messages
      let errorMessage = 'Failed to get AI response. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'AI Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Add error message to chat for better UX
      const errorChatMessage: Message = { 
        type: 'agent', 
        content: `I apologize, but I'm having trouble responding right now. ${errorMessage}` 
      };
      setMessages(prev => [...prev, errorChatMessage]);
      
      return null;
      
    } finally {
      setIsProcessing(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isProcessing,
    sendMessage,
    clearMessages
  };
}
