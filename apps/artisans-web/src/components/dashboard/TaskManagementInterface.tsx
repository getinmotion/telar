import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Target,
  MoreHorizontal,
  Calendar,
  User
} from 'lucide-react';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { CreateTaskModal } from './CreateTaskModal';
import { UnifiedTaskWorkflowModal } from './UnifiedTaskWorkflowModal';
import { AgentTask } from '@/hooks/useAgentTasks';
import { CategoryScore } from '@/types/dashboard';

interface TaskManagementInterfaceProps {
  language: 'en' | 'es';
  onTaskCreate?: () => void;
  onTaskUpdate?: () => void;
  maturityScores?: CategoryScore | null;
  profileData?: any;
  enabledAgents?: string[];
  onSelectAgent?: (id: string) => void;
}

export const TaskManagementInterface: React.FC<TaskManagementInterfaceProps> = ({
  language,
  onTaskCreate,
  onTaskUpdate,
  maturityScores,
  profileData,
  enabledAgents,
  onSelectAgent
}) => {
  const { tasks, createTask, updateTask, loading } = useAgentTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);

  const t = {
    en: {
      taskManagement: 'Task Management',
      newTask: 'New Task',
      allTasks: 'All Tasks',
      inProgress: 'In Progress',
      completed: 'Completed',
      pending: 'Pending',
      noTasks: 'No tasks yet',
      createFirst: 'Create your first task!',
      dueDate: 'Due',
      progress: 'Progress'
    },
    es: {
      taskManagement: 'Gestión de Tareas',
      newTask: 'Nueva Tarea',
      allTasks: 'Todas las Tareas',
      inProgress: 'En Progreso',
      completed: 'Completadas',
      pending: 'Pendientes',
      noTasks: 'No hay tareas aún',
      createFirst: '¡Crea tu primera tarea!',
      dueDate: 'Vence',
      progress: 'Progreso'
    }
  };

  const getStatusColor = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'border-l-red-500';
    if (priority === 2) return 'border-l-yellow-500';
    return 'border-l-green-500';
  };

  const handleCreateTask = async (taskData: Partial<AgentTask>) => {
    const newTask = await createTask({
      ...taskData,
      agent_id: 'general' // Default agent for general tasks
    });
    
    if (newTask && onTaskCreate) {
      onTaskCreate();
    }
    
    return newTask;
  };

  const handleUpdateTask = async (updates: Partial<AgentTask>) => {
    if (selectedTask) {
      await updateTask(selectedTask.id, updates);
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    }
  };

  // Get task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5);

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-white/20 rounded"></div>
            <div className="h-3 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            {t[language].taskManagement}
          </h2>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t[language].newTask}
          </Button>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{taskStats.total}</div>
            <div className="text-xs text-white/70">{t[language].allTasks}</div>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-300">{taskStats.pending}</div>
            <div className="text-xs text-yellow-200">{t[language].pending}</div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-300">{taskStats.inProgress}</div>
            <div className="text-xs text-blue-200">{t[language].inProgress}</div>
          </div>
          <div className="bg-green-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-300">{taskStats.completed}</div>
            <div className="text-xs text-green-200">{t[language].completed}</div>
          </div>
        </div>

        {/* Recent Tasks */}
        {recentTasks.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t[language].noTasks}</p>
            <p className="text-xs opacity-75">{t[language].createFirst}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer border-l-4 ${getPriorityColor(task.priority)}`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-white/70 text-xs mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                {task.progress_percentage > 0 && (
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-white/60">{t[language].progress}</span>
                      <span className="text-xs text-white/60">{task.progress_percentage}%</span>
                    </div>
                    <Progress value={task.progress_percentage} className="h-1 bg-white/20" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(task.status)}`}>
                      {t[language][task.status] || task.status}
                    </Badge>
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <User className="w-3 h-3" />
                    <span>General</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <CreateTaskModal
        agentId="general"
        language={language}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={handleCreateTask}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <UnifiedTaskWorkflowModal
          task={selectedTask}
          language={language}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onWorkWithAgent={() => {}}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </>
  );
};
