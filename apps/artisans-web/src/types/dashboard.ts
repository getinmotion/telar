
import { ReactNode } from 'react';

export type AgentStatus = 'active' | 'paused' | 'inactive';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  category: string;
  activeTasks: number;
  lastUsed?: string;
  color: string;
  icon: ReactNode;
}

export type ProfileType = 'idea' | 'solo' | 'team';

export type CategoryScore = {
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
};

// Enhanced RecommendedAgents interface to support both formats
export interface RecommendedAgents {
  // New format (primary)
  primary?: string[];
  secondary?: string[];
  
  // Legacy format (for backward compatibility)
  admin?: boolean;
  accounting?: boolean;
  legal?: boolean;
  operations?: boolean;
  cultural?: boolean;
  extended?: RecommendedAgents;
}
