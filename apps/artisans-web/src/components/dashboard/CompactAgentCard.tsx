
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAgentTranslation } from '@/data/agentTranslations';
import { Play } from 'lucide-react';

interface CompactAgentCardProps {
  agent: {
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    isEnabled: boolean;
    usageCount: number;
  };
  onEnable: (agentId: string) => void;
  language: 'en' | 'es';
}

export const CompactAgentCard: React.FC<CompactAgentCardProps> = ({
  agent,
  onEnable,
  language
}) => {
  const translations = {
    en: {
      enable: "Enable",
      inactive: "Inactive"
    },
    es: {
      enable: "Habilitar",
      inactive: "Inactivo"
    }
  };

  const t = translations[language];
  const agentTranslation = getAgentTranslation(agent.id, language);

  return (
    <div className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300 ${
      !agent.isEnabled ? 'opacity-60' : ''
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-sm">
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">
            {agentTranslation.name}
          </h4>
          <p className="text-muted-foreground text-xs">{agent.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${
            agent.isEnabled 
              ? 'bg-success/20 text-success border-success/30'
              : 'bg-muted/20 text-muted-foreground border-muted/30'
          }`}>
            {agent.isEnabled ? agent.usageCount : t.inactive}
          </Badge>
          {!agent.isEnabled && (
            <Button 
              onClick={() => onEnable(agent.id)}
              size="sm"
              className="h-6 px-2 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white border-0 text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              {t.enable}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
