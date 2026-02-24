
import { useState, useCallback } from 'react';

export const useAgentToggle = (onAgentToggle: (agentId: string, enabled: boolean) => Promise<void>) => {
  const [togglingAgents, setTogglingAgents] = useState<Set<string>>(new Set());

  const isToggling = useCallback((agentId: string) => {
    return togglingAgents.has(agentId);
  }, [togglingAgents]);

  const handleToggleAgent = useCallback(async (agentId: string, currentEnabled: boolean) => {
    setTogglingAgents(prev => new Set(prev).add(agentId));
    
    try {
      await onAgentToggle(agentId, !currentEnabled);
    } catch (error) {
      console.error('Error toggling agent:', error);
    } finally {
      setTogglingAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    }
  }, [onAgentToggle]);

  return {
    togglingAgents,
    isToggling,
    handleToggleAgent
  };
};
