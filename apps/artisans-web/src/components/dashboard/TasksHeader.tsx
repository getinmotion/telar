import React from 'react';
import { Button } from '@/components/ui/button';
import { MotionLogo } from '@/components/MotionLogo';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
        
        <div className="flex items-center gap-3">
          {/* Stats badges */}
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
          
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Taller Digital
          </Button>
        </div>
      </div>
    </header>
  );
};
