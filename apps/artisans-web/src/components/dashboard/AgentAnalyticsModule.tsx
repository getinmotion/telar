
import React from 'react';
import { AgentProductivityOverview } from './AgentProductivityOverview';
import { AgentRecentActivity } from './AgentRecentActivity';

interface Conversation {
  id: string;
  title?: string;
  updated_at: string;
}

interface AgentAnalyticsModuleProps {
  language: 'en' | 'es';
  conversations: Conversation[];
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export const AgentAnalyticsModule: React.FC<AgentAnalyticsModuleProps> = ({
  language,
  conversations,
  pendingTasks,
  inProgressTasks,
  completedTasks
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AgentProductivityOverview
        language={language}
        pendingTasks={pendingTasks}
        inProgressTasks={inProgressTasks}
        completedTasks={completedTasks}
      />
      <AgentRecentActivity
        language={language}
        conversations={conversations}
      />
    </div>
  );
};
