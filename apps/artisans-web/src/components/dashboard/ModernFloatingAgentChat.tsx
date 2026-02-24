
import React, { useState, useCallback, useEffect } from 'react';
import { AgentMessage } from '@/hooks/useAgentConversations';
import { useAIAgent } from '@/hooks/use-ai-agent';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from './chat/ChatHeader';
import { ChatWelcomeScreen } from './chat/ChatWelcomeScreen';
import { ChatMessagesArea } from './chat/ChatMessagesArea';
import { ChatInputBar } from './chat/ChatInputBar';
import { getAgentTranslation } from '@/data/agentTranslations';
import { getAgentById } from '@/data/agentsDatabase';
import { ChatAction } from '@/hooks/useAgentConversations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ModernFloatingAgentChatProps {
  agentId: string;
  language: 'en' | 'es';
  onBack?: () => void;
  showHeader?: boolean;
  messages: AgentMessage[];
  currentConversationId: string | null;
  isProcessing: boolean;
  messagesLoading: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  createConversation: (firstMessage: string) => Promise<string | null>;
  addMessage: (conversationId: string, content: string, messageType: 'user' | 'agent', suggestedActions?: ChatAction[]) => Promise<any>;
  onTaskAction?: (action: ChatAction) => void;
}

export const ModernFloatingAgentChat: React.FC<ModernFloatingAgentChatProps> = ({
  agentId,
  language,
  onBack,
  showHeader = false,
  messages,
  currentConversationId,
  isProcessing,
  messagesLoading,
  setIsProcessing,
  createConversation,
  addMessage,
  onTaskAction,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const agentTranslation = getAgentTranslation(agentId, language);
  const agent = getAgentById(agentId);
  
  const { sendMessage: sendAIMessage } = useAIAgent(agentId);
  
  // Enhanced AI message function with task context
  const sendAIMessageWithTaskContext = useCallback(async (messageContent: string, conversationId: string) => {
    if (!user) return null;
    
    try {
      // Check if this conversation is linked to a task
      const { data: conversationData } = await supabase
        .from('agent_conversations')
        .select('task_id')
        .eq('id', conversationId as any)
        .single();
      
      const taskId = (conversationData as any)?.task_id;
      
      const requestBody: any = {
        messages: [{ role: 'user', content: messageContent }],
        language,
        userId: user.id,
        agentId: agentId
      };
      
      // Add task context if available
      if (taskId) {
        requestBody.taskContext = {
          taskId,
          agentId,
          taskTitle: 'Task Title', // This should be fetched from the task
          taskDescription: 'Task Description'
        };
      }
      
      const { data: chatResponse, error: chatError } = await supabase.functions.invoke('chat-assistant', {
        body: requestBody
      });
      
      if (chatResponse && !chatError) {
        return {
          response: chatResponse.response,
          suggestedActions: chatResponse.suggestedActions || []
        };
      }
      
      // Fallback to regular AI agent
      const response = await sendAIMessage(messageContent);
      return response ? { response, suggestedActions: [] } : null;
    } catch (error) {
      console.error('Error with task context AI message:', error);
      // Fallback to regular AI agent
      const response = await sendAIMessage(messageContent);
      return response ? { response, suggestedActions: [] } : null;
    }
  }, [user, sendAIMessage, agentId, language]);

  // Fixed logic: we're in new chat state when there's no conversation AND no messages
  const isNewChat = !currentConversationId && messages.length === 0;

  // Log state for debugging
  useEffect(() => {
    console.log('ModernFloatingAgentChat state:', {
      agentId,
      agentName: agent?.name,
      currentConversationId,
      messagesCount: messages.length,
      isNewChat,
      isProcessing,
      messagesLoading,
      showHeader
    });
  }, [agentId, agent?.name, currentConversationId, messages.length, isNewChat, isProcessing, messagesLoading, showHeader]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;

    const messageContent = message.trim();
    setIsProcessing(true);

    try {
      let conversationId = currentConversationId;
      
      if (!conversationId) {
        console.log('Creating new conversation for agent:', agentId);
        conversationId = await createConversation(messageContent);
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
        console.log('New conversation created:', conversationId);
      }

      console.log('Adding user message...');
      await addMessage(conversationId, messageContent, 'user');
      
      console.log('Sending message to AI agent with task context:', agentId);
      // Try to get response with task context if available
      const aiResponseData = await sendAIMessageWithTaskContext(messageContent, conversationId);
      
      if (aiResponseData) {
        console.log('Adding AI response with suggested actions...');
        await addMessage(conversationId, aiResponseData.response, 'agent', aiResponseData.suggestedActions);
      } else {
        console.error('No AI response received');
        toast({
          title: 'Error',
          description: language === 'en' ? 'No response from AI agent' : 'Sin respuesta del agente IA',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: language === 'en' ? 'Failed to send message' : 'No se pudo enviar el mensaje',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, currentConversationId, createConversation, addMessage, sendAIMessage, setIsProcessing, toast, agentId, language]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;
    
    await handleSendMessage(inputMessage);
    setInputMessage('');
  }, [inputMessage, isProcessing, handleSendMessage]);

  // Show loading state for messages
  if (messagesLoading) {
    return (
      <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        <ChatHeader 
          agentId={agentId}
          language={language}
          onBack={onBack}
          showHeader={true}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">
              {language === 'en' ? 'Loading...' : 'Cargando...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
      <ChatHeader 
        agentId={agentId}
        language={language}
        onBack={onBack}
        showHeader={true}
      />

      {isNewChat ? (
        <ChatWelcomeScreen
          agentId={agentId}
          agentName={agentTranslation?.name || agent?.name || 'AI Assistant'}
          language={language}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <>
          <ChatMessagesArea
            messages={messages}
            isProcessing={isProcessing}
            language={language}
            agentId={agentId}
            onAction={onTaskAction}
          />

          <ChatInputBar
            inputMessage={inputMessage}
            isProcessing={isProcessing}
            language={language}
            onInputChange={setInputMessage}
            onSubmit={handleFormSubmit}
          />
        </>
      )}
    </div>
  );
};
