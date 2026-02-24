/**
 * Simplified Task List - OPTIMIZED
 * Receives data as props instead of calling hook internally
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Palette, 
  Package, 
  Paintbrush, 
  BookOpen, 
  FileText, 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Clock
} from 'lucide-react';
import { getMilestoneLabel } from '@/config/fixedTasks';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FixedTask } from '@/types/fixedTask';
import { CompletedFixedTask } from '@/hooks/useFixedTasksManager';

const iconMap: Record<string, React.ComponentType<any>> = {
  Store,
  Palette,
  Package,
  Paintbrush,
  BookOpen,
  FileText,
  Target,
  Users,
  TrendingUp,
  DollarSign
};

interface SimplifiedTaskListProps {
  tasks: FixedTask[];
  completedTasks: CompletedFixedTask[];
  loading: boolean;
}

export const SimplifiedTaskList: React.FC<SimplifiedTaskListProps> = ({
  tasks,
  completedTasks,
  loading
}) => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0 && completedTasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
        <h3 className="text-xl font-semibold mb-2">{t.taskManagement.allTasksCompleted}</h3>
        <p className="text-muted-foreground">
          {t.taskManagement.allTasksCompletedDesc}
        </p>
      </Card>
    );
  }

  // Group tasks by milestone
  const tasksByMilestone = tasks.reduce((acc, task) => {
    if (!acc[task.milestone]) {
      acc[task.milestone] = [];
    }
    acc[task.milestone].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const handleTaskClick = (destination: string, actionType: string, taskTitle: string) => {
    if (actionType === 'wizard') {
      toast({
        title: "Iniciando wizard...",
        description: `Preparando: ${taskTitle}`,
      });
    } else if (actionType === 'modal') {
      toast({
        title: "Abriendo configuración...",
        description: taskTitle,
      });
    }
    
    navigate(destination);
  };

  const getMilestoneBadgeColor = (milestone: string) => {
    switch (milestone) {
      case 'formalization': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'brand': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'shop': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'sales': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active" className="gap-2">
            <Clock className="w-4 h-4" />
            {t.taskManagement.inProgress} ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {t.taskManagement.completed} ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: En Curso */}
        <TabsContent value="active" className="space-y-8">
          {tasks.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
              <h3 className="text-xl font-semibold mb-2">{t.taskManagement.allTasksCompleted}</h3>
              <p className="text-muted-foreground">
                {t.taskManagement.allTasksCompletedDesc}
              </p>
            </Card>
          ) : (
            Object.entries(tasksByMilestone).map(([milestone, milestoneTasks]) => (
              <div key={milestone}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    milestone === 'formalization' ? "bg-blue-500" :
                    milestone === 'brand' ? "bg-purple-500" :
                    milestone === 'shop' ? "bg-green-500" :
                    milestone === 'sales' ? "bg-orange-500" :
                    "bg-pink-500"
                  )} />
                  {getMilestoneLabel(milestone)}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {milestoneTasks.map(task => {
                    const IconComponent = iconMap[task.icon] || Package;
                    
                    return (
                      <Card 
                        key={task.id} 
                        className="relative p-5 min-h-[180px] hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => handleTaskClick(task.action.destination, task.action.type, task.title)}
                      >
                        {/* Badge - milestone label */}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "absolute top-3 left-3 text-xs font-medium border",
                            getMilestoneBadgeColor(milestone)
                          )}
                        >
                          {getMilestoneLabel(milestone)}
                        </Badge>
                        
                        {/* Icon and Content */}
                        <div className="flex items-start gap-3 mt-10">
                          <div className="shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] p-2 rounded-xl bg-background">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm mb-1 line-clamp-2">{task.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* CTA - circular button bottom right */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground opacity-100 group-hover:opacity-100 transition-opacity">
                            Iniciar
                          </span>
                          <button 
                            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                            aria-label="Iniciar tarea"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Tab: Finalizadas */}
        <TabsContent value="completed" className="space-y-3">
          {completedTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t.taskManagement.noCompletedYet}
              </p>
            </Card>
          ) : (
            completedTasks.map(task => {
              const IconComponent = iconMap[task.icon] || Package;
              
              return (
                <Card key={task.id} className="p-4 bg-success/5 border-success/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t.taskManagement.completedOn}{' '}
                        {task.completedAt 
                          ? format(new Date(task.completedAt), "d 'de' MMMM, yyyy", { locale: es })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
