import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskRoutingAnalytics } from '@/hooks/analytics/useTaskRoutingAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap,
  ExternalLink,
  Target
} from 'lucide-react';

export const TaskRoutingDashboard: React.FC = () => {
  const { getRoutingSummary, getRoutingHistory } = useTaskRoutingAnalytics();
  const [summary, setSummary] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [summaryData, historyData] = await Promise.all([
      getRoutingSummary(),
      getRoutingHistory(100)
    ]);
    setSummary(summaryData || []);
    setHistory(historyData || []);
    setLoading(false);
  };

  const totalRoutes = summary.reduce((acc, s) => acc + (s.total_routes || 0), 0);
  const successfulRoutes = summary.reduce((acc, s) => acc + (s.successful_routes || 0), 0);
  const redirectRoutes = summary.filter(s => s.route_type === 'redirect').reduce((acc, s) => acc + (s.total_routes || 0), 0);
  const genericRoutes = summary.filter(s => s.route_type === 'generic').reduce((acc, s) => acc + (s.total_routes || 0), 0);
  const avgCompletionTime = summary.reduce((acc, s) => acc + (s.avg_completion_time_seconds || 0), 0) / (summary.length || 1);

  const getMatchedByBadge = (matchedBy: string) => {
    const configs = {
      'task_id': { label: 'Task ID', variant: 'default' as const },
      'deliverable_type': { label: 'Deliverable Type', variant: 'success' as const },
      'agent_keyword': { label: 'Agent Keyword', variant: 'default' as const },
      'fallback': { label: 'Generic Flow', variant: 'secondary' as const }
    };
    const config = configs[matchedBy as keyof typeof configs] || configs.fallback;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCompletionMethodBadge = (method: string) => {
    const configs = {
      'wizard': { label: 'Wizard', variant: 'success' as const, icon: CheckCircle },
      'generic': { label: 'Generic', variant: 'default' as const, icon: Target },
      'abandoned': { label: 'Abandoned', variant: 'warning' as const, icon: XCircle },
      'error': { label: 'Error', variant: 'destructive' as const, icon: XCircle }
    };
    const config = configs[method as keyof typeof configs] || configs.generic;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Task Routing Analytics</h2>
        <p className="text-muted-foreground">
          Métricas detalladas sobre cómo se enrutan las tareas a wizards especializados
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold">{totalRoutes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wizard Redirects</p>
                <p className="text-2xl font-bold">{redirectRoutes}</p>
                <p className="text-xs text-muted-foreground">
                  {totalRoutes ? Math.round((redirectRoutes / totalRoutes) * 100) : 0}% del total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generic Flow</p>
                <p className="text-2xl font-bold">{genericRoutes}</p>
                <p className="text-xs text-muted-foreground">
                  {totalRoutes ? Math.round((genericRoutes / totalRoutes) * 100) : 0}% del total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(avgCompletionTime / 60)}m
                </p>
                <p className="text-xs text-muted-foreground">tiempo de completación</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Routing Breakdown</CardTitle>
              <CardDescription>Análisis por tipo de ruta y método de matching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={item.route_type === 'redirect' ? 'default' : 'outline'}>
                          {item.route_type === 'redirect' ? 'Wizard Redirect' : 'Generic Flow'}
                        </Badge>
                        {getMatchedByBadge(item.matched_by)}
                        {item.wizard_name && (
                          <span className="text-sm font-medium">{item.wizard_name}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.total_routes} routes
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">
                          {item.total_routes ? 
                            Math.round((item.successful_routes / item.total_routes) * 100) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium text-success">{item.successful_routes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failed</p>
                        <p className="font-medium text-destructive">{item.failed_routes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium">
                          {item.avg_completion_time_seconds ? 
                            `${Math.round(item.avg_completion_time_seconds / 60)}m` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Routing History</CardTitle>
              <CardDescription>Historial detallado de decisiones de routing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.task_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Agent: {item.task_agent_id}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.routed_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getMatchedByBadge(item.matched_by)}
                      {item.completion_method && getCompletionMethodBadge(item.completion_method)}
                      {item.destination && (
                        <Badge variant="outline" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {item.wizard_name}
                        </Badge>
                      )}
                      {item.time_to_complete_seconds && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.round(item.time_to_complete_seconds / 60)}m
                        </Badge>
                      )}
                    </div>
                    {item.matched_value && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Matched: {item.matched_value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
