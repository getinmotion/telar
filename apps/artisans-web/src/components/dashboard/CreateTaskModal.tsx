
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AgentTask } from '@/hooks/useAgentTasks';

interface CreateTaskModalProps {
  agentId: string;
  language: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<AgentTask>) => Promise<AgentTask | null>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  agentId,
  language,
  isOpen,
  onClose,
  onCreateTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(3);
  const [relevance, setRelevance] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const t = {
    en: {
      createTask: 'Create New Task',
      title: 'Title',
      description: 'Description',
      priority: 'Priority',
      relevance: 'Relevance',
      dueDate: 'Due Date',
      cancel: 'Cancel',
      create: 'Create Task',
      titlePlaceholder: 'Enter task title...',
      descriptionPlaceholder: 'Enter task description...',
      selectDate: 'Select date',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    },
    es: {
      createTask: 'Crear Nueva Tarea',
      title: 'Título',
      description: 'Descripción',
      priority: 'Prioridad',
      relevance: 'Relevancia',
      dueDate: 'Fecha Límite',
      cancel: 'Cancelar',
      create: 'Crear Tarea',
      titlePlaceholder: 'Ingresa el título de la tarea...',
      descriptionPlaceholder: 'Ingresa la descripción de la tarea...',
      selectDate: 'Seleccionar fecha',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onCreateTask({
        agent_id: agentId,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        relevance,
        due_date: dueDate?.toISOString() || null,
        status: 'pending'
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority(3);
      setRelevance('medium');
      setDueDate(null);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t[language].createTask}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t[language].title}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t[language].titlePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t[language].description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t[language].descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t[language].priority}</Label>
              <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t[language].high} (1)</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">{t[language].medium} (3)</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">{t[language].low} (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t[language].relevance}</Label>
              <Select value={relevance} onValueChange={(value: 'low' | 'medium' | 'high') => setRelevance(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t[language].high}</SelectItem>
                  <SelectItem value="medium">{t[language].medium}</SelectItem>
                  <SelectItem value="low">{t[language].low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t[language].dueDate}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : t[language].selectDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate || undefined}
                  onSelect={(date) => setDueDate(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t[language].cancel}
            </Button>
            <Button type="submit" disabled={!title.trim() || isCreating}>
              {isCreating ? 'Creando...' : t[language].create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
