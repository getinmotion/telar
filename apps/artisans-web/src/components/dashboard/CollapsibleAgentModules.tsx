
import React, { useState } from 'react';
import { AgentModuleCard } from './AgentModuleCard';
import { AgentTasksManager } from './AgentTasksManager';
import { AgentDeliverablesManager } from './AgentDeliverablesManager';
import { AgentAnalyticsModule } from './AgentAnalyticsModule';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useAgentDeliverables } from '@/hooks/useAgentDeliverables';
import { useAgentConversations } from '@/hooks/useAgentConversations';
import { 
  Target, 
  Package, 
  BarChart3
} from 'lucide-react';

interface CollapsibleAgentModulesProps {
  agentId: string;
  language: 'en' | 'es';
}

export const CollapsibleAgentModules: React.FC<CollapsibleAgentModulesProps> = ({ 
  agentId, 
  language 
}) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  
  const { tasks } = useAgentTasks(agentId);
  const { deliverables } = useAgentDeliverables(agentId);
  const { conversations } = useAgentConversations(agentId);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const t = {
    en: {
      tasks: "Tasks",
      deliverables: "Deliverables", 
      analytics: "Analytics"
    },
    es: {
      tasks: "Tareas",
      deliverables: "Entregables",
      analytics: "Análisis"
    }
  };

  const activeTasks = tasks.filter(task => task.status === 'in_progress' || task.status === 'pending').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;

  const modules = [
    {
      id: 'tasks',
      title: t[language].tasks,
      icon: Target,
      badge: activeTasks,
      content: <AgentTasksManager agentId={agentId} language={language} />
    },
    {
      id: 'deliverables', 
      title: t[language].deliverables,
      icon: Package,
      badge: deliverables.length,
      content: <AgentDeliverablesManager agentId={agentId} language={language} />
    },
    {
      id: 'analytics',
      title: t[language].analytics,
      icon: BarChart3,
      badge: null,
      content: (
        <AgentAnalyticsModule
          language={language}
          conversations={conversations}
          pendingTasks={pendingTasks}
          inProgressTasks={inProgressTasks}
          completedTasks={completedTasks}
        />
      )
    }
  ];

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <AgentModuleCard
          key={module.id}
          id={module.id}
          title={module.title}
          icon={module.icon}
          badge={module.badge}
          isExpanded={expandedModules.includes(module.id)}
          onToggle={() => toggleModule(module.id)}
        >
          {module.content}
        </AgentModuleCard>
      ))}
    </div>
  );
};
