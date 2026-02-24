import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, FileText, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityItem {
  type: 'task' | 'conversation' | 'deliverable';
  title: string;
  agent_id: string;
  created_at: string;
  description?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  language: 'en' | 'es';
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  activities, 
  language 
}) => {
  const t = {
    en: {
      title: "Recent Activity",
      empty: "No recent activity",
      task: "Task",
      conversation: "Conversation", 
      deliverable: "Deliverable"
    },
    es: {
      title: "Actividad Reciente",
      empty: "Sin actividad reciente",
      task: "Tarea",
      conversation: "Conversación",
      deliverable: "Entregable"
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task':
        return CheckCircle;
      case 'conversation':
        return MessageSquare;
      case 'deliverable':
        return FileText;
      default:
        return Clock;
    }
  };

  const getAgentName = (agentId: string) => {
    const names: Record<string, string> = {
      'marketing-agent': language === 'es' ? 'Marketing' : 'Marketing',
      'financial-agent': language === 'es' ? 'Financiero' : 'Financial',
      'cultural-agent': language === 'es' ? 'Cultural' : 'Cultural',
      'operations-agent': language === 'es' ? 'Operaciones' : 'Operations',
      'strategy-agent': language === 'es' ? 'Estratégico' : 'Strategy'
    };
    return names[agentId] || agentId;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'text-green-600 bg-green-50';
      case 'conversation':
        return 'text-blue-600 bg-blue-50';
      case 'deliverable':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t[language].title}
        </h3>
        <p className="text-gray-500 text-center py-8">
          {t[language].empty}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {t[language].title}
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const IconComponent = getIcon(activity.type);
          const colorClasses = getTypeColor(activity.type);
          
          return (
            <motion.div
              key={`${activity.type}-${activity.created_at}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className={`p-2 rounded-full ${colorClasses}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: language === 'es' ? es : undefined
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-600">
                    {getAgentName(activity.agent_id)}
                  </span>
                  {activity.description && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {activity.description}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};