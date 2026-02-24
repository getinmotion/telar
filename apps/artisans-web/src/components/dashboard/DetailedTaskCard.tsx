import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from '@/hooks/useTranslations';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { formatTaskTitleForDisplay } from '@/hooks/utils/agentTaskUtils';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Play, 
  RotateCcw, 
  Archive,
  ArchiveRestore,
  ExternalLink
} from 'lucide-react';
import { AgentTask } from '@/hooks/useAgentTasks';
import { useTaskLimits } from '@/hooks/useTaskLimits';
import { getActionForTask } from '@/utils/agentActionRouter';
import { getAgentDisplayInfo } from '@/config/allowedAgents';
import { useNavigate } from 'react-router-dom';

interface DetailedTaskCardProps {
  task: AgentTask;
  language: 'en' | 'es';
  onStartDevelopment?: (task: AgentTask) => void;
  onChatWithAgent?: (task: AgentTask) => void;
  onCompleteTask?: (task: AgentTask) => void;
  onDelete: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  onUnarchive?: (taskId: string) => void;
  isUpdating: boolean;
  allTasks?: AgentTask[];
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
  showSelection?: boolean;
}

export const DetailedTaskCard: React.FC<DetailedTaskCardProps> = ({
  task,
  language,
  onStartDevelopment,
  onChatWithAgent,
  onCompleteTask,
  onDelete,
  onArchive,
  onUnarchive,
  isUpdating,
  allTasks = [],
  isSelected = false,
  onSelect,
  showSelection = false
}) => {
  const navigate = useNavigate();
  const taskLimits = useTaskLimits(allTasks);
  const { t } = useTranslations();
  const { context } = useUnifiedUserData();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const agentAction = getActionForTask(task);
  const agentInfo = getAgentDisplayInfo(task.agent_id);
  const displayTitle = formatTaskTitleForDisplay(task.title, context?.businessProfile?.brandName);

  const getStatusBadge = (status: AgentTask['status']) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, color: 'text-warning-foreground', icon: Clock },
      in_progress: { variant: 'default' as const, color: 'text-primary', icon: Play },
      completed: { variant: 'default' as const, color: 'text-success', icon: CheckCircle2 },
      cancelled: { variant: 'outline' as const, color: 'text-muted-foreground', icon: RotateCcw }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const handleMainAction = () => {
    if (task.status === 'completed') return;
    if (task.status === 'in_progress') {
      onChatWithAgent?.(task);
      return;
    }
    if (agentAction.type === 'wizard' || agentAction.type === 'route') {
      navigate(agentAction.destination!);
    } else if (agentAction.type === 'chat') {
      if (!taskLimits.isAtLimit) {
        onStartDevelopment?.(task);
      }
    }
  };

  const getMainCTA = () => {
    if (task.status === 'completed') {
      return {
        label: t.tasks.completed,
        icon: CheckCircle2,
        onClick: () => {},
        variant: 'default' as const,
        className: 'bg-success text-success-foreground cursor-default',
        disabled: true
      };
    }
    if (task.status === 'in_progress') {
      return {
        label: t.dashboard.continueTask || 'Continuar',
        icon: Play,
        onClick: handleMainAction,
        variant: 'default' as const,
        className: 'bg-primary text-primary-foreground'
      };
    }
    return {
      label: agentAction.label,
      icon: agentAction.type === 'wizard' || agentAction.type === 'route' ? ExternalLink : Play,
      onClick: handleMainAction,
      variant: 'default' as const,
      className: 'bg-foreground text-background hover:bg-foreground/90',
      disabled: taskLimits.isAtLimit && agentAction.type === 'chat'
    };
  };

  const statusBadge = getStatusBadge(task.status);
  const StatusIcon = statusBadge.icon;
  const mainCTA = getMainCTA();
  const MainCTAIcon = mainCTA.icon;

  return (
    <>
      <Card className={`hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${task.status === 'completed' ? 'opacity-70' : ''}`}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {showSelection && (
                <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect?.(task.id, checked as boolean)} className="mt-1" />
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base">{displayTitle}</h3>
                  <Badge variant="outline" className={`text-xs ${agentInfo.color}`}>{agentInfo.icon} {agentInfo.name}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{task.description || 'Sin descripción'}</p>
              </div>
            </div>
            <Badge variant={statusBadge.variant} className={`${statusBadge.color} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{t.tasks[task.status]}</span>
            </Badge>
          </div>

          {task.progress_percentage !== undefined && task.progress_percentage > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.tasks.progress}</span>
                <span>{task.progress_percentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${task.progress_percentage}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-3 border-t">
            <Button onClick={mainCTA.onClick} disabled={mainCTA.disabled || isUpdating} variant={mainCTA.variant} className={`flex-1 ${mainCTA.className}`} size="sm">
              <MainCTAIcon className="w-4 h-4 mr-2" />
              {mainCTA.label}
            </Button>
            {task.is_archived ? (
              <Button onClick={() => onUnarchive?.(task.id)} variant="ghost" size="sm" title="Desarchivar"><ArchiveRestore className="w-4 h-4" /></Button>
            ) : (
              <Button onClick={() => onArchive?.(task.id)} variant="ghost" size="sm" title="Archivar"><Archive className="w-4 h-4" /></Button>
            )}
            <Button onClick={() => setShowDeleteDialog(true)} variant="ghost" size="sm" className="text-destructive" title="Eliminar"><Trash2 className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>
      <DeleteTaskDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={async () => { await onDelete(task.id); setShowDeleteDialog(false); }} task={task} language={language} />
    </>
  );
};
