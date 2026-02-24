
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock } from 'lucide-react';
import { getAgentTranslation } from '@/data/agentTranslations';

interface MediumAgentCardProps {
  agent: {
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    isEnabled: boolean;
    usageCount: number;
    lastUsed: string | null;
  };
  onEnable: (agentId: string) => void;
  language: 'en' | 'es';
  isRecommended?: boolean;
  recommendationReason?: string;
  isToggling?: boolean;
}

export const MediumAgentCard: React.FC<MediumAgentCardProps> = ({
  agent,
  onEnable,
  language,
  isRecommended = false,
  recommendationReason,
  isToggling = false
}) => {
  const translations = {
    en: {
      enable: "Enable",
      inactive: "Inactive",
      uses: "uses",
      lastUsed: "Last used",
      never: "Never",
      recommended: "Recommended"
    },
    es: {
      enable: "Habilitar",
      inactive: "Inactivo", 
      uses: "usos",
      lastUsed: "Último uso",
      never: "Nunca",
      recommended: "Recomendado"
    }
  };

  const t = translations[language];
  const agentTranslation = getAgentTranslation(agent.id, language);

  const formatLastUsed = (lastUsed: string | null) => {
    if (!lastUsed) return t.never;
    
    const date = new Date(lastUsed);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`group relative bg-white/8 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/12 transition-all duration-300 hover:scale-102 hover:shadow-xl min-h-[180px] ${
      !agent.isEnabled ? 'opacity-70' : ''
    }`}>
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="recommended">
            {t.recommended}
          </Badge>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-lg shadow-lg flex-shrink-0 text-primary-foreground">
            {agent.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white text-base group-hover:text-purple-200 transition-colors leading-tight mb-2">
              {agentTranslation.name}
            </h4>
            <p className="text-purple-200 text-sm line-clamp-3 leading-relaxed">
              {agentTranslation.description}
            </p>
          </div>
        </div>
      </div>

      {recommendationReason && (
        <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
          <p className="text-yellow-200 text-xs leading-relaxed">{recommendationReason}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-300 mb-5">
        <Badge className={`text-xs ${
          agent.isEnabled 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
            : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
        }`}>
          {agent.isEnabled ? `${agent.usageCount} ${t.uses}` : t.inactive}
        </Badge>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{t.lastUsed}: {formatLastUsed(agent.lastUsed)}</span>
        </div>
      </div>

      {!agent.isEnabled && (
        <Button 
          onClick={() => onEnable(agent.id)}
          variant="success"
          className="w-full rounded-lg font-medium transition-all duration-200 hover:scale-105"
          size="sm"
          disabled={isToggling}
        >
          <Play className="w-4 h-4 mr-2" />
          {t.enable}
        </Button>
      )}
    </div>
  );
};
