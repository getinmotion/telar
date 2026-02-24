import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle2, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryScore } from '@/types/dashboard';
import { Milestone } from '@/types/unifiedProgress';
import { SystemIcon } from '@/components/ui/SystemIcon';

interface MilestoneDetailPopoverProps {
  milestone: (Milestone & { icon: string; color: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  currentProgress: number;
  maturityScores?: CategoryScore;
}

export const MilestoneDetailPopover: React.FC<MilestoneDetailPopoverProps> = ({
  milestone,
  isOpen,
  onClose,
  currentProgress,
  maturityScores
}) => {
  const navigate = useNavigate();

  const milestoneStatusColors = {
    locked: 'bg-muted text-muted-foreground border-border',
    active: 'bg-primary/10 text-primary border-primary/30',
    completed: 'bg-success/10 text-success border-success/30',
  };

  // Early return AFTER all hooks
  if (!milestone) return null;

  const isCompleted = milestone.status === 'completed';
  const isActive = milestone.status === 'active';
  const isLocked = milestone.status === 'locked';

  const statusColor = isLocked 
    ? milestoneStatusColors.locked 
    : isCompleted 
    ? milestoneStatusColors.completed 
    : milestoneStatusColors.active;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent variant="neumorphic" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-display text-foreground">
            <SystemIcon name={milestone.icon} className="w-10 h-10 text-primary" />
            {milestone.label}
            {isCompleted && <CheckCircle2 className="w-6 h-6 text-success" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn("shadow-neumorphic-inset", statusColor)}>
              {isLocked && (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Bloqueado
                </>
              )}
              {isActive && (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  En Progreso
                </>
              )}
              {isCompleted && (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completado
                </>
              )}
            </Badge>
          </div>

          {/* Progress */}
          <div className="neumorphic-inset rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Progreso</span>
              <span className="text-sm font-bold text-primary">
                {milestone.tasksCompleted}/{milestone.totalTasks} tareas
              </span>
            </div>
            <Progress value={milestone.progress} className="h-2" />
          </div>

          {/* Actions de este milestone */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Acciones de {milestone.label}
            </h4>
            <div className="space-y-2">
              {milestone.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.route) {
                      navigate(action.route);
                      onClose();
                    }
                  }}
                  disabled={!action.route}
                  className={cn(
                    "w-full neumorphic rounded-xl p-4 flex items-center gap-3 text-left transition-all",
                    action.route && "hover:shadow-neumorphic-hover cursor-pointer",
                    !action.route && "opacity-60 cursor-not-allowed",
                    action.completed && "bg-success/5"
                  )}
                >
                  {/* Icono de estado */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    action.completed ? "bg-success/20" : "bg-muted"
                  )}>
                    {action.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "flex-1 text-sm font-medium",
                    action.completed ? "text-success" : "text-foreground"
                  )}>
                    {action.label}
                  </span>
                  
                  {/* Chip de estado */}
                  {action.completed ? (
                    <Badge className="bg-success/10 text-success border-success/30 text-xs shrink-0">
                      Completado
                    </Badge>
                  ) : action.route ? (
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-xs shrink-0">
                      Pendiente
                    </Badge>
                  ) : null}
                </button>
              ))}
            </div>
            
            {milestone.actions.length === 0 && (
              <div className="text-sm text-muted-foreground italic p-4 text-center">
                Este milestone aún no tiene acciones configuradas.
              </div>
            )}
          </div>

          {/* Ver todas las tareas button */}
          <Button
            onClick={() => {
              navigate('/dashboard/tasks');
              onClose();
            }}
            className="w-full btn-capsule"
          >
            Ver todas las tareas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
