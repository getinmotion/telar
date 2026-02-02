
import { useState, useCallback, useMemo } from 'react';
import { CulturalAgent } from '@/data/agentsDatabase';
import { AgentFilter } from '@/types/agentTypes';
import { filterAgents, sortAgents, groupAgentsByCategory } from '@/utils/agentUtils';

const initialFilters: AgentFilter = {
  searchTerm: '',
  selectedCategories: [],
  selectedStatus: 'all',
  selectedPriority: 'all',
  selectedImpact: 'all',
  sortBy: 'name'
};

export const useAgentFilters = (
  agents: CulturalAgent[],
  getUserAgentData: (agentId: string) => any
) => {
  const [filters, setFilters] = useState<AgentFilter>(initialFilters);

  const updateFilter = useCallback((key: keyof AgentFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  }, []);

  const filteredAndGroupedAgents = useMemo(() => {
    const filtered = filterAgents(agents, filters, getUserAgentData);
    const sorted = sortAgents(filtered, filters.sortBy, getUserAgentData);
    return groupAgentsByCategory(sorted);
  }, [agents, filters, getUserAgentData]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.searchTerm ||
      filters.selectedCategories.length > 0 ||
      filters.selectedStatus !== 'all' ||
      filters.selectedPriority !== 'all' ||
      filters.selectedImpact !== 'all' ||
      filters.sortBy !== 'name'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    toggleCategory,
    filteredAndGroupedAgents,
    hasActiveFilters
  };
};
