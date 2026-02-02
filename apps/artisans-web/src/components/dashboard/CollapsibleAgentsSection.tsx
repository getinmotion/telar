
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Bot } from 'lucide-react';
import { CompactAgentCard } from './CompactAgentCard';

interface CollapsibleAgentsSectionProps {
  agents: Array<{
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    isEnabled: boolean;
    usageCount: number;
  }>;
  onEnableAgent: (agentId: string) => void;
  language: 'en' | 'es';
}

export const CollapsibleAgentsSection: React.FC<CollapsibleAgentsSectionProps> = ({
  agents,
  onEnableAgent,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    en: {
      title: "All Available Agents",
      subtitle: "Explore and activate additional agents",
      count: "agents available"
    },
    es: {
      title: "Todos los Agentes Disponibles",
      subtitle: "Explora y activa agentes adicionales",
      count: "agentes disponibles"
    }
  };

  const t = translations[language];

  if (agents.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-1">{t.title}</h3>
              <p className="text-muted-foreground text-sm">
                {t.subtitle} • {agents.length} {t.count}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map(agent => (
            <CompactAgentCard
              key={agent.id}
              agent={agent}
              onEnable={onEnableAgent}
              language={language}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
