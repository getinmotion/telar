/**
 * Data Integrity Dashboard
 * FASE 7: Dashboard de depuración visual para verificar estado del sistema
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useDataIntegrityCheck } from '@/hooks/useDataIntegrityCheck';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { attemptDataRepair } from '@/utils/dataRepair';
import { useToast } from '@/hooks/use-toast';

const severityConfig = {
  critical: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30'
  },
  error: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
};

interface IntegrityItemProps {
  label: string;
  value: any;
  status: 'ok' | 'error' | 'warning';
}

const IntegrityItem: React.FC<IntegrityItemProps> = ({ label, value, status }) => {
  const config = {
    ok: { icon: CheckCircle, color: 'text-green-600', text: 'Correcto' },
    error: { icon: XCircle, color: 'text-destructive', text: 'Error' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', text: 'Advertencia' }
  };

  const { icon: Icon, color } = config[status];
  const displayValue = typeof value === 'string' ? value : JSON.stringify(value);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {displayValue || 'No disponible'}
        </div>
      </div>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
  );
};

export const DataIntegrityDashboard: React.FC = () => {
  const { profile, context, loading, refreshData } = useUnifiedUserData();
  const { masterState } = useMasterAgent();
  const integrityReport = useDataIntegrityCheck();
  const { toast } = useToast();
  const [isRepairing, setIsRepairing] = React.useState(false);

  const handleAutoRepair = async () => {
    if (!profile?.userId) {
      toast({
        title: 'Error',
        description: 'No se pudo identificar al usuario',
        variant: 'destructive'
      });
      return;
    }

    setIsRepairing(true);
    
    try {
      const result = await attemptDataRepair(profile.userId);
      
      if (result.success) {
        toast({
          title: '✅ Reparación exitosa',
          description: `${result.changes.length} cambios aplicados`,
        });
        
        // Refrescar datos
        await refreshData();
      } else {
        toast({
          title: '⚠️ Reparación parcial',
          description: `${result.changes.length} cambios, ${result.errors.length} errores`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error en auto-reparación:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la reparación',
        variant: 'destructive'
      });
    } finally {
      setIsRepairing(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-amber-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Verificando integridad del sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${integrityReport.isHealthy ? 'border-green-500' : 'border-amber-500'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🔍 Estado de Integridad del Sistema
          </CardTitle>
          <Badge variant={integrityReport.isHealthy ? 'default' : 'destructive'}>
            {integrityReport.isHealthy ? 'Saludable' : 'Requiere Atención'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-destructive/10 text-center">
            <div className="text-2xl font-bold text-destructive">{integrityReport.summary.critical}</div>
            <div className="text-xs text-muted-foreground">Críticos</div>
          </div>
          <div className="p-2 rounded-lg bg-red-50 text-center">
            <div className="text-2xl font-bold text-red-600">{integrityReport.summary.errors}</div>
            <div className="text-xs text-muted-foreground">Errores</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-center">
            <div className="text-2xl font-bold text-amber-600">{integrityReport.summary.warnings}</div>
            <div className="text-xs text-muted-foreground">Advertencias</div>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-center">
            <div className="text-2xl font-bold text-blue-600">{integrityReport.summary.info}</div>
            <div className="text-xs text-muted-foreground">Info</div>
          </div>
        </div>

        {/* Data Sources Check */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Fuentes de Datos</h4>
          
          <IntegrityItem 
            label="Nombre de Marca (Profile)" 
            value={profile?.brandName} 
            status={profile?.brandName ? 'ok' : 'warning'}
          />
          
          <IntegrityItem 
            label="Nombre de Marca (Context)" 
            value={(context?.businessProfile as any)?.brandName || (context?.businessProfile as any)?.brand_name} 
            status={(context?.businessProfile as any)?.brandName ? 'ok' : 'warning'}
          />
          
          <IntegrityItem 
            label="Nombre de Marca (Insights)" 
            value={(context?.conversationInsights as any)?.nombre_marca} 
            status={(context?.conversationInsights as any)?.nombre_marca ? 'ok' : 'warning'}
          />
          
          <IntegrityItem 
            label="Maturity Scores" 
            value={context?.taskGenerationContext?.maturityScores ? 'Presentes' : 'Ausentes'} 
            status={context?.taskGenerationContext?.maturityScores ? 'ok' : 'error'}
          />
          
          <IntegrityItem 
            label="Brand Diagnosis (Nuevo Sistema)" 
            value={(context?.conversationInsights as any)?.brand_diagnosis ? 
              `Completado (${((context?.conversationInsights as any)?.brand_diagnosis?.average_score || 0).toFixed(1)}/5)` : 
              'No completado'
            } 
            status={(context?.conversationInsights as any)?.brand_diagnosis ? 'ok' : 'warning'}
          />
          
          <IntegrityItem 
            label="Brand Evaluation (Sistema Antiguo)" 
            value={(context?.conversationInsights as any)?.brand_evaluation ? 
              `Score: ${(context?.conversationInsights as any)?.brand_evaluation?.score || 0}` : 
              'No disponible'
            } 
            status={(context?.conversationInsights as any)?.brand_evaluation ? 'ok' : 'warning'}
          />
          
          <IntegrityItem 
            label="Master State - Brand Score" 
            value={masterState.marca.score} 
            status={masterState.marca.score > 0 ? 'ok' : 'warning'}
          />
          
          <IntegrityItem 
            label="Master State - Tienda" 
            value={masterState.tienda.has_shop ? 'Activa' : 'No configurada'} 
            status={masterState.tienda.has_shop ? 'ok' : 'warning'}
          />
        </div>

        {/* Issues */}
        {integrityReport.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Problemas Detectados</h4>
            {integrityReport.issues.map((issue, index) => {
              const config = severityConfig[issue.severity];
              const Icon = config.icon;
              
              return (
                <Alert key={index} className={`${config.bgColor} ${config.borderColor}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <AlertTitle className="text-sm font-medium">
                    {issue.severity.toUpperCase()} - {issue.source}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {issue.message}
                    {issue.recommendation && (
                      <div className="mt-2 text-xs italic">
                        💡 Recomendación: {issue.recommendation}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!integrityReport.isHealthy && (
            <Button 
              onClick={handleAutoRepair}
              disabled={isRepairing}
              variant="default"
              className="flex-1"
            >
              {isRepairing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reparando...
                </>
              ) : (
                <>
                  🔧 Intentar Auto-Reparación
                </>
              )}
            </Button>
          )}
          
          <Button 
            onClick={refreshData}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refrescar Datos
          </Button>
        </div>

        {/* Last Check */}
        <div className="text-xs text-muted-foreground text-center">
          Última verificación: {integrityReport.lastCheck.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
