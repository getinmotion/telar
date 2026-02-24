
import React from 'react';
import { useAgentDeliverables } from '@/hooks/useAgentDeliverables';
import { DeliverablesHeader } from './DeliverablesHeader';
import { DeliverablesEmptyState } from './DeliverablesEmptyState';
import { DeliverableCard } from './DeliverableCard';

interface AgentDeliverablesManagerProps {
  agentId: string;
  language: 'en' | 'es';
}

export const AgentDeliverablesManager: React.FC<AgentDeliverablesManagerProps> = ({
  agentId,
  language
}) => {
  const { deliverables, loading } = useAgentDeliverables(agentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DeliverablesHeader language={language} count={deliverables.length} />

      {deliverables.length === 0 ? (
        <DeliverablesEmptyState language={language} />
      ) : (
        <div className="space-y-3">
          {deliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable.id}
              deliverable={deliverable}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  );
};
