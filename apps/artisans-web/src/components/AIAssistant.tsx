
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, X, RefreshCcw } from 'lucide-react';
import { Message } from '@/types/chat';
import { useAIAgent } from '@/hooks/use-ai-agent';
import { useTranslations } from '@/hooks/useTranslations';

interface AIAssistantProps {
  onClose?: () => void;
  showHeader?: boolean;
}

export const AIAssistant = ({ onClose, showHeader = true }: AIAssistantProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isProcessing, sendMessage, clearMessages } = useAIAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslations();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isProcessing) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-[500px] flex flex-col">
      {showHeader && (
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="font-medium">{t.aiAssistant.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearMessages}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCcw className="w-3 h-3 mr-1" />
                <span className="text-xs">{t.aiAssistant.reset}</span>
              </Button>
            )}
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.aiAssistant.emptyState}</p>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start gap-2">
              {message.type !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.content}
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[80%] p-3 rounded-lg bg-muted text-foreground">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-300"></div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {t.aiAssistant.thinking}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t.aiAssistant.placeholder}
            className="flex-grow"
            disabled={isProcessing}
          />
          <Button type="submit" disabled={!inputMessage.trim() || isProcessing}>
            <Send className="w-4 h-4 mr-2" />
            {t.aiAssistant.send}
          </Button>
        </div>
      </form>
    </div>
  );
};
