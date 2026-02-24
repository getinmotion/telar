/**
 * Growth Module Validator Component
 * 
 * Componente temporal para ejecutar y mostrar la validación del módulo de Growth
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { validateGrowthModule, generateValidationReport, ValidationResult } from '@/utils/growthModuleValidator';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Shield } from 'lucide-react';

export const GrowthModuleValidator: React.FC = () => {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [report, setReport] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = () => {
    setIsValidating(true);
    
    try {
      console.log('🔍 Running Growth Module validation...');
      const validationResult = validateGrowthModule();
      const reportText = generateValidationReport(validationResult);
      
      setResult(validationResult);
      setReport(reportText);
      
      console.log(reportText);
      
      if (validationResult.allPassed) {
        console.log('✅ All validations PASSED!');
      } else {
        console.error('❌ Some validations FAILED!');
      }
    } catch (error) {
      console.error('Error running validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    // Auto-run on mount
    runValidation();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'} className="gap-1">
        {status ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {label}
      </Badge>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Growth Module Validator</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Estado del módulo bloqueado y certificado
                </p>
              </div>
            </div>
            <Button onClick={runValidation} disabled={isValidating} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              Re-validar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {result && (
        <>
          {/* Status Summary */}
          <Card className={result.allPassed ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${result.allPassed ? 'bg-green-500' : 'bg-red-500'}`}>
                  {result.allPassed ? (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  ) : (
                    <XCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">
                    {result.allPassed ? '✅ Validación EXITOSA' : '❌ Validación FALLIDA'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.allPassed
                      ? 'Todas las validaciones del módulo Growth pasaron correctamente'
                      : `${result.errors.length} error(es) encontrado(s)`}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(result.allPassed, result.allPassed ? 'CERTIFICADO' : 'NECESITA CORRECCIÓN')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validaciones Individuales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CheckItem
                  label="Checkpoints cada 3 preguntas"
                  status={result.checkpointsWork}
                  icon={getStatusIcon(result.checkpointsWork)}
                />
                <CheckItem
                  label="Banners correctos"
                  status={result.bannersCorrect}
                  icon={getStatusIcon(result.bannersCorrect)}
                />
                <CheckItem
                  label="Banners compactos"
                  status={result.bannersCompact}
                  icon={getStatusIcon(result.bannersCompact)}
                />
                <CheckItem
                  label="Sin banner repetir en dashboard"
                  status={result.noRepeatBannerInDashboard}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                  note="(verificación manual)"
                />
                <CheckItem
                  label="Dictado funciona"
                  status={result.dictationWorks}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                  note="(verificación runtime)"
                />
                <CheckItem
                  label="AI extraction funciona"
                  status={result.aiExtractionWorks}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                  note="(verificación runtime)"
                />
                <CheckItem
                  label="Wizard usable"
                  status={result.wizardUsable}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                  note="(verificación runtime)"
                />
                <CheckItem
                  label="Camino Artesanal válido"
                  status={result.caminoArtesanalValid}
                  icon={getStatusIcon(result.caminoArtesanalValid)}
                />
                <CheckItem
                  label="Debug Artisan recibe data"
                  status={result.debugArtisanWorks}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                  note="(verificación runtime)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {result.errors.length > 0 && (
            <Card className="border-red-500 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Errores Detectados ({result.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span className="text-red-800">{error}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Card className="border-amber-500 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-lg text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Advertencias ({result.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-600 mt-0.5">⚠️</span>
                      <span className="text-amber-800">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Full Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reporte Completo (Consola)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono">
                {report}
              </pre>
            </CardContent>
          </Card>

          {/* Documentation Link */}
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Documentación del Módulo</h4>
                  <p className="text-sm text-muted-foreground">
                    Revisa la documentación completa del módulo bloqueado
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open('/docs/GROWTH_MODULE_LOCKED.md', '_blank')}
                >
                  Ver Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Helper component for check items
interface CheckItemProps {
  label: string;
  status: boolean;
  icon: React.ReactNode;
  note?: string;
}

const CheckItem: React.FC<CheckItemProps> = ({ label, status, icon, note }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
};
