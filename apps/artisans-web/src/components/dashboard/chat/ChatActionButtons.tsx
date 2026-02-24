import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  ArrowRight, 
  Plus, 
  Clock, 
  FileText, 
  HelpCircle,
  Target,
  Users,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ChatAction {
  id: string;
  label: string;
  type: 'task-action' | 'conversation' | 'resource';
  priority: 'high' | 'medium' | 'low';
  context?: {
    taskId?: string;
    action?: string;
    data?: any;
  };
}

interface ChatActionButtonsProps {
  actions: ChatAction[];
  onAction: (action: ChatAction) => void;
  disabled?: boolean;
}

const getActionIcon = (actionId: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'complete-task': CheckCircle,
    'next-step': ArrowRight,
    'add-subtask': Plus,
    'schedule-reminder': Clock,
    'add-resource': FileText,
    'ask-questions': HelpCircle,
    'set-goal': Target,
    'collaborate': Users,
    'add-checklist': BookOpen,
  };
  
  return iconMap[actionId] || ArrowRight;
};

const getActionVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

export const ChatActionButtons: React.FC<ChatActionButtonsProps> = ({
  actions,
  onAction,
  disabled = false
}) => {
  const { toast } = useToast();

  const handleActionClick = (action: ChatAction) => {
    if (disabled) return;
    
    try {
      onAction(action);
      toast({
        title: 'Acción ejecutada',
        description: `Se ejecutó: ${action.label}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo ejecutar la acción',
        variant: 'destructive',
      });
    }
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
      {actions.map((action) => {
        const IconComponent = getActionIcon(action.id);
        const variant = getActionVariant(action.priority);
        
        return (
          <Button
            key={action.id}
            variant={variant as any}
            size="sm"
            onClick={() => handleActionClick(action)}
            disabled={disabled}
            className="h-8 text-xs gap-1.5 transition-all duration-200 hover:scale-105 !text-foreground"
          >
            <IconComponent className="w-3 h-3" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};