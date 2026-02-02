
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, Play, Pause, Zap, Clock, Loader2 } from 'lucide-react';
import { SafeAgentIcon } from './SafeAgentIcon';
import { simpleAgentsDatabase } from '@/data/simplifiedAgentsDatabase';
import { useUserData } from '@/hooks/useUserData';

interface RobustModernAgentsGridProps {
  userAgents: Array<{
    agent_id: string;
    is_enabled: boolean;
    usage_count: number;
    last_used_at?: string | null;
  }>;
  maturityScores: any;
  onSelectAgent: (id: string) => void;
  language: 'en' | 'es';
}

export const RobustModernAgentsGrid: React.FC<RobustModernAgentsGridProps> = ({
  userAgents,
  maturityScores,
  onSelectAgent,
  language
}) => {
  const { enableAgent, disableAgent } = useUserData();
  const [togglingAgents, setTogglingAgents] = useState<Set<string>>(new Set());

  const t = {
    en: {
      yourAgents: 'Your Active Agents',
      availableAgents: 'Available Agents',
      chatWith: 'Chat',
      active: 'Active',
      inactive: 'Inactive',
      activeTasks: 'uses',
      lastUsed: 'Last used',
      never: 'Never',
      enabling: 'Enabling...',
      enable: 'Enable',
      recommended: 'Recommended',
      manageAll: 'Manage All Agents'
    },
    es: {
      yourAgents: 'Tus Agentes Activos',
      availableAgents: 'Agentes Disponibles',
      chatWith: 'Chatear',
      active: 'Activo',
      inactive: 'Inactivo',
      activeTasks: 'usos',
      lastUsed: 'Último uso',
      never: 'Nunca',
      enabling: 'Habilitando...',
      enable: 'Habilitar',
      recommended: 'Recomendado',
      manageAll: 'Gestionar Todos los Agentes'
    }
  };

  const handleToggleAgent = async (agentId: string, currentlyEnabled: boolean) => {
    setTogglingAgents(prev => new Set(prev).add(agentId));
    
    try {
      if (currentlyEnabled) {
        await disableAgent(agentId);
      } else {
        await enableAgent(agentId);
      }
    } catch (error) {
      console.error('Error toggling agent:', error);
    } finally {
      setTogglingAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    }
  };

  const formatLastUsed = (lastUsed: string | null) => {
    if (!lastUsed) return t[language].never;
    
    const date = new Date(lastUsed);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  // Get agent data with user configuration
  const getAgentData = (agentId: string) => {
    const agentConfig = userAgents.find(ua => ua.agent_id === agentId);
    const agentInfo = simpleAgentsDatabase.find(a => a.id === agentId);
    
    return {
      id: agentId,
      name: agentInfo?.name || 'Misión Desconocida',
      description: agentInfo?.description || 'Descripción no disponible',
      iconName: agentInfo?.iconName || 'User',
      color: agentInfo?.color || 'bg-purple-500',
      priority: agentInfo?.priority || 2,
      isEnabled: agentConfig?.is_enabled || false,
      usageCount: agentConfig?.usage_count || 0,
      lastUsed: agentConfig?.last_used_at
    };
  };

  // Separate active and available agents
  const allAgents = simpleAgentsDatabase.map(agent => getAgentData(agent.id));
  const activeAgents = allAgents.filter(agent => agent.isEnabled);
  const availableAgents = allAgents.filter(agent => !agent.isEnabled);

  const AgentCard = ({ agent, isRecommended = false }: { 
    agent: ReturnType<typeof getAgentData>; 
    isRecommended?: boolean;
  }) => {
    const isToggling = togglingAgents.has(agent.id);
    
    return (
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 group">
        <CardContent className="p-6">
          {isRecommended && (
            <div className="absolute -top-2 -right-2 z-10">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0 font-medium">
                <Zap className="w-3 h-3 mr-1" />
                {t[language].recommended}
              </Badge>
            </div>
          )}
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`w-12 h-12 ${agent.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                <SafeAgentIcon iconName={agent.iconName} className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-lg group-hover:text-purple-200 transition-colors leading-tight mb-2">
                  {agent.name}
                </h3>
                <p className="text-purple-200 text-sm line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
            <span className="bg-white/10 px-2 py-1 rounded-md">{agent.usageCount} {t[language].activeTasks}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatLastUsed(agent.lastUsed)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Badge className={`text-xs flex items-center gap-1 ${
              agent.isEnabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
            }`}>
              {agent.isEnabled ? (
                <>
                  <Play className="w-3 h-3" />
                  {t[language].active}
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3" />
                  {t[language].inactive}
                </>
              )}
            </Badge>
          </div>

          <div className="flex gap-3">
            {agent.isEnabled ? (
              <>
                <Button 
                  onClick={() => onSelectAgent(agent.id)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t[language].chatWith}
                </Button>
                <Button 
                  onClick={() => handleToggleAgent(agent.id, true)}
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
                onClick={() => handleToggleAgent(agent.id, false)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                size="sm"
                disabled={isToggling}
              >
                {isToggling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t[language].enabling}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {t[language].enable}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white/90 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                {t[language].yourAgents}
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                  {activeAgents.length} activo{activeAgents.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Agents */}
      {availableAgents.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white/90 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              {t[language].availableAgents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableAgents.slice(0, 6).map(agent => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  isRecommended={agent.priority === 1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
