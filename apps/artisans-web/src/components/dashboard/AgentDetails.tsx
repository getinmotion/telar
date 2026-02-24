
import React from 'react';
import { ModernAgentDetails } from './ModernAgentDetails';

interface AgentDetailsProps {
  agentId: string;
  language: 'en' | 'es';
}

export const AgentDetails: React.FC<AgentDetailsProps> = ({ agentId, language }) => {
  return <ModernAgentDetails agentId={agentId} language={language} />;
};
