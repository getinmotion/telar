
import React from 'react';
import { useAgentStats } from '@/hooks/useAgentStats';
import { 
  MessageSquare, 
  CheckCircle, 
  Target, 
  TrendingUp
} from 'lucide-react';

interface AgentMiniDashboardProps {
  agentId: string;
  language: 'en' | 'es';
  compact?: boolean;
}

export const AgentMiniDashboard: React.FC<AgentMiniDashboardProps> = ({
  agentId,
  language,
  compact = false
}) => {
  const { stats, loading } = useAgentStats(agentId);

  const t = {
    en: {
      dashboard: "Dashboard",
      active: "Active",
      completed: "Completed", 
      chats: "Chats",
      deliverables: "Deliverables",
      today: "Today"
    },
    es: {
      dashboard: "Dashboard",
      active: "Activo",
      completed: "Completadas",
      chats: "Chats", 
      deliverables: "Entregables",
      today: "Hoy"
    }
  };

  if (loading) {
    return (
      <div className="bg-accent backdrop-blur-xl p-6 rounded-2xl border border-accent/30">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-accent backdrop-blur-xl p-4 rounded-2xl border border-accent/30 text-center">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="text-xl font-bold text-white">{stats.totalConversations}</div>
        <div className="text-sm text-accent-foreground/80">{t[language].chats}</div>
      </div>
    );
  }

  const statsData = [
    {
      title: t[language].active,
      value: stats.activeTasks.toString(),
      icon: Target,
      iconColor: "text-warning"
    },
    {
      title: t[language].completed,
      value: stats.completedTasks.toString(),
      icon: CheckCircle,
      iconColor: "text-success"
    },
    {
      title: t[language].chats,
      value: stats.totalConversations.toString(),
      icon: MessageSquare,
      iconColor: "text-primary"
    },
    {
      title: t[language].deliverables,
      value: stats.deliverables.toString(),
      icon: TrendingUp,
      iconColor: "text-accent"
    }
  ];

  return (
    <div className="bg-accent backdrop-blur-xl p-6 rounded-2xl border border-accent/30">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">{t[language].dashboard}</h3>
      </div>

      {/* Stats Grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div key={index} className="text-center">
            {/* Icon at top */}
            <div className="flex justify-center mb-2">
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            
            {/* Number in center */}
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </div>
            
            {/* Title at bottom */}
            <div className="text-sm text-accent-foreground/80">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Today Section */}
      <div className="bg-white/10 rounded-xl p-4 text-center">
        <div className="text-sm text-accent-foreground/80 mb-1">{t[language].today}</div>
        <div className="text-xl font-bold text-white">+{stats.totalMessages}</div>
      </div>
    </div>
  );
};
