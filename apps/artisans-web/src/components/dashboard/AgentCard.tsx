
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Agent } from '@/types/dashboard';
import { MoreHorizontal, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAgentTranslation } from '@/data/agentTranslations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgentCardProps {
  agent: Agent;
  onActionClick: (id: string, action: string) => void;
  language: 'en' | 'es';
}

export const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  onActionClick,
  language 
}) => {
  const agentTranslation = getAgentTranslation(agent.id, language);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success';
      case 'paused': return 'bg-warning/20 text-warning-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'active': return 'Active';
        case 'paused': return 'Paused';
        case 'inactive': return 'Inactive';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'active': return 'Activo';
        case 'paused': return 'Pausado';
        case 'inactive': return 'Inactivo';
        default: return 'Desconocido';
      }
    }
  };

  return (
    <div className="flex items-center p-3 sm:p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${agent.color} flex items-center justify-center mr-2 sm:mr-3 text-white`}>
        {agent.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm sm:text-base text-foreground truncate">
            {agentTranslation.name}
          </h3>
          <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
            {getStatusText(agent.status)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{agent.category}</span>
          <span>•</span>
          <span>
            {agent.activeTasks} {language === 'en' ? 'active tasks' : 'tareas activas'}
          </span>
          {agent.lastUsed && (
            <>
              <span>•</span>
              <span>
                {language === 'en' ? 'Last used' : 'Último uso'}: {agent.lastUsed}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={agent.status === 'active'}
          onCheckedChange={(checked) => 
            onActionClick(agent.id, checked ? 'activate' : 'pause')
          }
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onActionClick(agent.id, 'view')}>
              {language === 'en' ? 'View Details' : 'Ver Detalles'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onActionClick(agent.id, agent.status === 'active' ? 'pause' : 'activate')}>
              {agent.status === 'active' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'Pause' : 'Pausar'}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'Activate' : 'Activar'}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onActionClick(agent.id, 'delete')}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Delete' : 'Eliminar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
