import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CulturalAgent } from '@/data/agentsDatabase';
import { getAgentTranslation } from '@/data/agentTranslations';
import { 
  Loader2, 
  Star, 
  Users, 
  CheckCircle,
  Circle
} from 'lucide-react';
import { AgentIcon } from './AgentIcon';

interface OptimizedAgentCategoryCardProps {
  category: string;
  categoryName: string;
  agents: CulturalAgent[];
  activeCount: number;
  totalCount: number;
  recommendedCount: number;
  getUserAgentData: (agentId: string) => any;
  isAgentRecommended: (agentId: string) => boolean;
  onToggleAgent: (agentId: string, enabled: boolean) => Promise<void>;
  togglingAgents: Set<string>;
  language: 'en' | 'es';
}

export const OptimizedAgentCategoryCard: React.FC<OptimizedAgentCategoryCardProps> = ({
  category,
  categoryName,
  agents,
  activeCount,
  totalCount,
  recommendedCount,
  getUserAgentData,
  isAgentRecommended,
  onToggleAgent,
  togglingAgents,
  language
}) => {
  const t = {
    en: {
      recommended: "Recommended",
      activate: "Activate",
      deactivate: "Deactivate"
    },
    es: {
      recommended: "Recomendado",
      activate: "Activar",
      deactivate: "Desactivar"
    }
  };

  // Enhanced category translations
  const categoryTranslations = {
    en: {
      'Financiera': 'Financial',
      'Legal': 'Legal',
      'Diagnóstico': 'Diagnostic',
      'Comercial': 'Commercial',
      'Operativo': 'Operational',
      'Comunidad': 'Community',
      'Financial': 'Financial',
      'Diagnostic': 'Diagnostic',
      'Commercial': 'Commercial',
      'Operational': 'Operational',
      'Community': 'Community'
    },
    es: {
      'Financiera': 'Financiera',
      'Legal': 'Legal',
      'Diagnóstico': 'Diagnóstico',
      'Comercial': 'Comercial',
      'Operativo': 'Operativo',
      'Comunidad': 'Comunidad',
      'Financial': 'Financiera',
      'Diagnostic': 'Diagnóstico',
      'Commercial': 'Comercial',
      'Operational': 'Operativo',
      'Community': 'Comunidad'
    }
  };

  const translatedCategoryName = categoryTranslations[language][categoryName as keyof typeof categoryTranslations[typeof language]] || categoryName;

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/15">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-bold text-white">
            {translatedCategoryName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {recommendedCount > 0 && (
              <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 text-xs">
                <Star className="w-3 h-3 mr-1" />
                {recommendedCount}
              </Badge>
            )}
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
              <Users className="w-3 h-3 mr-1" />
              {activeCount}/{totalCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {agents.map((agent) => {
          const userAgentData = getUserAgentData(agent.id);
          const isEnabled = Boolean(userAgentData?.is_enabled);
          const isRecommended = isAgentRecommended(agent.id);
          const isToggling = togglingAgents.has(agent.id);
          const translation = getAgentTranslation(agent.id, language);

          return (
            <div
              key={agent.id}
              id={`agent-${agent.id}`}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                isEnabled 
                  ? 'bg-purple-500/20 border-purple-400/40' 
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="space-y-2">
                {/* Header with icon and title */}
                <div className="flex items-start gap-2">
                  <AgentIcon icon={agent.icon} className="text-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm leading-tight">
                      {translation.name}
                    </h4>
                    {isRecommended && (
                      <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 text-xs mt-1">
                        <Star className="w-2 h-2 mr-1" />
                        {t[language].recommended}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description - more compact */}
                <p className="text-purple-200 text-xs leading-relaxed line-clamp-2">
                  {translation.description}
                </p>

                {/* Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {isEnabled ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-400" />
                    )}
                    <span className="text-xs text-purple-200">
                      {isEnabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    ) : (
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => onToggleAgent(agent.id, checked)}
                        className="data-[state=checked]:bg-purple-600 scale-75"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
