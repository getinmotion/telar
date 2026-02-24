/**
 * System Integrity Dashboard
 * 
 * Visual dashboard component for displaying comprehensive system health validation.
 * Shows Master Coordinator health, agent system integrity, data synchronization,
 * mission system health, and UI coherence checks.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  validateSystemIntegrity, 
  generateValidationReport,
  SystemIntegrityResult,
  ValidationCheck 
} from '@/utils/systemIntegrityValidator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  Download,
  Wrench,
  Activity,
  Database,
  Users,
  Target,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

export const SystemIntegrityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<SystemIntegrityResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runValidation = async () => {
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    setIsValidating(true);
    try {
      const validationResult = await validateSystemIntegrity(user.id);
      setResult(validationResult);
      
      if (validationResult.overallPassed) {
        toast.success('✅ Validación completa - Sistema saludable');
      } else {
        toast.warning('⚠️ Validación completa - Issues detectados', {
          description: `${validationResult.criticalIssues.length} críticos, ${validationResult.warnings.length} warnings`
        });
      }
    } catch (error) {
      console.error('Error running validation:', error);
      toast.error('Error al ejecutar validación');
    } finally {
      setIsValidating(false);
    }
  };

  const exportReport = () => {
    if (!result) return;
    
    const report = generateValidationReport(result);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-integrity-report-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Reporte exportado');
  };

  useEffect(() => {
    if (user) {
      runValidation();
    }
  }, [user]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        runValidation();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Integrity Dashboard</CardTitle>
          <CardDescription>Cargando validación del sistema...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Integrity Dashboard
              </CardTitle>
              <CardDescription>
                Validación completa de salud del sistema • {result.timestamp.toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={runValidation}
                disabled={isValidating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                Validar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Estado General</div>
              <Badge 
                variant={result.overallPassed ? 'default' : 'destructive'}
                className="text-base px-3 py-1"
              >
                {result.overallPassed ? (
                  <><CheckCircle2 className="h-4 w-4 mr-1" /> Sistema Saludable</>
                ) : (
                  <><XCircle className="h-4 w-4 mr-1" /> Issues Detectados</>
                )}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{result.criticalIssues.length}</div>
              <div className="text-xs text-muted-foreground">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{result.warnings.length}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{result.recommendations.length}</div>
              <div className="text-xs text-muted-foreground">Recomendaciones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {result.criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Issues Críticos Detectados:</div>
            <ul className="list-disc list-inside space-y-1">
              {result.criticalIssues.map((issue, idx) => (
                <li key={idx} className="text-sm">{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Sections */}
      <Tabs defaultValue="coordinator" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="coordinator">
            <Activity className="h-4 w-4 mr-2" />
            Coordinator
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Users className="h-4 w-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data Sync
          </TabsTrigger>
          <TabsTrigger value="missions">
            <Target className="h-4 w-4 mr-2" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="ui">
            <Palette className="h-4 w-4 mr-2" />
            UI
          </TabsTrigger>
        </TabsList>

        {/* Master Coordinator Health */}
        <TabsContent value="coordinator">
          <ValidationSection
            title="Master Coordinator Health"
            icon={<Activity className="h-5 w-5" />}
            passed={result.masterCoordinatorHealth.passed}
            checks={result.masterCoordinatorHealth.checks}
          />
        </TabsContent>

        {/* Agent System Integrity */}
        <TabsContent value="agents">
          <ValidationSection
            title="Agent System Integrity"
            icon={<Users className="h-5 w-5" />}
            passed={result.agentSystemIntegrity.passed}
            checks={result.agentSystemIntegrity.checks}
            extraInfo={
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Agentes Activos</div>
                  <div className="font-semibold">
                    {result.agentSystemIntegrity.allowedAgentsActive.join(', ') || 'Ninguno'}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Agentes Bloqueados con Misiones</div>
                  <div className="font-semibold text-destructive">
                    {result.agentSystemIntegrity.blockedAgentsWithMissions.join(', ') || 'Ninguno'}
                  </div>
                </div>
              </div>
            }
          />
        </TabsContent>

        {/* Data Synchronization */}
        <TabsContent value="data">
          <ValidationSection
            title="Data Synchronization"
            icon={<Database className="h-5 w-5" />}
            passed={result.dataSynchronization.passed}
            checks={result.dataSynchronization.checks}
            extraInfo={
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Nombre de Negocio</div>
                  <Badge variant={result.dataSynchronization.businessNameConsistent ? 'default' : 'destructive'}>
                    {result.dataSynchronization.businessNameConsistent ? 'Consistente' : 'Inconsistente'}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Source Maturity Scores</div>
                  <Badge variant={result.dataSynchronization.maturityScoresSource === 'master_context' ? 'default' : 'destructive'}>
                    {result.dataSynchronization.maturityScoresSource}
                  </Badge>
                </div>
              </div>
            }
          />
        </TabsContent>

        {/* Mission System Health */}
        <TabsContent value="missions">
          <ValidationSection
            title="Mission System Health"
            icon={<Target className="h-5 w-5" />}
            passed={result.missionSystemHealth.passed}
            checks={result.missionSystemHealth.checks}
            extraInfo={
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Total Misiones</div>
                  <div className="text-2xl font-bold">{result.missionSystemHealth.totalMissions}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Sin Categoría</div>
                  <div className="text-2xl font-bold text-warning">
                    {result.missionSystemHealth.missionsWithoutCategory}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Agentes con Misiones</div>
                  <div className="text-2xl font-bold">
                    {Object.keys(result.missionSystemHealth.missionsByAgent).length}
                  </div>
                </div>
              </div>
            }
          />
        </TabsContent>

        {/* UI Coherence */}
        <TabsContent value="ui">
          <ValidationSection
            title="UI Coherence"
            icon={<Palette className="h-5 w-5" />}
            passed={result.uiCoherence.passed}
            checks={result.uiCoherence.checks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ValidationSectionProps {
  title: string;
  icon: React.ReactNode;
  passed: boolean;
  checks: ValidationCheck[];
  extraInfo?: React.ReactNode;
}

const ValidationSection: React.FC<ValidationSectionProps> = ({ title, icon, passed, checks, extraInfo }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          <Badge variant={passed ? 'default' : 'destructive'} className="ml-auto">
            {passed ? 'PASSED' : 'ISSUES'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {extraInfo}
        <div className="space-y-3">
          {checks.map((check) => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface CheckItemProps {
  check: ValidationCheck;
}

const CheckItem: React.FC<CheckItemProps> = ({ check }) => {
  const getSeverityIcon = () => {
    if (check.passed) return <CheckCircle2 className="h-4 w-4 text-success" />;
    
    switch (check.severity) {
      case 'critical':
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = () => {
    if (check.passed) return null;
    
    const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'secondary',
      info: 'default'
    };

    return (
      <Badge variant={variants[check.severity]} className="text-xs">
        {check.severity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      {getSeverityIcon()}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{check.name}</span>
          {getSeverityBadge()}
        </div>
        <p className="text-sm text-muted-foreground">{check.message}</p>
        {check.recommendation && (
          <p className="text-xs text-primary flex items-center gap-1 mt-2">
            <Wrench className="h-3 w-3" />
            {check.recommendation}
          </p>
        )}
      </div>
    </div>
  );
};
