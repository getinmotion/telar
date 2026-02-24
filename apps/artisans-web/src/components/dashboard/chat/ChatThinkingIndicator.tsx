
import React from 'react';
import { Bot, Calculator, Palette, Scale, Settings, FileText, Users, Target, TrendingUp } from 'lucide-react';

interface ChatThinkingIndicatorProps {
  language: 'en' | 'es';
  agentId?: string;
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

export const ChatThinkingIndicator: React.FC<ChatThinkingIndicatorProps> = ({
  language,
  agentId
}) => {
  const t = {
    en: { thinking: "Thinking..." },
    es: { thinking: "Pensando..." }
  };

  const IconComponent = getAgentIcon(agentId);

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center mt-1 shadow-lg">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="p-4 rounded-2xl bg-muted text-foreground shadow-lg border">
          <div className="flex space-x-2 items-center">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-150"></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-300"></div>
            <span className="text-xs text-muted-foreground ml-2">
              {t[language].thinking}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
