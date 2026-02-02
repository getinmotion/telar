
import React from 'react';
import { motion } from 'framer-motion';
import { OptimizedRecommendedTask } from '@/hooks/useOptimizedRecommendedTasks';
import { ArrowRight, Clock, User, Zap, Star, CheckCircle, Flame, FileText } from 'lucide-react';

interface PremiumTaskCardProps {
  task: OptimizedRecommendedTask;
  language: 'en' | 'es';
  onAction: () => void;
}

export const PremiumTaskCard: React.FC<PremiumTaskCardProps> = ({
  task,
  language,
  onAction
}) => {
  const t = {
    en: {
      startTask: 'Start Task',
      completed: 'Completed',
      with: 'with',
      priority: {
        high: 'High Priority',
        medium: 'Medium Priority',
        low: 'Low Priority'
      }
    },
    es: {
      startTask: 'Comenzar Tarea',
      completed: 'Completada',
      with: 'con',
      priority: {
        high: 'Alta Prioridad',
        medium: 'Prioridad Media',
        low: 'Baja Prioridad'
      }
    }
  };

  const getPriorityConfig = () => {
    switch (task.priority) {
      case 'high':
        return {
          color: 'from-destructive to-destructive/80',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
          textColor: 'text-destructive',
          Icon: Flame
        };
      case 'medium':
        return {
          color: 'from-warning to-warning/80',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          textColor: 'text-warning-foreground',
          Icon: Zap
        };
      case 'low':
        return {
          color: 'from-success to-success/80',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          textColor: 'text-success',
          Icon: FileText
        };
      default:
        return {
          color: 'from-primary to-primary/80',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          textColor: 'text-primary',
          Icon: FileText
        };
    }
  };

  const priorityConfig = getPriorityConfig();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden bg-white rounded-2xl shadow-sm border ${priorityConfig.borderColor} hover:shadow-lg transition-all duration-300`}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${priorityConfig.color}`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg ${priorityConfig.bgColor} flex items-center justify-center mr-3`}>
              <priorityConfig.Icon className={`w-4 h-4 ${priorityConfig.textColor}`} />
            </div>
            <div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
                {t[language].priority[task.priority as keyof typeof t[typeof language]['priority']]}
              </span>
            </div>
          </div>
          {task.completed && (
            <div className="flex items-center text-success">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Category Badge */}
        {task.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
              <Star className="w-3 h-3 mr-1" />
              {task.category}
            </span>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{task.estimatedTime}</span>
          </div>
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            <span>{t[language].with} {task.agentName}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between">
          {task.completed ? (
            <div className="flex items-center text-success font-medium">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t[language].completed}
            </div>
          ) : (
            <button
              onClick={onAction}
              className={`flex items-center px-4 py-2 bg-gradient-to-r ${priorityConfig.color} text-white rounded-xl hover:shadow-md transition-all transform hover:scale-105 font-medium text-sm`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {t[language].startTask}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${priorityConfig.color}`} />
      </div>
      <div className="absolute bottom-4 right-6 opacity-5">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${priorityConfig.color}`} />
      </div>
    </motion.div>
  );
};
