
import { CulturalAgent } from '@/data/agentsDatabase';
import { AgentFilter, GroupedAgents } from '@/types/agentTypes';

export const RECOMMENDED_AGENT_IDS = [
  'cultural-consultant',
  'project-manager', 
  'cost-calculator',
  'content-creator',
  'collaboration-agreement',
  'export-advisor',
  'stakeholder-matching'
];

export const isAgentRecommended = (agentId: string): boolean => {
  return RECOMMENDED_AGENT_IDS.includes(agentId);
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'Alta': return 'bg-red-50 text-red-700 border-red-200';
    case 'Media-Alta': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Media': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Baja': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Muy Baja': return 'bg-gray-50 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const getImpactColor = (impact: number): string => {
  switch (impact) {
    case 4: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 3: return 'bg-green-50 text-green-700 border-green-200';
    case 2: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 1: return 'bg-gray-50 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const formatLastUsed = (lastUsed: string | null, translations: any): string => {
  if (!lastUsed) return translations.never;
  
  const date = new Date(lastUsed);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Hace unos minutos';
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`;
  return date.toLocaleDateString();
};

export const filterAgents = (
  agents: CulturalAgent[],
  filters: AgentFilter,
  getUserAgentData: (agentId: string) => any
): CulturalAgent[] => {
  let filteredAgents = [...agents];

  // Search filter
  if (filters.searchTerm) {
    filteredAgents = filteredAgents.filter(agent =>
      agent.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      agent.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
    );
  }

  // Category filter
  if (filters.selectedCategories.length > 0) {
    filteredAgents = filteredAgents.filter(agent =>
      filters.selectedCategories.includes(agent.category)
    );
  }

  // Status filter
  if (filters.selectedStatus !== 'all') {
    filteredAgents = filteredAgents.filter(agent => {
      const userAgent = getUserAgentData(agent.id);
      const isEnabled = Boolean(userAgent?.is_enabled);
      const isRecommended = isAgentRecommended(agent.id);
      
      switch (filters.selectedStatus) {
        case 'active': return isEnabled;
        case 'inactive': return !isEnabled;
        case 'recommended': return isRecommended;
        default: return true;
      }
    });
  }

  // Priority filter
  if (filters.selectedPriority !== 'all') {
    filteredAgents = filteredAgents.filter(agent => 
      agent.priority === filters.selectedPriority
    );
  }

  // Impact filter
  if (filters.selectedImpact !== 'all' && filters.selectedImpact !== null) {
    filteredAgents = filteredAgents.filter(agent => 
      agent.impact === filters.selectedImpact
    );
  }

  return filteredAgents;
};

export const sortAgents = (
  agents: CulturalAgent[],
  sortBy: string,
  getUserAgentData: (agentId: string) => any
): CulturalAgent[] => {
  return [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        const usageA = getUserAgentData(a.id)?.usage_count || 0;
        const usageB = getUserAgentData(b.id)?.usage_count || 0;
        return usageB - usageA;
      case 'impact':
        return b.impact - a.impact;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
};

export const groupAgentsByCategory = (agents: CulturalAgent[]): GroupedAgents => {
  return agents.reduce((groups, agent) => {
    if (!groups[agent.category]) {
      groups[agent.category] = [];
    }
    groups[agent.category].push(agent);
    return groups;
  }, {} as GroupedAgents);
};
