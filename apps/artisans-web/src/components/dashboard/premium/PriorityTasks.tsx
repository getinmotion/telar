import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, LayoutGrid, List, Kanban, Loader2 } from 'lucide-react';
import { useAgentTasks, AgentTask } from '@/hooks/useAgentTasks';
import { DetailedTaskCard } from '../DetailedTaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface PriorityTasksProps {
  language: 'en' | 'es';
  // The following props are passed by the parent component but are not used here.
  // We keep them for compatibility.
  tasks: unknown;
  tasksLoading: boolean;
  onTaskAction: (taskId: string, agentId: string) => void;
  onMaturityCalculatorClick: () => void;
}

type ViewMode = 'list' | 'grid';

export const PriorityTasks: React.FC<PriorityTasksProps> = ({
  language,
  onTaskAction,
}) => {
  const { tasks, loading, updateTask, deleteTask, startTaskDevelopment, completeTaskQuickly } = useAgentTasks();
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const t = {
    en: {
      tasks: "My Tasks",
      noTasks: "No tasks yet",
      createFirst: "Tasks will appear here once they are created.",
      listView: "List View",
      gridView: "Grid View",
      kanbanView: "Kanban View",
      chatWithAgent: "Chat with Agent",
    },
    es: {
      tasks: "Mis Tareas",
      noTasks: "No hay tareas aún",
      createFirst: "Las tareas aparecerán aquí una vez que se creen.",
      listView: "Vista de Lista",
      gridView: "Vista de Mosaico",
      kanbanView: "Vista Kanban",
      chatWithAgent: "Iniciar Misión",
    }
  };

  const handleStartDevelopment = async (task: AgentTask) => {
    setUpdatingTasks(prev => new Set(prev).add(task.id));
    
    try {
      const updatedTask = await startTaskDevelopment(task.id);
      
      if (updatedTask) {
        // Call the parent's onTaskAction to potentially open a detailed view or chat
        onTaskAction(task.id, task.agent_id);
      }
    } catch (error) {
      console.error('Error starting task development:', error);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  const handleCompleteTask = async (task: AgentTask) => {
    setUpdatingTasks(prev => new Set(prev).add(task.id));
    
    // Use the quick complete function for faster completion
    await completeTaskQuickly(task.id);
    
    setUpdatingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(task.id);
      return newSet;
    });
  };

  const handleDelete = async (taskId: string) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    await deleteTask(taskId);
  };

  const handleChatWithAgent = (task: AgentTask) => {
    // Call the parent's onTaskAction to open chat with agent
    onTaskAction(task.id, task.agent_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/80 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          {t[language].tasks}
        </h3>
        <div className="flex items-center gap-2">
          {!loading && (
            <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
              {tasks.length} {tasks.length === 1 ? (language === 'es' ? 'tarea' : 'task') : (language === 'es' ? 'tareas' : 'tasks')}
            </Badge>
          )}
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} title={t[language].listView} className="text-white hover:bg-slate-700 data-[state=active]:bg-slate-700">
            <List className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} title={t[language].gridView} className="text-white hover:bg-slate-700 data-[state=active]:bg-slate-700">
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled title={t[language].kanbanView} className="text-white/50">
            <Kanban className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-700 bg-transparent mt-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-300 font-medium mb-2">{t[language].noTasks}</p>
            <p className="text-sm text-slate-400 text-center">
              {t[language].createFirst}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'list' ? "space-y-3 mt-4" : "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"}>
          {tasks.map((task) => (
            <DetailedTaskCard
              key={task.id}
              task={task}
              language={language}
              onStartDevelopment={handleStartDevelopment}
              onCompleteTask={handleCompleteTask}
              onChatWithAgent={handleChatWithAgent}
              onDelete={handleDelete}
              isUpdating={updatingTasks.has(task.id)}
              allTasks={tasks}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
