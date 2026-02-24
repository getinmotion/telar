
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Zap } from 'lucide-react';
import { MediumAgentCard } from './MediumAgentCard';
import { getAgentRecommendationReason } from '@/utils/maturityRecommendations';
import { CategoryScore } from '@/types/dashboard';

interface CollapsibleRecommendationsSectionProps {
  agents: Array<{
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    isEnabled: boolean;
    usageCount: number;
    lastUsed: string | null;
    priority: string;
  }>;
  maturityScores: CategoryScore;
  onEnableAgent: (agentId: string) => void;
  togglingAgents: Set<string>;
  language: 'en' | 'es';
}

export const CollapsibleRecommendationsSection: React.FC<CollapsibleRecommendationsSectionProps> = ({
  agents,
  maturityScores,
  onEnableAgent,
  togglingAgents,
  language
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const translations = {
    en: {
      title: "Recommended Based on Your Maturity",
      subtitle: "AI agents selected to help improve your weakest areas",
      count: "recommendations"
    },
    es: {
      title: "Recomendados Según Tu Madurez",
      subtitle: "Agentes IA seleccionados para mejorar tus áreas más débiles",
      count: "recomendaciones"
    }
  };

  const t = translations[language];

  if (agents.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-400/20 rounded-xl hover:from-yellow-500/15 hover:to-orange-500/15 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white mb-1">{t.title}</h3>
              <p className="text-yellow-200 text-sm">
                {t.subtitle} • {agents.length} {t.count}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-6 h-6 text-yellow-300 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map(agent => (
            <MediumAgentCard
              key={agent.id}
              agent={agent}
              onEnable={onEnableAgent}
              language={language}
              isRecommended={true}
              recommendationReason={getAgentRecommendationReason(agent.id, maturityScores)}
              isToggling={togglingAgents.has(agent.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
