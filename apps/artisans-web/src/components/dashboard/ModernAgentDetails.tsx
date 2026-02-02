
import React from 'react';
import { DashboardAgentDetails } from './DashboardAgentDetails';

interface ModernAgentDetailsProps {
  agentId: string;
  language: 'en' | 'es';
}

export const ModernAgentDetails: React.FC<ModernAgentDetailsProps> = ({ 
  agentId, 
  language 
}) => {
  // This component now just redirects to the new modern interface
  // We'll handle the onBack through the parent component
  return (
    <div className="text-center text-white p-8">
      <p>Use the new DashboardAgentDetails component instead</p>
    </div>
  );
};
