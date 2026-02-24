
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

interface AgentCategoryCardProps {
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

export const AgentCategoryCard: React.FC<AgentCategoryCardProps> = ({
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
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/15 h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-bold text-white">
            {translatedCategoryName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {recommendedCount > 0 && (
              <Badge className="bg-warning/20 text-warning-foreground border-warning/30">
                <Star className="w-3 h-3 mr-1" />
                {recommendedCount}
              </Badge>
            )}
            <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
              <Users className="w-3 h-3 mr-1" />
              {activeCount}/{totalCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {agents.map((agent) => {
          const userAgentData = getUserAgentData(agent.id);
          const isEnabled = Boolean(userAgentData?.is_enabled);
          const isRecommended = isAgentRecommended(agent.id);
          const isToggling = togglingAgents.has(agent.id);
          const translation = getAgentTranslation(agent.id, language);

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isEnabled 
                  ? 'bg-accent/20 border-accent/40 shadow-lg' 
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="space-y-3">
                {/* Header with icon and title */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-lg leading-tight">
                      {translation.name}
                    </h4>
                  </div>
                </div>

                {/* Recommended badge */}
                {isRecommended && (
                  <div>
                    <Badge className="bg-warning/20 text-warning-foreground border-warning/30 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {t[language].recommended}
                    </Badge>
                  </div>
                )}

                {/* Description */}
                <p className="text-accent-foreground/70 text-sm leading-relaxed">
                  {translation.description}
                </p>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {isEnabled ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-accent-foreground/70">
                      {isEnabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    ) : (
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => onToggleAgent(agent.id, checked)}
                        className="data-[state=checked]:bg-accent"
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
