
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  MessageSquare,
  Link as LinkIcon,
  FileText,
  Save,
  Timer,
  Target
} from 'lucide-react';
import { AgentTask, TaskSubtask, TaskResource } from '@/hooks/useAgentTasks';

interface TaskDetailViewProps {
  task: AgentTask;
  language: 'en' | 'es';
  onUpdateSubtasks: (taskId: string, subtasks: TaskSubtask[]) => Promise<any>;
  onUpdateNotes: (taskId: string, notes: string) => Promise<any>;
  onUpdateResources: (taskId: string, resources: TaskResource[]) => Promise<any>;
  onUpdateTimeSpent: (taskId: string, timeSpent: number) => Promise<any>;
  onClose: () => void;
  onChatWithAgent: () => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  language,
  onUpdateSubtasks,
  onUpdateNotes,
  onUpdateResources,
  onUpdateTimeSpent,
  onClose,
  onChatWithAgent
}) => {
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>(task.subtasks || []);
  const [notes, setNotes] = useState(task.notes || '');
  const [resources, setResources] = useState<TaskResource[]>(task.resources || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' as const });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const t = {
    en: {
      taskDetails: 'Task Details',
      subtasks: 'Subtasks',
      addSubtask: 'Add Subtask',
      notes: 'Notes',
      resources: 'Resources',
      addResource: 'Add Resource',
      timeTracking: 'Time Tracking',
      totalTime: 'Total Time',
      currentSession: 'Current Session',
      startTimer: 'Start Timer',
      stopTimer: 'Stop Timer',
      chatWithAgent: 'Chat with Agent',
      save: 'Save Changes',
      close: 'Close',
      minutes: 'minutes',
      resourceTitle: 'Resource Title',
      resourceUrl: 'URL (optional)',
      completed: 'Completed',
      pending: 'Pending',
      progress: 'Progress'
    },
    es: {
      taskDetails: 'Detalles de la Tarea',
      subtasks: 'Subtareas',
      addSubtask: 'Añadir Subtarea',
      notes: 'Notas',
      resources: 'Recursos',
      addResource: 'Añadir Recurso',
      timeTracking: 'Seguimiento de Tiempo',
      totalTime: 'Tiempo Total',
      currentSession: 'Sesión Actual',
      startTimer: 'Iniciar Timer',
      stopTimer: 'Parar Timer',
      chatWithAgent: 'Iniciar Misión',
      save: 'Guardar Cambios',
      close: 'Cerrar',
      minutes: 'minutos',
      resourceTitle: 'Título del Recurso',
      resourceUrl: 'URL (opcional)',
      completed: 'Completada',
      pending: 'Pendiente',
      progress: 'Progreso'
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentSession(prev => prev + 1);
      }, 60000); // Every minute
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const newSub: TaskSubtask = {
      id: Date.now().toString(),
      title: newSubtask,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    const updatedSubtasks = [...subtasks, newSub];
    setSubtasks(updatedSubtasks);
    setNewSubtask('');
    setHasUnsavedChanges(true);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updatedSubtasks);
    setHasUnsavedChanges(true);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);
    setSubtasks(updatedSubtasks);
    setHasUnsavedChanges(true);
  };

  const handleAddResource = () => {
    if (!newResource.title.trim()) return;
    
    const resource: TaskResource = {
      id: Date.now().toString(),
      title: newResource.title,
      url: newResource.url || undefined,
      type: newResource.type
    };
    
    const updatedResources = [...resources, resource];
    setResources(updatedResources);
    setNewResource({ title: '', url: '', type: 'link' });
    setHasUnsavedChanges(true);
  };

  const handleDeleteResource = (resourceId: string) => {
    const updatedResources = resources.filter(r => r.id !== resourceId);
    setResources(updatedResources);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    await Promise.all([
      onUpdateSubtasks(task.id, subtasks),
      onUpdateNotes(task.id, notes),
      onUpdateResources(task.id, resources),
      onUpdateTimeSpent(task.id, task.time_spent + currentSession)
    ]);
    setHasUnsavedChanges(false);
    setCurrentSession(0);
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
    }
  };

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`${
                  task.relevance === 'high' ? 'border-red-300 text-red-600' :
                  task.relevance === 'medium' ? 'border-yellow-300 text-yellow-600' :
                  'border-green-300 text-green-600'
                }`}>
                  {task.relevance}
                </Badge>
                <Badge variant="secondary">
                  {progress}% {t[language].completed}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onChatWithAgent} variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t[language].chatWithAgent}
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                {t[language].close}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <p className="text-gray-600 text-sm">{task.description}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t[language].progress}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Separator />

          {/* Time Tracking */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Timer className="w-4 h-4" />
              {t[language].timeTracking}
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">{t[language].totalTime}:</span>
                <span className="ml-2 font-medium">{task.time_spent + currentSession} {t[language].minutes}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">{t[language].currentSession}:</span>
                <span className="ml-2 font-medium">{currentSession} {t[language].minutes}</span>
              </div>
              <Button
                onClick={toggleTimer}
                size="sm"
                variant={isTimerRunning ? "destructive" : "default"}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    {t[language].stopTimer}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {t[language].startTimer}
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Subtasks */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t[language].subtasks} ({completedSubtasks}/{subtasks.length})
            </h3>
            
            <div className="flex gap-2">
              <Input
                placeholder={t[language].addSubtask}
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              />
              <Button onClick={handleAddSubtask} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 p-2 border rounded-lg">
                  <button
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      subtask.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {subtask.completed && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                    {subtask.title}
                  </span>
                  <Button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t[language].notes}
            </h3>
            <Textarea
              placeholder="Añade notas sobre tu progreso..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setHasUnsavedChanges(true);
              }}
              rows={4}
            />
          </div>

          <Separator />

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              {t[language].resources}
            </h3>
            
            <div className="space-y-2">
              <Input
                placeholder={t[language].resourceTitle}
                value={newResource.title}
                onChange={(e) => setNewResource({...newResource, title: e.target.value})}
              />
              <div className="flex gap-2">
                <Input
                  placeholder={t[language].resourceUrl}
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                />
                <Button onClick={handleAddResource} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center gap-3 p-2 border rounded-lg">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{resource.title}</p>
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm truncate block"
                      >
                        {resource.url}
                      </a>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeleteResource(resource.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          {hasUnsavedChanges && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveChanges} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {t[language].save}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
