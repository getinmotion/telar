import React, { useEffect, useMemo } from 'react';
import { Agent, RecommendedAgents, CategoryScore } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, Play, Pause, Zap, Clock, Loader2 } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';
import { getAgentTranslation } from '@/data/agentTranslations';
import { CollapsibleAgentsSection } from './CollapsibleAgentsSection';
import { CollapsibleRecommendationsSection } from './CollapsibleRecommendationsSection';
import { useAgentToggle } from '@/hooks/useAgentToggle';
import { useRealtimeAgents } from '@/hooks/useRealtimeAgents';
import { AgentIcon } from './AgentIcon';

interface ModernAgentsGridProps {
  agents: Agent[];
  recommendedAgents: RecommendedAgents;
  maturityScores: CategoryScore | null;
  onSelectAgent: (id: string) => void;
  language: 'en' | 'es';
}

export const ModernAgentsGrid: React.FC<ModernAgentsGridProps> = ({
  agents,
  recommendedAgents,
  maturityScores,
  onSelectAgent,
  language
}) => {
  const { agents: userAgents, trackAgentUsage, enableAgent, disableAgent, loading, refetch } = useUserData();
  
  // Real-time updates
  useRealtimeAgents({ onAgentChange: refetch });
  
  // Use the toggle hook
  const { togglingAgents, handleToggleAgent } = useAgentToggle(async (agentId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enableAgent(agentId);
      } else {
        await disableAgent(agentId);
      }
      await refetch();
    } catch (error) {
      console.error('Error toggling agent:', error);
      throw error;
    }
  });

  const translations = {
    en: {
      yourAgents: "Your Active Agents",
      chatWith: "Chat",
      active: "Active",
      inactive: "Inactive",
      activeTasks: "uses",
      lastUsed: "Last used",
      never: "Never",
      justEnabled: "Just enabled",
      enabling: "Enabling...",
      disabling: "Disabling...",
      enable: "Enable",
      recommended: "Recommended"
    },
    es: {
      yourAgents: "Tus Agentes Activos",
      chatWith: "Chatear",
      active: "Activo",
      inactive: "Inactivo",
      activeTasks: "usos",
      lastUsed: "Último uso",
      never: "Nunca",
      justEnabled: "Recién habilitado",
      enabling: "Habilitando...",
      disabling: "Deshabilitando...",
      enable: "Habilitar",
      recommended: "Recomendado"
    }
  };

  const t = translations[language];

  // Merge agent data with user configuration
  const getMergedAgentData = (agentId: string) => {
    const agentConfig = userAgents.find(ua => ua.agent_id === agentId);
    const agentInfo = culturalAgentsDatabase.find(a => a.id === agentId);
    const agentTranslation = getAgentTranslation(agentId, language);
    
    return {
      id: agentId,
      name: agentTranslation.name,
      category: agentInfo?.category || 'General',
      icon: agentInfo?.icon || '🤖',
      color: agentInfo?.color || 'bg-purple-500',
      isEnabled: agentConfig?.is_enabled || false,
      usageCount: agentConfig?.usage_count || 0,
      lastUsed: agentConfig?.last_used_at,
      priority: agentInfo?.priority || 'Media',
      isRecentlyEnabled: agentConfig && new Date(agentConfig.updated_at).getTime() > Date.now() - 10000
    };
  };

  // Filter and categorize agents
  const categorizedAgents = useMemo(() => {
    const allAgents = culturalAgentsDatabase.map(agent => getMergedAgentData(agent.id));
    
    const activeAgents = allAgents.filter(agent => agent.isEnabled);
    const inactiveAgents = allAgents.filter(agent => !agent.isEnabled);
    
    // Use actual recommendations from props
    const primaryRecommended = (recommendedAgents.primary || [])
      .map(getMergedAgentData)
      .filter(agent => !agent.isEnabled);
    
    const secondaryRecommended = (recommendedAgents.secondary || [])
      .map(getMergedAgentData)
      .filter(agent => !agent.isEnabled);

    const otherInactive = inactiveAgents.filter(agent => 
      !recommendedAgents.primary?.includes(agent.id) && 
      !recommendedAgents.secondary?.includes(agent.id)
    );

    return {
      active: activeAgents,
      primaryRecommended,
      secondaryRecommended,
      otherInactive,
      allInactive: [...primaryRecommended, ...secondaryRecommended, ...otherInactive]
    };
  }, [userAgents, recommendedAgents, language]);

  const handleAgentClick = async (agentId: string) => {
    try {
      console.log('Clicking agent:', agentId);
      await trackAgentUsage(agentId);
      onSelectAgent(agentId);
    } catch (error) {
      console.error('Error tracking agent usage:', error);
      onSelectAgent(agentId);
    }
  };

  const handleEnableAgent = async (agentId: string) => {
    await handleToggleAgent(agentId, false);
  };

  const handleDisableAgent = async (agentId: string) => {
    await handleToggleAgent(agentId, true);
  };

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

  const ModernAgentCard = ({ agent, isRecommended = false }: { 
    agent: ReturnType<typeof getMergedAgentData>; 
    isRecommended?: boolean;
  }) => {
    const isToggling = togglingAgents.has(agent.id);
    
    return (
      <div className={`group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[200px] ${
        agent.isRecentlyEnabled ? 'ring-2 ring-green-400 shadow-green-400/20' : ''
      }`}>
        {isRecommended && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge variant="recommended">
              <Zap className="w-3 h-3 mr-1" />
              {t.recommended}
            </Badge>
          </div>
        )}
        
        {agent.isRecentlyEnabled && (
          <div className="absolute -top-2 -left-2 z-10">
            <Badge variant="success" className="animate-pulse">
              {t.justEnabled}
            </Badge>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0 text-primary-foreground">
              <AgentIcon icon={agent.icon} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-lg group-hover:text-purple-200 transition-colors leading-tight mb-2">
                {agent.name}
              </h3>
              <p className="text-purple-200 text-sm line-clamp-3 leading-relaxed">
                {getAgentTranslation(agent.id, language).description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-300 mb-6">
          <span className="bg-white/10 px-2 py-1 rounded-md">{agent.usageCount} {t.activeTasks}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatLastUsed(agent.lastUsed)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={`text-xs flex items-center gap-1 ${
            agent.isEnabled 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
          }`}>
            {agent.isEnabled ? (
              <>
                <Play className="w-3 h-3" />
                {t.active}
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                {t.inactive}
              </>
            )}
          </Badge>
        </div>

        <div className="flex gap-3 mt-4">
          {agent.isEnabled ? (
            <>
              <Button 
                onClick={() => handleAgentClick(agent.id)}
                variant="premium"
                className="flex-1 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                size="sm"
                disabled={loading || isToggling}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t.chatWith}
              </Button>
              <Button 
                onClick={() => handleDisableAgent(agent.id)}
                variant="outline" 
                size="sm" 
                className="border-red-400/30 text-red-300 hover:bg-red-500/10 rounded-xl"
                disabled={isToggling}
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => handleEnableAgent(agent.id)}
              variant="success"
              className="flex-1 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              size="sm"
              disabled={isToggling}
            >
              {isToggling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.enabling}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t.enable}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-400" />
          <div className="h-8 bg-white/20 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white/10 rounded-2xl p-6 animate-pulse">
              <div className="h-32 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold text-white">{t.yourAgents}</h2>
        {categorizedAgents.active.length > 0 && (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
            {categorizedAgents.active.length} activo{categorizedAgents.active.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Active Agents */}
      {categorizedAgents.active.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categorizedAgents.active.map(agent => (
              <ModernAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* Primary Recommendations - Collapsible */}
      {categorizedAgents.primaryRecommended.length > 0 && maturityScores && (
        <CollapsibleRecommendationsSection
          agents={categorizedAgents.primaryRecommended}
          maturityScores={maturityScores}
          onEnableAgent={handleEnableAgent}
          togglingAgents={togglingAgents}
          language={language}
        />
      )}

      {/* Collapsible Available Agents Section */}
      {categorizedAgents.allInactive.length > 0 && (
        <CollapsibleAgentsSection
          agents={categorizedAgents.allInactive}
          onEnableAgent={handleEnableAgent}
          language={language}
        />
      )}

      {/* Empty state */}
      {categorizedAgents.active.length === 0 && categorizedAgents.allInactive.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No agents available</h3>
          <p className="text-purple-200">Complete the onboarding to get your recommended agents</p>
        </div>
      )}
    </div>
  );
};
