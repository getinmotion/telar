import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface AIAssistantIntegratedProps {
  stepContext: string;
  questionId: string;
  questionTitle?: string;
  isVisible?: boolean;
  initialMessage?: string;
}


export const AIAssistantIntegrated: React.FC<AIAssistantIntegratedProps> = ({ 
  stepContext, 
  questionId, 
  questionTitle,
  isVisible = true,
  initialMessage
}) => {
  const { t, language } = useTranslations();
  const { messages, isLoading, sendMessage } = useAIAssistant(stepContext, questionId, questionTitle);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    if (initialMessage && messages.length === 0) {
      sendMessage(initialMessage);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        {!isExpanded ? (
          <div 
            className="bg-primary/10 border border-primary/20 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]" 
            onClick={handleExpand}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-primary font-medium text-sm">
                  {initialMessage || t.aiAssistant.tellMeMore}
                </p>
                <p className="text-primary/70 text-xs mt-1">
                  {t.aiAssistant.clickToRespond}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-primary/10 border-b border-border p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-primary">
                  {stepContext === 'profile' ? t.aiAssistant.profileAssistant :
                   stepContext === 'business-info' ? t.aiAssistant.businessAssistant :
                   stepContext === 'management-style' ? t.aiAssistant.managementAssistant :
                   t.aiAssistant.defaultAssistant}
                </h3>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 h-64 overflow-y-auto">
              <AnimatePresence>
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Bot size={32} className="mb-2" />
                    <p className="text-sm text-center">
                      {`${t.aiAssistant.aboutQuestion} "${questionTitle || t.aiAssistant.thisContext}".`}
                    </p>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                        <Bot size={18} />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-white text-slate-800 shadow-sm border border-slate-100'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <User size={18} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} />
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white text-slate-800 shadow-sm border border-slate-100 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.aiAssistant.expandedPlaceholder}
                  className="pr-28 bg-white"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2"
                  size="sm"
                >
                  {t.aiAssistant.send}
                  <Send size={16} className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};