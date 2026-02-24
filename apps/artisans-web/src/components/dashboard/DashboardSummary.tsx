
import React from 'react';
import { Target, CheckCircle, Clock } from 'lucide-react';

interface DashboardSummaryProps {
  language: 'en' | 'es';
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ language }) => {
  console.log('DashboardSummary rendering with new vertical layout');
  
  const t = {
    en: {
      activeAgents: "Active Agents",
      completedTasks: "Completed Tasks",
      pendingTasks: "Pending Tasks"
    },
    es: {
      activeAgents: "Agentes Activos",
      completedTasks: "Tareas Completadas",
      pendingTasks: "Tareas Pendientes"
    }
  };

  const stats = [
    {
      title: t[language].activeAgents,
      value: "2",
      icon: Target,
      color: "text-primary"
    },
    {
      title: t[language].completedTasks,
      value: "12",
      icon: CheckCircle,
      color: "text-primary"
    },
    {
      title: t[language].pendingTasks,
      value: "3",
      icon: Clock,
      color: "text-accent"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-8 xs:grid-cols-2 md:grid-cols-3">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={`stat-${index}-${stat.value}`}
            className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center space-y-4"
          >
            <IconComponent className={`w-12 h-12 ${stat.color}`} />
            <div className="text-4xl font-bold text-foreground">{stat.value}</div>
            <p className={`text-base font-semibold ${stat.color}`}>{stat.title}</p>
          </div>
        );
      })}
    </div>
  );
};
