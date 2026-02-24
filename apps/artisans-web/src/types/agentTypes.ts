
export interface AgentFilter {
  searchTerm: string;
  selectedCategories: string[];
  selectedStatus: 'all' | 'active' | 'inactive' | 'recommended';
  selectedPriority: 'all' | 'Alta' | 'Media' | 'Baja';
  selectedImpact: 'all' | number | null;
  sortBy: 'name' | 'usage' | 'impact';
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  recommendedAgents: number;
  efficiencyRate: number;
}

export interface AgentToggleState {
  togglingAgents: Set<string>;
  isToggling: (agentId: string) => boolean;
  startToggle: (agentId: string) => void;
  endToggle: (agentId: string) => void;
}

// Remove FilteredAgent interface since we'll use CulturalAgent directly
export interface GroupedAgents {
  [category: string]: import('@/data/agentsDatabase').CulturalAgent[];
}
