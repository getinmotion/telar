import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageCircle,
  Brain,
  Target,
  CheckCircle2,
  Clock,
  Play
} from 'lucide-react';

interface CoordinatorTask {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: string;
  estimatedTime: string;
  isUnlocked: boolean;
  steps: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
  taskRecommendation?: {
    taskId: string;
    title: string;
    reason: string;
  };
}

interface ContextualCoordinatorChatProps {
  language: 'en' | 'es';
  tasks: CoordinatorTask[];
  nextTask?: CoordinatorTask | null;
  onTaskStart: (taskId: string) => void;
}

export const ContextualCoordinatorChat: React.FC<ContextualCoordinatorChatProps> = ({
  language,
  tasks,
  nextTask,
  onTaskStart
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const translations = {
    en: {
      title: 'Strategic Discussion',
      placeholder: 'Ask me about your business strategy...',
      send: 'Send',
      thinking: 'Thinking...',
      startTask: 'Start Task',
      welcomeMessage: 'Hello! I\'m your Master Coordinator. I\'ve analyzed your business profile and I\'m here to guide you through your growth journey. What would you like to discuss?',
      suggestions: {
        strategy: 'What should I focus on next?',
        tasks: 'Explain my recommended tasks',
        progress: 'How am I progressing?',
        business: 'Help me improve my business model'
      }
    },
    es: {
      title: 'Discusión Estratégica',
      placeholder: 'Pregúntame sobre tu estrategia de negocio...',
      send: 'Enviar',
      thinking: 'Pensando...',
      startTask: 'Iniciar Tarea',
      welcomeMessage: '¡Hola! Soy tu Coordinador Maestro. He analizado tu perfil empresarial y estoy aquí para guiarte en tu jornada de crecimiento. ¿De qué te gustaría hablar?',
      suggestions: {
        strategy: '¿En qué debería enfocarme ahora?',
        tasks: 'Explícame mis tareas recomendadas',
        progress: '¿Cómo voy progresando?',
        business: 'Ayúdame a mejorar mi modelo de negocio'
      }
    }
  };

  const t = translations[language];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: t.welcomeMessage,
      role: 'assistant',
      timestamp: new Date(),
      suggestions: Object.values(t.suggestions)
    };
    setMessages([welcomeMessage]);
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateContextualResponse(input.trim());
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        suggestions: response.suggestions,
        taskRecommendation: response.taskRecommendation
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateContextualResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    // Analyze user intent and provide contextual responses
    if (input.includes('next') || input.includes('focus') || input.includes('should')) {
      return {
        content: nextTask 
          ? `Based on your current progress, I recommend focusing on "${nextTask.title}". This ${nextTask.category} task is critical for your business development and should take approximately ${nextTask.estimatedTime}. It will help you build the foundation needed for future growth.`
          : 'You\'re making great progress! Continue with your current tasks and I\'ll identify new opportunities as you complete them.',
        suggestions: ['Why is this important?', 'What are the steps?', 'How does this help my business?'],
        taskRecommendation: nextTask ? {
          taskId: nextTask.id,
          title: nextTask.title,
          reason: 'This task aligns with your current business maturity level and will unlock further opportunities.'
        } : undefined
      };
    }

    if (input.includes('task') || input.includes('recommend')) {
      const availableTasks = tasks.filter(t => t.isUnlocked).slice(0, 3);
      return {
        content: `I've identified ${availableTasks.length} key tasks for you:\n\n${availableTasks.map((task, i) => 
          `${i + 1}. **${task.title}** (${task.estimatedTime})\n   ${task.description}`
        ).join('\n\n')}\n\nThese tasks are strategically sequenced to build your business capabilities progressively.`,
        suggestions: ['Start the first task', 'Explain the priority order', 'How long will these take?']
      };
    }

    if (input.includes('progress') || input.includes('how am i')) {
      const completed = tasks.filter(t => t.steps.every(s => s.isCompleted)).length;
      const total = tasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        content: `You've completed ${completed} out of ${total} tasks (${percentage}% progress). Your journey shows strong momentum in business development. The areas where you're excelling include strategic planning and market understanding. I suggest maintaining this pace while focusing on the next priority tasks.`,
        suggestions: ['What areas need improvement?', 'Set new goals', 'Celebrate my progress']
      };
    }

    if (input.includes('business model') || input.includes('improve')) {
      return {
        content: 'To improve your business model, I recommend focusing on three key areas: customer value proposition, revenue streams, and operational efficiency. Based on your current maturity level, strengthening your customer research and market positioning will have the highest impact.',
        suggestions: ['Help with customer research', 'Improve my value proposition', 'Optimize revenue streams']
      };
    }

    // Default response
    return {
      content: 'I understand you\'re looking for guidance. As your Master Coordinator, I\'m here to help you navigate your business journey strategically. What specific aspect of your business development would you like to discuss?',
      suggestions: ['My next priorities', 'Business strategy', 'Task recommendations', 'Progress review']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          {t.title}
          <Badge variant="outline" className="ml-auto">
            <Brain className="w-3 h-3 mr-1" />
            AI Coordinator
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 space-y-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] space-y-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Task recommendation */}
                  {message.taskRecommendation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-3 bg-primary/5 rounded-lg border border-primary/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">{message.taskRecommendation.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{message.taskRecommendation.reason}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => onTaskStart(message.taskRecommendation!.taskId)}
                          className="flex-shrink-0"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {t.startTask}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-1"
                    >
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs h-auto py-1 px-2"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-3"
                >
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="ml-2 text-sm text-muted-foreground">{t.thinking}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};