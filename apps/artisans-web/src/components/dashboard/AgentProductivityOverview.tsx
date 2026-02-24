
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface AgentProductivityOverviewProps {
  language: 'en' | 'es';
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export const AgentProductivityOverview: React.FC<AgentProductivityOverviewProps> = ({
  language,
  pendingTasks,
  inProgressTasks,
  completedTasks
}) => {
  const t = {
    en: {
      productivity: "Productivity Overview",
      pendingTasks: "Pending",
      inProgressTasks: "In Progress", 
      completedTasks: "Completed Tasks"
    },
    es: {
      productivity: "Resumen de Productividad",
      pendingTasks: "Pendientes",
      inProgressTasks: "En Progreso",
      completedTasks: "Tareas Completadas"
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="w-5 h-5 text-accent" />
          {t[language].productivity}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-accent-foreground/70">{t[language].pendingTasks}</span>
            <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
              {pendingTasks}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-accent-foreground/70">{t[language].inProgressTasks}</span>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
              {inProgressTasks}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-accent-foreground/70">{t[language].completedTasks}</span>
            <Badge variant="outline" className="text-success border-success/30 bg-success/10">
              {completedTasks}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
