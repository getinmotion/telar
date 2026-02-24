
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Agent, RecommendedAgents } from '@/types/dashboard';
import { getAgentTranslation } from '@/data/agentTranslations';
import { Bot, MessageCircle, Play, Pause, Settings } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

interface RecommendedAgentsSectionProps {
  agents: Agent[];
  recommendedAgents: RecommendedAgents;
  onSelectAgent: (id: string) => void;
}

export const RecommendedAgentsSection: React.FC<RecommendedAgentsSectionProps> = ({
  agents,
  recommendedAgents,
  onSelectAgent
}) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);

  // Filter agents based on recommendations
  const getFilteredAgents = (agentList: string[] | undefined) => {
    if (!agentList) return [];
    return agents.filter(agent => agentList.includes(agent.id));
  };

  const primaryAgents = getFilteredAgents(recommendedAgents.primary);
  const secondaryAgents = getFilteredAgents(recommendedAgents.secondary);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      default: return <Settings className="w-3 h-3" />;
    }
  };

  const AgentCard = ({ agent }: { agent: Agent }) => {
    const agentTranslation = getAgentTranslation(agent.id, compatibleLanguage);
    
    return (
      <Card className="hover:shadow-md transition-all duration-200 border-purple-100">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${agent.color} flex items-center justify-center text-lg`}>
                {agent.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{agentTranslation.name}</h3>
                <p className="text-sm text-gray-500">{agent.category}</p>
              </div>
            </div>
            <Badge className={`text-xs ${getStatusColor(agent.status)} flex items-center gap-1`}>
              {getStatusIcon(agent.status)}
              {t.recommendedAgents[agent.status as keyof typeof t.recommendedAgents] || agent.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>{agent.activeTasks} {t.recommendedAgents.activeTasks}</span>
            <span>{t.recommendedAgents.lastUsed}: {agent.lastUsed || t.recommendedAgents.never}</span>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => onSelectAgent(agent.id)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex items-center gap-2"
              size="sm"
            >
              <MessageCircle className="w-4 h-4" />
              {t.recommendedAgents.chatWith}
            </Button>
            <Button variant="outline" size="sm" className="border-purple-200">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-purple-900">{t.recommendedAgents.recommendedAgents}</h2>
      </div>

      {primaryAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.recommendedAgents.primaryAgents}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {primaryAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {secondaryAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.recommendedAgents.secondaryAgents}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {secondaryAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
