import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Milestone } from '@/types/unifiedProgress';
import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { MILESTONE_CATEGORIES } from '@/utils/milestoneAgentMapping';
import { IntelligentBrandWizard } from '@/components/brand/IntelligentBrandWizard';
import { Lightbulb, ChevronRight, Target, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAgentDisplayInfo, isAllowedAgent, normalizeAgentId } from '@/config/allowedAgents';
import { SystemIcon } from '@/components/ui/SystemIcon';

interface MilestoneProgressCardProps {
  milestone: Milestone & { icon: string; color: string };
  tasks: AgentTask[];
}

const getAgentInfo = (agentId: string) => {
  return getAgentDisplayInfo(agentId);
};

const calculateTimeSpent = (tasks: AgentTask[]) => {
  const totalSeconds = tasks.reduce((acc, task) => {
    return acc + (task.time_spent || 0);
  }, 0);
  return (totalSeconds / 3600).toFixed(1); // Convert to hours
};

const getAgentBreakdown = (milestone: Milestone, tasks: AgentTask[]) => {
  // Filter tasks to only include allowed agents (including legacy)
  const allowedTasks = tasks.filter(t => {
    const normalized = normalizeAgentId(t.agent_id);
    return normalized !== null;
  });
  
  // Group by normalized agent
  const agentMap = new Map<string, { tasks: AgentTask[]; info: ReturnType<typeof getAgentInfo> }>();
  
  allowedTasks.forEach(task => {
    const normalizedId = normalizeAgentId(task.agent_id)!;
    
    if (!agentMap.has(normalizedId)) {
      agentMap.set(normalizedId, {
        tasks: [],
        info: getAgentInfo(normalizedId)
      });
    }
    agentMap.get(normalizedId)!.tasks.push(task);
  });

  return Array.from(agentMap.entries()).map(([agentId, { tasks, info }]) => ({
    id: agentId,
    name: info.name,
    icon: info.icon,
    color: info.color,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length
  }));
};

const getNextSteps = (milestone: Milestone) => {
  if (milestone.progress < 30) {
    return [
      { id: '1', title: 'Completa las tareas básicas de configuración' },
      { id: '2', title: 'Explora las misiones disponibles para este hito' }
    ];
  } else if (milestone.progress < 70) {
    return [
      { id: '3', title: 'Enfócate en las tareas de alta prioridad' },
      { id: '4', title: 'Revisa los recursos disponibles para este hito' }
    ];
  } else if (milestone.progress < 100) {
    return [
      { id: '5', title: '¡Ya casi terminas! Completa las tareas restantes' }
    ];
  } else {
    return [
      { id: '6', title: 'Perfecto! Este hito está completado. Continúa con el siguiente.' }
    ];
  }
};

export const MilestoneProgressCard: React.FC<MilestoneProgressCardProps> = ({
  milestone,
  tasks
}) => {
  const [showBrandWizard, setShowBrandWizard] = useState(false);
  
  const timeSpent = calculateTimeSpent(tasks);
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const agentBreakdown = getAgentBreakdown(milestone, tasks);
  const recommendations = getNextSteps(milestone);

  const isCompleted = milestone.status === 'completed';
  const isActive = milestone.status === 'active';
  const isLocked = milestone.status === 'locked';
  const isBrandMilestone = milestone.id === 'brand';

  return (
    <Card className={cn(
      "border-2 transition-all duration-300",
      isCompleted && "border-success bg-success/5",
      isActive && "border-primary bg-primary/5",
      isLocked && "border-muted bg-muted/5 opacity-60"
    )}>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SystemIcon name={milestone.icon} className="w-10 h-10 text-primary" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">{milestone.label}</h3>
              <Badge 
                variant={isCompleted ? "default" : isActive ? "secondary" : "outline"}
                className="mt-1"
              >
                {isCompleted && "✓ Completado"}
                {isActive && "En Progreso"}
                {isLocked && "🔒 Bloqueado"}
              </Badge>
            </div>
          </div>
          <span className="text-3xl font-bold text-primary">{milestone.progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={milestone.progress} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {milestone.tasksCompleted} de {milestone.totalTasks} tareas completadas
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 text-center py-4 bg-background/50 rounded-lg">
          <div>
            <div className="text-2xl font-bold text-primary">{milestone.tasksCompleted}</div>
            <div className="text-xs text-muted-foreground">Completadas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{timeSpent}h</div>
            <div className="text-xs text-muted-foreground">Tiempo Invertido</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">{tasksInProgress}</div>
            <div className="text-xs text-muted-foreground">En Progreso</div>
          </div>
        </div>

        {/* Progress Breakdown */}
        {agentBreakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4" />
              Progreso de Tareas
            </h4>
            <div className="space-y-2">
              {agentBreakdown.map(area => (
                <div key={area.id} className="flex justify-between items-center gap-3 text-sm bg-background/50 p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{area.icon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn("font-semibold", area.color)}
                    >
                      {area.completedTasks}/{area.totalTasks} completadas
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps Recommendations */}
        {recommendations.length > 0 && !isLocked && (
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Lightbulb className="w-4 h-4 text-primary" />
              Próximos Pasos Recomendados
            </h4>
            <ul className="space-y-2">
              {recommendations.map(rec => (
                <li key={rec.id} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{rec.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button - Circular CTA */}
        {isActive && isBrandMilestone && (
          <div className="flex items-center justify-end gap-3 mt-4">
            <span className="text-sm font-medium text-foreground">
              Crear/Mejorar Marca
            </span>
            <button 
              onClick={() => setShowBrandWizard(true)}
              className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center hover:bg-foreground/90 transition-colors shadow-lg"
            >
              <ArrowRight className="w-5 h-5 text-background" />
            </button>
          </div>
        )}

        {isLocked && (
          <p className="text-sm text-center text-muted-foreground">
            Completa los hitos anteriores para desbloquear este
          </p>
        )}
      </div>
      
      {/* Brand Wizard Modal */}
      {isBrandMilestone && (
        <Dialog open={showBrandWizard} onOpenChange={setShowBrandWizard}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <IntelligentBrandWizard />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
