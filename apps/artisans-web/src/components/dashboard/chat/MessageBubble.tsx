
import React from 'react';
import { Bot, User, Calculator, Palette, Scale, Settings, FileText, Users, Target, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AgentMessage, ChatAction } from '@/hooks/useAgentConversations';
import { RichTextRenderer } from './RichTextRenderer';
import { ChatActionButtons } from './ChatActionButtons';

interface MessageBubbleProps {
  message: AgentMessage;
  language: 'en' | 'es';
  agentId?: string;
  onAction?: (action: ChatAction) => void;
}

const getAgentIcon = (agentId?: string) => {
  if (!agentId) return Bot;
  
  const iconMap = {
    'cost-calculator': Calculator,
    'collaboration-agreement': Scale,
    'maturity-evaluator': TrendingUp,
    'cultural-consultant': Palette,
    'project-manager': Settings,
    'marketing-advisor': Target,
    'export-advisor': FileText,
    'collaboration-pitch': Users,
    'portfolio-catalog': FileText,
    'artwork-description': FileText,
    'income-calculator': Calculator,
    'branding-strategy': Palette,
    'personal-brand-eval': Users,
    'funding-routes': Target,
    'contract-generator': Scale,
    'tax-compliance': FileText,
    'social-impact-eval': Target,
    'pricing-assistant': Calculator,
    'stakeholder-matching': Users
  };
  
  return iconMap[agentId as keyof typeof iconMap] || Bot;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  language,
  agentId,
  onAction
}) => {
  const isUser = message.message_type === 'user';
  const IconComponent = getAgentIcon(agentId);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-start gap-4 max-w-[80%]">
        {!isUser && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center mt-1 shadow-lg">
            <IconComponent className="w-5 h-5" />
          </div>
        )}
        
        <div 
          className={`p-4 rounded-2xl ${
            isUser 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'bg-muted text-foreground shadow-lg border'
          }`}
        >
          <div className="whitespace-pre-wrap">
            <RichTextRenderer content={message.content} />
          </div>
          
          {/* Show CTAs for agent messages */}
          {!isUser && message.suggested_actions && onAction && (
            <ChatActionButtons
              actions={message.suggested_actions}
              onAction={onAction}
            />
          )}
          
          <div className="text-xs opacity-70 mt-2">
            {formatDistanceToNow(new Date(message.created_at), { 
              addSuffix: true,
              locale: language === 'es' ? es : undefined
            })}
          </div>
        </div>
        
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mt-1 shadow-lg">
            <User className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
