import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedProgress, Milestone } from '@/types/unifiedProgress';
import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { MilestoneProgressCard } from './MilestoneProgressCard';
import { BarChart3 } from 'lucide-react';
import { MILESTONE_DISPLAY_CONFIG } from '@/config/systemConfig';
import { isAllowedAgent } from '@/config/allowedAgents';

interface MilestoneProgressDashboardProps {
  unifiedProgress: UnifiedProgress;
  tasks: AgentTask[];
}

// Using centralized milestone configuration from systemConfig

export const MilestoneProgressDashboard: React.FC<MilestoneProgressDashboardProps> = ({
  unifiedProgress,
  tasks
}) => {
  const milestoneOrder: Array<keyof typeof unifiedProgress.milestones> = [
    'formalization', 'brand', 'shop', 'sales', 'community'
  ];

  const enrichedMilestones = milestoneOrder.map(key => {
    const milestone = unifiedProgress.milestones[key];
    const displayConfig = MILESTONE_DISPLAY_CONFIG[key];
    
    return {
      ...milestone,
      icon: displayConfig.icon,
      color: displayConfig.color
    };
  });

  const getMilestoneTasks = (milestoneId: string) => {
    return tasks.filter(task => {
      // Filter by allowed agents only
      if (!isAllowedAgent(task.agent_id)) {
        return false;
      }
      
      return task.milestone_category === milestoneId ||
        (unifiedProgress.milestones[milestoneId as keyof typeof unifiedProgress.milestones]?.actions || [])
          .some(action => action.id === task.agent_id);
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <BarChart3 className="w-7 h-7 text-primary" />
          Progreso Detallado por Hito
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Monitorea tu avance en cada etapa del Camino del Artesano
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {enrichedMilestones.map(milestone => (
            <MilestoneProgressCard
              key={milestone.id}
              milestone={milestone}
              tasks={getMilestoneTasks(milestone.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
