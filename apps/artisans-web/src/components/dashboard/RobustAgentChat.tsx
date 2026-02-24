
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Plus, MessageSquare, Clock } from 'lucide-react';
import { useAgentConversations } from '@/hooks/useAgentConversations';
import { useAIAgent } from '@/hooks/use-ai-agent';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RobustAgentChatProps {
  agentId: string;
  language: 'en' | 'es';
}

export const RobustAgentChat: React.FC<RobustAgentChatProps> = ({
  agentId,
  language
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const {
    conversations,
    messages,
    currentConversationId,
    loading,
    isProcessing,
    setIsProcessing,
    createConversation,
    addMessage,
    selectConversation,
    startNewConversation
  } = useAgentConversations(agentId);
  
  const { sendMessage: sendAIMessage } = useAIAgent(agentId);

  const t = {
    en: {
      newChat: "New Chat",
      conversations: "Conversations",
      typeMessage: "Type your message...",
      send: "Send",
      thinking: "Thinking...",
      noConversations: "No conversations yet",
      startFirst: "Start your first conversation!",
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This week",
      older: "Older"
    },
    es: {
      newChat: "Chat Nuevo",
      conversations: "Conversaciones",
      typeMessage: "Escribe tu mensaje...",
      send: "Enviar",
      thinking: "Pensando...",
      noConversations: "No hay conversaciones aún",
      startFirst: "¡Inicia tu primera conversación!",
      today: "Hoy",
      yesterday: "Ayer",
      thisWeek: "Esta semana",
      older: "Más antiguos"
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    try {
      let conversationId = currentConversationId;
      
      // Create new conversation if none selected
      if (!conversationId) {
        conversationId = await createConversation(messageContent);
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
      }

      // Add user message
      await addMessage(conversationId, messageContent, 'user');

      // Get AI response
      const aiResponse = await sendAIMessage(messageContent);
      
      // Add AI response
      if (aiResponse) {
        await addMessage(conversationId, aiResponse, 'agent');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupConversationsByDate = (conversations: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return conversations.reduce((groups: any, conv) => {
      const convDate = new Date(conv.updated_at);
      let group = 'older';
      
      if (convDate >= today) {
        group = 'today';
      } else if (convDate >= yesterday) {
        group = 'yesterday';
      } else if (convDate >= weekAgo) {
        group = 'thisWeek';
      }
      
      if (!groups[group]) groups[group] = [];
      groups[group].push(conv);
      return groups;
    }, {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <div className="flex h-[600px] bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button 
            onClick={startNewConversation}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t[language].newChat}
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {t[language].conversations}
          </h3>
          
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t[language].noConversations}</p>
              <p className="text-xs">{t[language].startFirst}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedConversations).map(([group, convs]: [string, any]) => (
                <div key={group}>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    {t[language][group as keyof typeof t[typeof language]]}
                  </h4>
                  <div className="space-y-1">
                    {convs.map((conv: any) => (
                      <Card 
                        key={conv.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          currentConversationId === conv.id 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => selectConversation(conv.id)}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate">
                            {conv.title || 'Nueva conversación'}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(conv.updated_at), { 
                              addSuffix: true, 
                              locale: language === 'es' ? es : undefined 
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 && !currentConversationId ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {language === 'en' ? 'Welcome!' : '¡Bienvenido!'}
                </p>
                <p>
                  {language === 'en' 
                    ? 'Start a new conversation or select an existing one' 
                    : 'Inicia una nueva conversación o selecciona una existente'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {message.message_type !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div 
                      className={`p-4 rounded-2xl ${
                        message.message_type === 'user' 
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' 
                          : 'bg-muted text-foreground border'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true,
                          locale: language === 'es' ? es : undefined
                        })}
                      </div>
                    </div>
                    
                    {message.message_type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-muted border">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-300"></div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {t[language].thinking}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t[language].typeMessage}
              className="flex-grow"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              disabled={!inputMessage.trim() || isProcessing}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
