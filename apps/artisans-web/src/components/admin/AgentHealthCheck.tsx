/**
 * Agent Health Check Component
 * 
 * Dashboard administrativo para verificar que los 6 agentes estén
 * generando tareas activamente y conectados al coordinador maestro.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle2, AlertCircle, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { AGENTS_CONFIG } from '@/config/systemConfig';
import { cn } from '@/lib/utils';

interface AgentHealthData {
  agentId: string;
  agentName: string;
  icon: string;
  color: string;
  tasksLast7Days: number;
  tasksLast30Days: number;
  activeTasks: number;
  completedTasks: number;
  lastTaskCreated: Date | null;
  isHealthy: boolean;
  status: 'active' | 'inactive' | 'warning';
}

export const AgentHealthCheck: React.FC = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<AgentHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAgentHealth = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const agentIds = Object.keys(AGENTS_CONFIG);
      const healthResults: AgentHealthData[] = [];

      for (const agentId of agentIds) {
        const config = AGENTS_CONFIG[agentId];
        
        // Tasks in last 7 days
        const { count: count7Days } = await supabase
          .from('agent_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .eq('environment', 'production')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        // Tasks in last 30 days
        const { count: count30Days } = await supabase
          .from('agent_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .eq('environment', 'production')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Active tasks
        const { count: activeTasks } = await supabase
          .from('agent_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .in('status', ['pending', 'in_progress'])
          .eq('environment', 'production');

        // Completed tasks
        const { count: completedTasks } = await supabase
          .from('agent_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .eq('status', 'completed')
          .eq('environment', 'production');

        // Last task created
        const { data: lastTask } = await supabase
          .from('agent_tasks')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .eq('environment', 'production')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Determine health status
        const hasRecentActivity = (count7Days ?? 0) > 0;
        const hasAnyTasks = (count30Days ?? 0) > 0;
        
        let status: 'active' | 'inactive' | 'warning';
        if (hasRecentActivity) {
          status = 'active';
        } else if (hasAnyTasks) {
          status = 'warning';
        } else {
          status = 'inactive';
        }

        healthResults.push({
          agentId,
          agentName: config.name,
          icon: config.icon,
          color: config.color,
          tasksLast7Days: count7Days ?? 0,
          tasksLast30Days: count30Days ?? 0,
          activeTasks: activeTasks ?? 0,
          completedTasks: completedTasks ?? 0,
          lastTaskCreated: lastTask?.created_at ? new Date(lastTask.created_at) : null,
          isHealthy: hasRecentActivity,
          status
        });
      }

      setHealthData(healthResults);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('[AgentHealthCheck] Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentHealth();
  }, [user?.id]);

  const getStatusIcon = (status: 'active' | 'inactive' | 'warning') => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: 'active' | 'inactive' | 'warning') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/30">Activo</Badge>;
      case 'warning':
        return <Badge className="bg-warning/10 text-warning border-warning/30">Alerta</Badge>;
      case 'inactive':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Inactivo</Badge>;
    }
  };

  const overallHealth = {
    active: healthData.filter(a => a.status === 'active').length,
    warning: healthData.filter(a => a.status === 'warning').length,
    inactive: healthData.filter(a => a.status === 'inactive').length,
    total: healthData.length
  };

  const healthPercentage = overallHealth.total > 0 
    ? (overallHealth.active / overallHealth.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Health Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Salud de los 6 Agentes</CardTitle>
                <CardDescription>
                  Última actualización: {lastRefresh.toLocaleTimeString('es-ES')}
                </CardDescription>
              </div>
            </div>
            <Button onClick={fetchAgentHealth} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="text-3xl font-bold text-success">{overallHealth.active}</div>
              <div className="text-sm text-muted-foreground">Activos</div>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="text-3xl font-bold text-warning">{overallHealth.warning}</div>
              <div className="text-sm text-muted-foreground">En Alerta</div>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="text-3xl font-bold text-destructive">{overallHealth.inactive}</div>
              <div className="text-sm text-muted-foreground">Inactivos</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">{healthPercentage.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Salud General</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Agent Health Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData.map((agent) => (
          <Card key={agent.agentId} className={cn(
            "transition-all hover:shadow-md",
            agent.status === 'active' && "border-success/30",
            agent.status === 'warning' && "border-warning/30",
            agent.status === 'inactive' && "border-destructive/30"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <CardTitle className="text-base">{agent.agentName}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ID: {agent.agentId}
                    </div>
                  </div>
                </div>
                {getStatusIcon(agent.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                {getStatusBadge(agent.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última tarea:</span>
                  <span className="font-medium">
                    {agent.lastTaskCreated 
                      ? new Date(agent.lastTaskCreated).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                      : 'Nunca'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Últimos 7 días:</span>
                  <Badge variant="outline" className="text-xs">
                    {agent.tasksLast7Days} tareas
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Últimos 30 días:</span>
                  <Badge variant="outline" className="text-xs">
                    {agent.tasksLast30Days} tareas
                  </Badge>
                </div>
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Activas:</span>
                  <span className="font-semibold text-primary">{agent.activeTasks}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completadas:</span>
                  <span className="font-semibold text-success">{agent.completedTasks}</span>
                </div>
              </div>

              {agent.status === 'inactive' && (
                <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                  ⚠️ Este agente no ha generado tareas en 30 días
                </div>
              )}

              {agent.status === 'warning' && (
                <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
                  ℹ️ Sin actividad reciente (últimos 7 días)
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {(overallHealth.warning > 0 || overallHealth.inactive > 0) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <TrendingUp className="w-5 h-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {overallHealth.inactive > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span>
                  Hay {overallHealth.inactive} agente(s) inactivo(s). Considera generar tareas manualmente
                  para esos agentes o verificar su configuración en el coordinador maestro.
                </span>
              </div>
            )}
            {overallHealth.warning > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-warning font-bold">•</span>
                <span>
                  {overallHealth.warning} agente(s) no han generado tareas en los últimos 7 días.
                  Esto es normal si el usuario no ha interactuado con esas áreas.
                </span>
              </div>
            )}
            <div className="flex items-start gap-2 pt-2">
              <span className="text-primary font-bold">💡</span>
              <span>
                Para garantizar que todos los agentes estén activos, asegúrate de que el usuario complete
                el test de madurez y que el coordinador maestro esté generando tareas de forma balanceada.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
