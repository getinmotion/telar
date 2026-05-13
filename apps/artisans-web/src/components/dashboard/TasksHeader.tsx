import React from 'react';
import { MotionLogo } from '@/components/MotionLogo';
import { CheckCircle2, Clock } from 'lucide-react';

interface TasksHeaderProps {
  pendingCount?: number;
  completedCount?: number;
  totalProgress?: number;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  pendingCount = 0,
  completedCount = 0,
  totalProgress = 0
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MotionLogo size="md" />
          <div>
            <div className="bg-primary/10 px-3 py-1 rounded-full inline-block mb-1">
              <span className="text-primary font-medium text-sm">MIS TAREAS</span>
            </div>
            <p className="text-xs text-muted-foreground ml-1">
              {pendingCount} pendientes • {completedCount} completadas • {totalProgress}% progreso
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
            <Clock className="w-3 h-3" />
            {pendingCount}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {completedCount}
          </div>
        </div>
      </div>
    </header>
  );
};
