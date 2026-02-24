
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Target, 
  FileText,
  Timer,
  Calendar,
  X
} from 'lucide-react';
import { AgentTask, TaskSubtask, TaskResource } from '@/hooks/useAgentTasks';

interface TaskWorkflowModalProps {
  task: AgentTask;
  language: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
  onWorkWithAgent: () => void;
  onUpdateTask: (updates: Partial<AgentTask>) => Promise<void>;
}

export const TaskWorkflowModal: React.FC<TaskWorkflowModalProps> = ({
  task,
  language,
  isOpen,
  onClose,
  onWorkWithAgent,
  onUpdateTask
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subtasks' | 'notes' | 'resources'>('overview');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    notes: task.notes || '',
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    status: task.status,
    priority: task.priority
  });

  const t = {
    en: {
      taskDetails: 'Task Details',
      workWithAgent: 'Work with Agent',
      overview: 'Overview',
      subtasks: 'Subtasks',
      notes: 'Notes',
      resources: 'Resources',
      title: 'Title',
      description: 'Description',
      status: 'Status',
      priority: 'Priority',
      dueDate: 'Due Date',
      progress: 'Progress',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      addSubtask: 'Add Subtask',
      addNote: 'Add Note',
      addResource: 'Add Resource',
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      timeSpent: 'Time Spent',
      minutes: 'minutes'
    },
    es: {
      taskDetails: 'Detalles de la Tarea',
      workWithAgent: 'Trabajar con Agente',
      overview: 'Resumen',
      subtasks: 'Subtareas',
      notes: 'Notas',
      resources: 'Recursos',
      title: 'Título',
      description: 'Descripción',
      status: 'Estado',
      priority: 'Prioridad',
      dueDate: 'Fecha Límite',
      progress: 'Progreso',
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      addSubtask: 'Agregar Subtarea',
      addNote: 'Agregar Nota',
      addResource: 'Agregar Recurso',
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      timeSpent: 'Tiempo Dedicado',
      minutes: 'minutos'
    }
  };

  const handleSave = async (field: string) => {
    const updates: Partial<AgentTask> = {};
    
    if (field === 'title') updates.title = formData.title;
    if (field === 'description') updates.description = formData.description;
    if (field === 'notes') updates.notes = formData.notes;
    if (field === 'due_date') updates.due_date = formData.due_date ? new Date(formData.due_date).toISOString() : null;
    if (field === 'status') updates.status = formData.status as AgentTask['status'];
    if (field === 'priority') updates.priority = formData.priority;

    await onUpdateTask(updates);
    setEditingField(null);
  };

  const handleWorkWithAgent = () => {
    onWorkWithAgent();
    onClose();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-800';
    if (priority === 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t[language].taskDetails}</span>
            <Button onClick={handleWorkWithAgent} className="bg-purple-600 hover:bg-purple-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t[language].workWithAgent}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{task.progress_percentage}%</div>
              <div className="text-sm text-gray-600">{t[language].progress}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Badge className={getStatusBadgeColor(task.status)}>
                {t[language][task.status] || task.status}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">{t[language].status}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Badge className={getPriorityBadgeColor(task.priority)}>
                {task.priority === 1 ? t[language].high : task.priority === 2 ? t[language].medium : t[language].low}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">{t[language].priority}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{task.time_spent || 0}</div>
              <div className="text-sm text-gray-600">{t[language].minutes}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t[language].progress}</span>
              <span>{task.progress_percentage}%</span>
            </div>
            <Progress value={task.progress_percentage} className="h-2" />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['overview', 'subtasks', 'notes', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t[language][tab]}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label>{t[language].title}</Label>
                  {editingField === 'title' ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleSave('title')}>
                        {t[language].save}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                        {t[language].cancel}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded">
                      <span>{task.title}</span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingField('title')}>
                        {t[language].edit}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label>{t[language].description}</Label>
                  {editingField === 'description' ? (
                    <div className="space-y-2 mt-1">
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave('description')}>
                          {t[language].save}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                          {t[language].cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between mt-1 p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        {task.description || 'Sin descripción'}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingField('description')}>
                        {t[language].edit}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t[language].status}</Label>
                    <Select value={formData.status} onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, status: value as AgentTask['status'] }));
                      setTimeout(() => handleSave('status'), 100);
                    }}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t[language].pending}</SelectItem>
                        <SelectItem value="in_progress">{t[language].in_progress}</SelectItem>
                        <SelectItem value="completed">{t[language].completed}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t[language].dueDate}</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, due_date: e.target.value }));
                        setTimeout(() => handleSave('due_date'), 100);
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subtasks' && (
              <div className="space-y-3">
                {task.subtasks?.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle2 
                      className={`w-5 h-5 cursor-pointer ${
                        subtask.completed ? 'text-green-600' : 'text-gray-400'
                      }`} 
                    />
                    <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
                {(!task.subtasks || task.subtasks.length === 0) && (
                  <div className="text-center text-gray-500 py-4">
                    No hay subtareas creadas
                  </div>
                )}
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t[language].addSubtask}
                </Button>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-3">
                {editingField === 'notes' ? (
                  <div className="space-y-2">
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Agregar notas sobre la tarea..."
                      rows={6}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleSave('notes')}>
                        {t[language].save}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingField(null)}>
                        {t[language].cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg min-h-32">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {task.notes || 'No hay notas para esta tarea.'}
                      </p>
                    </div>
                    <Button onClick={() => setEditingField('notes')}>
                      <FileText className="w-4 h-4 mr-2" />
                      {task.notes ? t[language].edit : t[language].addNote}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3">
                {task.resources?.map((resource, index) => (
                  <div key={resource.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-sm text-gray-600">{resource.description}</p>
                        )}
                        {resource.url && (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" 
                             className="text-sm text-blue-600 hover:underline">
                            Ver recurso
                          </a>
                        )}
                      </div>
                      <Badge variant="outline">{resource.type}</Badge>
                    </div>
                  </div>
                ))}
                {(!task.resources || task.resources.length === 0) && (
                  <div className="text-center text-gray-500 py-4">
                    No hay recursos agregados
                  </div>
                )}
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t[language].addResource}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
