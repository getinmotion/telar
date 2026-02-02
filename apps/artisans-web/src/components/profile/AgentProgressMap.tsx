import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, FileText, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AgentInsight {
  agent_id: string;
  agent_name: string;
  task_count: number;
  completed_tasks: number;
  latest_activity: string;
  progress_percentage: number;
  latest_deliverable?: {
    title: string;
    created_at: string;
    file_type: string;
  };
}

interface AgentProgressMapProps {
  agents: AgentInsight[];
  language: 'en' | 'es';
  onAgentClick?: (agentId: string) => void;
}

export const AgentProgressMap: React.FC<AgentProgressMapProps> = ({ 
  agents, 
  language,
  onAgentClick 
}) => {
  const t = {
    en: {
      title: "Progress by Specialized Agent",
      tasks: "tasks",
      completed: "completed",
      latestDeliverable: "Latest Deliverable",
      noDeliverables: "No deliverables yet",
      viewDetails: "View Details"
    },
    es: {
      title: "Progreso por Agente Especializado",
      tasks: "tareas",
      completed: "completadas", 
      latestDeliverable: "Último Entregable",
      noDeliverables: "Sin entregables aún",
      viewDetails: "Ver Detalles"
    }
  };

  const getAgentColor = (agentId: string) => {
    const colors: Record<string, string> = {
      'marketing-agent': 'from-pink-500 to-rose-500',
      'financial-agent': 'from-green-500 to-emerald-500',
      'cultural-agent': 'from-purple-500 to-violet-500',
      'operations-agent': 'from-blue-500 to-cyan-500',
      'strategy-agent': 'from-orange-500 to-amber-500'
    };
    return colors[agentId] || 'from-gray-500 to-slate-500';
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'marketing-agent':
        return TrendingUp;
      case 'financial-agent':
        return Target;
      case 'cultural-agent':
        return FileText;
      default:
        return Target;
    }
  };

  if (agents.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t[language].title}
        </h3>
        <p className="text-gray-500 text-center py-8">
          {language === 'es' ? 'No hay agentes activos aún' : 'No active agents yet'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {t[language].title}
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent, index) => {
          const IconComponent = getAgentIcon(agent.agent_id);
          const gradientClass = getAgentColor(agent.agent_id);
          
          return (
            <motion.div
              key={agent.agent_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group ${
                onAgentClick ? 'hover:shadow-md' : ''
              }`}
              onClick={() => onAgentClick?.(agent.agent_id)}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${gradientClass}`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {agent.agent_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {agent.task_count} {t[language].tasks}
                    </p>
                  </div>
                </div>
                {onAgentClick && (
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {t[language].completed}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {agent.completed_tasks}/{agent.task_count}
                  </span>
                </div>
                <Progress 
                  value={agent.progress_percentage} 
                  className="h-2"
                />
              </div>

              {/* Latest Deliverable */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t[language].latestDeliverable}
                </h5>
                {agent.latest_deliverable ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {agent.latest_deliverable.file_type}
                    </Badge>
                    <span className="text-sm text-gray-700 truncate">
                      {agent.latest_deliverable.title}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    {t[language].noDeliverables}
                  </p>
                )}
              </div>

              {/* Gradient overlay for hover effect */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};