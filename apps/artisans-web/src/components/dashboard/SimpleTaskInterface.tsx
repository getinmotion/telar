import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/hooks/useTranslations';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  MessageSquare,
  Target,
  ChevronRight,
  Heart,
  AlertCircle,
  List,
  Eye
} from 'lucide-react';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { getTaskCompletionData } from '@/hooks/utils/taskCompletionHelpers';
import { useTaskLimits } from '@/hooks/useTaskLimits';
import { CreateTaskModal } from './CreateTaskModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getActionForTask, AgentAction } from '@/utils/agentActionRouter';
import { toast } from 'sonner';

interface SimpleTaskInterfaceProps {
  agentId: string;
  language: 'en' | 'es';
  onStartMission?: (taskId: string, taskTitle: string) => void;
  isLoadingChat?: boolean;
  processingTaskId?: string | null;
}

export const SimpleTaskInterface: React.FC<SimpleTaskInterfaceProps> = ({
  agentId,
  language,
  onStartMission,
  isLoadingChat = false,
  processingTaskId = null
}) => {
  const { tasks, loading, createTask, updateTask, startTaskDevelopment } = useAgentTasks(agentId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'simple' | 'all'>('simple');
  const taskLimits = useTaskLimits(tasks);
  const { t } = useTranslations();

  const getMotivationalMessage = (progress: number) => {
    if (progress === 0) return "";
    if (progress < 30) return t.dashboard.letsStart;
    if (progress < 70) return t.dashboard.keepGoing;
    if (progress < 100) return t.dashboard.almostThere;
    return t.tasks.completed;
  };

  const getProgressEmoji = (progress: number) => {
    if (progress === 0) return "🎯";
    if (progress < 30) return "🚀";
    if (progress < 70) return "💪";
    if (progress < 100) return "⭐";
    return "🎉";
  };

  const getTaskExplanation = (task: any) => {
    // Generar explicaciones contextuales basadas en el título de la tarea
    const title = task.title.toLowerCase();
    
    if (title.includes('validar') || title.includes('validate')) {
      return {
        why: language === 'es' 
          ? "Validar tu idea te asegura que realmente resuelves un problema que la gente tiene"
          : "Validating your idea ensures you're solving a real problem people actually have",
        what: language === 'es'
          ? "Una idea validada con feedback real de potenciales usuarios"
          : "A validated idea with real feedback from potential users"
      };
    }
    
    if (title.includes('propuesta') || title.includes('value')) {
      return {
        why: language === 'es'
          ? "Tu propuesta de valor única es lo que te diferencia de la competencia"
          : "Your unique value proposition is what sets you apart from competitors",
        what: language === 'es'
          ? "Una propuesta clara que explique por qué la gente debería elegirte"
          : "A clear proposition explaining why people should choose you"
      };
    }

    return {
      why: language === 'es'
        ? "Esta tarea te acerca a tus objetivos creativos"
        : "This task brings you closer to your creative goals",
      what: language === 'es'
        ? "Un paso importante completado en tu proyecto"
        : "An important step completed in your project"
    };
  };

  const handleStartTaskDevelopment = async (task: any) => {
    // Prevent multiple clicks by tracking loading state
    if (loading) {
      console.log('Already processing, ignoring multiple clicks');
      return;
    }

    if (task.status === 'completed') return;
    
    // ✅ USAR NUEVO SISTEMA DE ROUTING
    const action = getActionForTask(task);
    
    // Manejar diferentes tipos de acciones
    switch (action.type) {
      case 'wizard':
      case 'route':
        console.log(`🚀 Redirecting to: ${action.destination}`);
        toast.success(language === 'es' ? 'Iniciando misión especializada' : 'Starting specialized mission', {
          description: language === 'es' 
            ? `${action.label}: ${task.title}` 
            : `${action.label}: ${task.title}`,
        });
        setTimeout(() => {
          // Construir URL correctamente usando URLSearchParams
          const url = new URL(action.destination!, window.location.origin);
          url.searchParams.set('taskId', task.id);
          window.location.href = url.pathname + url.search;
        }, 500);
        return;
        
      case 'modal':
        // TODO: Abrir modal específico (BusinessPlanModal, etc)
        console.log(`🔷 Opening modal: ${action.component}`);
        toast.info('Modal en desarrollo', {
          description: `Próximamente: ${action.label}`
        });
        return;
        
      case 'chat':
        // Flujo normal de chat
        break;
    }
    
    // Continuar con flujo normal de chat
    try {
      console.log('=== STARTING TASK DEVELOPMENT ===');
      console.log('Task:', { id: task.id, title: task.title, status: task.status });
      
      const updatedTask = await startTaskDevelopment(task.id);
      console.log('Task development result:', updatedTask);
      
      if (updatedTask && onStartMission) {
        console.log('Opening chat with mission for task...');
        onStartMission(task.id, task.title);
      } else if (onStartMission) {
        console.log('Task update may have failed, but opening chat anyway...');
        onStartMission(task.id, task.title);
      }
    } catch (error) {
      console.error('❌ Error starting task development:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('límite')) {
          console.log('Task limit error handled by special operations');
          return;
        } else if (error.message.includes('foreign key constraint')) {
          console.error('Database constraint error - invalid task or conversation reference');
          return;
        }
      }
      
      // Handle other errors gracefully - still try to open chat
      console.warn('Failed to start task development, but opening chat anyway');
      if (onStartMission) {
        console.log('Opening chat despite development error...');
        onStartMission(task.id, task.title);
      }
    }
  };

  const handleCompleteTask = async (task: any) => {
    const completionData = getTaskCompletionData();
    console.log('🎯 [SimpleTaskInterface] Completing task:', task.id, completionData);
    
    await updateTask(task.id, completionData);
  };

  const handleChatWithTask = (task: any) => {
    // Prevent multiple clicks
    if (loading) {
      console.log('Already processing, ignoring chat request');
      return;
    }

    console.log('=== OPENING CHAT FOR TASK ===');
    console.log('Task:', { id: task.id, title: task.title });
    
    if (onStartMission) {
      onStartMission(task.id, task.title);
    } else {
      console.error('onStartMission callback not available');
    }
  };

  const handleCreateTask = async (taskData: any) => {
    if (taskLimits.isAtLimit) {
      return null;
    }
    
    const newTask = await createTask({
      ...taskData,
      agent_id: agentId
    });
    if (newTask) {
      setShowCreateModal(false);
    }
    return newTask;
  };

  // Get the active task for this agent (only one should be in_progress)
  const activeTask = tasks.find(t => t.status === 'in_progress');
  // Get the next pending task if no active task
  const nextTask = !activeTask ? tasks.find(t => t.status === 'pending') : null;
  // The current actionable task is either active or next pending
  const currentTask = activeTask || nextTask;
  
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white/70">{t.ui.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header with Task Limits and View Toggle */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Target className="w-6 h-6 text-purple-400" />
          {t.dashboard.yourNextStep}
        </h2>
        
        {/* Task Limits Display */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-white/70">
            {completedCount > 0 && (
              <span>{completedCount} {completedCount === 1 ? (language === 'es' ? 'tarea completada' : 'completed task') : (language === 'es' ? 'tareas completadas' : 'completed tasks')} ✨</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
            <span className="text-sm text-white/80">{t.dashboard.activeTasks}:</span>
            <span className={`text-sm font-bold ${
              taskLimits.isAtLimit ? 'text-red-400' : 
              taskLimits.isNearLimit ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {taskLimits.activeTasksCount}/{taskLimits.limit}
            </span>
            {taskLimits.isAtLimit && <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>
        </div>

        {/* View Toggle */}
        {tasks.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              size="sm"
              variant={viewMode === 'simple' ? "secondary" : "ghost"}
              onClick={() => setViewMode('simple')}
              className={`text-xs px-3 py-1 h-auto transition-colors ${
                viewMode === 'simple' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3 mr-1" />
              {t.dashboard.simpleView}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'all' ? "secondary" : "ghost"}
              onClick={() => setViewMode('all')}
              className={`text-xs px-3 py-1 h-auto transition-colors ${
                viewMode === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <List className="w-3 h-3 mr-1" />
              {t.dashboard.viewAll}
            </Button>
          </div>
        )}

        {/* Enhanced Limit Warning */}
        {taskLimits.getLimitMessage(language) && (
          <div className={`text-sm p-3 rounded-lg mb-4 flex items-center gap-2 ${
            taskLimits.isAtLimit ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-medium">
                {taskLimits.isAtLimit ? 
                  (language === 'es' ? 'Límite alcanzado' : 'Limit reached') : 
                  (language === 'es' ? 'Acercándose al límite' : 'Approaching limit')
                }
              </div>
              <div className="text-xs opacity-90">
                {taskLimits.getLimitMessage(language)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-2">
            {viewMode === 'all' ? (
              /* All Tasks View */
              <div className="space-y-4">
                {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
            <Card className="bg-gray-800/90 border border-gray-700/50 max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {t.dashboard.readyToCreate}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {t.dashboard.noTasksDesc}
                  </p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    disabled={taskLimits.isAtLimit}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {t.dashboard.createFirstTask}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                <Card key={task.id} className="bg-gray-800/90 border border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{task.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                             {task.status === 'completed' ? t.tasks.taskStatus.completed :
                              task.status === 'in_progress' ? t.tasks.taskStatus.inProgress : t.tasks.taskStatus.pending}
                          </span>
                          <span className="text-xs text-white/60">{task.progress_percentage}%</span>
                        </div>
                        <Progress value={task.progress_percentage} className="h-1 bg-white/20 mb-2" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button 
                         onClick={() => task.status === 'completed' ? null : handleStartTaskDevelopment(task)}
                         disabled={task.status === 'completed' || isLoadingChat || processingTaskId === task.id}
                         className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg text-sm disabled:opacity-50"
                       >
                        {task.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            {t.tasks.completed}
                          </>
                        ) : task.status === 'in_progress' ? (
                          <>
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {t.dashboard.continueTask}
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            {t.tasks.activateTask}
                          </>
                        )}
                      </Button>
                      
                      {task.status === 'in_progress' && (
                        <Button 
                          onClick={() => handleCompleteTask(task)}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {t.tasks.completeTask}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
        /* Simple View - Single Actionable Task */
        !currentTask ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="bg-gray-800/90 border border-gray-700/50 max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t.dashboard.readyToCreate}
                </h3>
                <p className="text-white/70 mb-6">
                  {t.dashboard.noTasksDesc}
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={taskLimits.isAtLimit}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {t.dashboard.createFirstTask}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-gray-800/90 border border-gray-700/50 overflow-hidden">
              <CardContent className="p-8">
                {/* Task Title */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <span className="text-white/70">{t.dashboard.howIsGoing} </span>
                    <span className="text-purple-300">"{currentTask.title}"</span>
                    <span className="text-white/70"> {t.dashboard.going}</span>
                  </h3>
                  
                  {/* Task Status Badge */}
                  <div className="flex justify-center mb-4">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      currentTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {currentTask.status === 'in_progress' ? `🚀 ${t.tasks.taskStatus.inProgress}` : `⏳ ${t.tasks.pending}`}
                    </span>
                  </div>
                </div>

                {/* Progress Circle */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border-4 border-purple-400/30 mb-4">
                      <span className="text-3xl">{getProgressEmoji(currentTask.progress_percentage)}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {currentTask.progress_percentage}%
                    </div>
                    <p className="text-purple-300 font-medium">
                      {getMotivationalMessage(currentTask.progress_percentage)}
                    </p>
                  </div>
                  
                  <Progress 
                    value={currentTask.progress_percentage} 
                    className="w-full mt-4 h-2 bg-white/20"
                  />
                </div>

                {/* Task Context */}
                <div className="bg-white/5 rounded-2xl p-6 mb-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t.dashboard.whyImportant}
                    </h4>
                    <p className="text-white/80 text-sm">
                      {getTaskExplanation(currentTask).why}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {t.dashboard.whatYoullAchieve}
                    </h4>
                    <p className="text-white/80 text-sm">
                      {getTaskExplanation(currentTask).what}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t.dashboard.estimatedTime}
                    </h4>
                    <p className="text-white/80 text-sm">
                      15-20 {t.dashboard.minutes}
                    </p>
                  </div>
                </div>

                {/* Main Action - Development with Agent */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleStartTaskDevelopment(currentTask)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-medium text-lg disabled:opacity-50"
                    disabled={currentTask.status === 'completed' || isLoadingChat || processingTaskId === currentTask.id}
                  >
                    {processingTaskId === currentTask.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {language === 'es' ? 'Abriendo chat...' : 'Opening chat...'}
                      </>
                    ) : currentTask.status === 'in_progress' ? (
                      <>
                        <MessageSquare className="w-5 h-5 mr-2" />
                        {t.dashboard.continueTask}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {t.tasks.activateTask}
                      </>
                    )}
                  </Button>
                  
                  {currentTask.status === 'in_progress' && (
                    <Button 
                      onClick={() => handleCompleteTask(currentTask)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t.tasks.markCompleted}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
              )
            )}

            {/* Other Pending Tasks Preview - Solo en vista simple */}
            {viewMode === 'simple' && tasks.filter(t => t.id !== currentTask?.id && t.status === 'pending').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white/90 mb-1 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    {language === 'es' ? 'Otras tareas pendientes' : 'Other pending tasks'}: {tasks.filter(t => t.id !== currentTask?.id && t.status === 'pending').length}
                  </h4>
                  <p className="text-white/70 text-sm">{language === 'es' ? 'Completa la tarea actual para continuar' : 'Complete the current task to continue'}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewMode('all')}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  {t.dashboard.viewAll}
                </Button>
              </div>
            </CardContent>
              </Card>
            </motion.div>
            )}

            {/* Create Task Modal */}
            <CreateTaskModal
              agentId={agentId}
              language={language}
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onCreateTask={handleCreateTask}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
