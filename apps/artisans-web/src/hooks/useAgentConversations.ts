import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgentConversation {
  id: string;
  agent_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  task_id: string | null;
}

export interface ChatAction {
  id: string;
  label: string;
  type: 'task-action' | 'conversation' | 'resource';
  priority: 'high' | 'medium' | 'low';
  context?: {
    taskId?: string;
    action?: string;
    data?: any;
  };
}

export interface AgentMessage {
  id: string;
  conversation_id: string;
  message_type: 'user' | 'agent';
  content: string;
  metadata: any;
  created_at: string;
  suggested_actions?: ChatAction[];
}

export function useAgentConversations(agentId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch conversations for agent - internal use for manual refresh
  const fetchConversations = useCallback(async () => {
    if (!user || !agentId) return;

    try {
      const { data, error } = await supabase
        .from('agent_chat_conversations')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('agent_id', agentId as any)
        .eq('is_archived', false as any)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations((data as any) || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las conversaciones',
        variant: 'destructive',
      });
    }
  }, [user, agentId, toast]);

  // Fetch messages for current conversation
  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) {
      console.log('No conversation ID provided, clearing messages');
      setMessages([]);
      return;
    }
    
    console.log('Fetching messages for conversation:', conversationId);
    setMessagesLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('conversation_id', conversationId as any)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log('Fetched messages:', data?.length || 0);
      
      const typedMessages: AgentMessage[] = (data || []).map((msg: any) => ({
        ...msg,
        message_type: msg.message_type as 'user' | 'agent'
      }));
      
      setMessages(typedMessages);
      console.log('Messages state updated with:', typedMessages.length, 'messages');
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los mensajes',
        variant: 'destructive',
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  // Select conversation and load its messages
  const selectConversation = async (conversationId: string) => {
    console.log('Selecting conversation:', conversationId);
    if (currentConversationId === conversationId) return; // Avoid re-loading same conversation
    setCurrentConversationId(conversationId);
    await fetchMessages(conversationId);
    console.log('Conversation selection completed for:', conversationId);
  };

  // Create new conversation - enhanced to support task-specific conversations
  const createConversation = async (firstMessage: string, taskId?: string) => {
    if (!user) return null;

    setIsProcessing(true);
    try {
      const conversationData: any = {
        user_id: user.id,
        agent_id: agentId,
        title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
      };

      // If this conversation is for a specific task, add task_id and modify title
      if (taskId) {
        conversationData.task_id = taskId;
        // Get task details to create a better title
        const { data: taskData } = await supabase
          .from('agent_tasks')
          .select('title')
          .eq('id', taskId as any)
          .single();
        
        const taskResult = taskData as any;
        if (taskResult) {
          conversationData.title = `Tarea: ${taskResult.title}`;
        }
      }

      const { data: conversation, error: convError } = await supabase
        .from('agent_chat_conversations')
        .insert(conversationData as any)
        .select('*')
        .single();

      if (convError) throw convError;
      const conversationResult = conversation as any;

      console.log('Created new conversation:', conversationResult.id, taskId ? `for task: ${taskId}` : '');
      
      // Update state locally to show the new conversation immediately
      setConversations(prev => [conversationResult as AgentConversation, ...prev]);
      setCurrentConversationId(conversationResult.id);
      setMessages([]); // Start with an empty message list for the new chat
      
      return conversationResult.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la conversación',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Create conversation specifically for a task
  const createTaskConversation = async (taskId: string, taskTitle: string) => {
    if (!user) return null;

    try {
      // First, validate that the task exists and belongs to the user
      const { data: taskExists } = await supabase
        .from('agent_tasks')
        .select('id')
        .eq('id', taskId as any)
        .eq('user_id', user.id as any)
        .maybeSingle();

      if (!taskExists) {
        console.error('Task not found or does not belong to user:', taskId);
        throw new Error('La tarea no existe o no te pertenece');
      }

      const firstMessage = `Trabajemos en la tarea: "${taskTitle}". ¿Cómo puedo ayudarte con esta tarea?`;
      return await createConversation(firstMessage, taskId);
    } catch (error) {
      console.error('Error creating task conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la conversación para esta tarea',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Delete conversation - archives it and removes messages
  const deleteConversation = async (conversationId: string) => {
    if (!user) return false;

    try {
      // Archive the conversation
      const { error: archiveError } = await supabase
        .from('agent_chat_conversations')
        .update({ is_archived: true } as any)
        .eq('id', conversationId as any)
        .eq('user_id', user.id as any);

      if (archiveError) throw archiveError;

      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // If this was the current conversation, clear it
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }

      toast({
        title: 'Conversación eliminada',
        description: 'La conversación ha sido eliminada exitosamente',
      });

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la conversación',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Add message to conversation
  const addMessage = async (conversationId: string, content: string, messageType: 'user' | 'agent', suggestedActions?: ChatAction[]) => {
    try {
      const { data, error } = await supabase
        .from('agent_messages')
        .insert({
          conversation_id: conversationId,
          message_type: messageType,
          content: content
        } as any)
        .select()
        .single();

      if (error) throw error;
      const messageResult = data as any;
      
      console.log('Added message:', messageResult.id);
      
      const typedMessage: AgentMessage = {
        ...(messageResult as any),
        message_type: messageResult.message_type as 'user' | 'agent',
        suggested_actions: suggestedActions
      };
      
      setMessages(prev => [...prev, typedMessage]);
      
      // Update conversation timestamp
      await supabase
        .from('agent_chat_conversations')
        .update({ updated_at: new Date().toISOString() } as any)
        .eq('id', conversationId as any);

      // Refresh conversations order locally
      setConversations(prevConvs => {
        const convToUpdate = prevConvs.find(c => c.id === conversationId);
        if (!convToUpdate) return prevConvs;
        
        const updatedConv = { ...convToUpdate, updated_at: new Date().toISOString() };
        const otherConvs = prevConvs.filter(c => c.id !== conversationId);
        
        return [updatedConv, ...otherConvs];
      });

      return typedMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  };

  // Start new conversation - clear everything
  const startNewConversation = () => {
    console.log('Starting new conversation');
    setCurrentConversationId(null);
    setMessages([]);
    console.log('New conversation started - state cleared');
  };

  useEffect(() => {
    if (user && agentId) {
      setLoading(true);
      const loadInitialData = async () => {
        try {
          const { data, error } = await supabase
            .from('agent_chat_conversations')
            .select('*')
            .eq('user_id', user.id as any)
            .eq('agent_id', agentId as any)
            .eq('is_archived', false as any)
            .order('updated_at', { ascending: false });

          if (error) throw error;
          
          const convs = (data as any) || [];
          setConversations(convs);

          // If there is no conversation selected, and we have conversations, select the most recent one.
          if (!currentConversationId && convs.length > 0) {
            await selectConversation(convs[0].id);
          }
        } catch (error) {
          console.error('Error fetching initial conversations:', error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar las conversaciones iniciales',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };

      loadInitialData();
    } else {
      // Clear state if user or agentId is missing
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
      setLoading(false);
    }
  }, [user, agentId, toast]); // Dependency array is correct, no need for more variables

  // Debug effect to log state changes
  useEffect(() => {
    console.log('useAgentConversations state:', {
      conversationsCount: conversations.length,
      messagesCount: messages.length,
      currentConversationId,
      loading,
      messagesLoading,
      isProcessing
    });
  }, [conversations, messages, currentConversationId, loading, messagesLoading, isProcessing]);

  return {
    conversations,
    messages,
    currentConversationId,
    loading,
    isProcessing,
    messagesLoading,
    setIsProcessing,
    createConversation,
    createTaskConversation,
    deleteConversation,
    addMessage,
    selectConversation,
    startNewConversation,
    fetchConversations
  };
}
