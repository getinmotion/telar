
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Settings, User } from 'lucide-react';
import { DashboardBackground } from './DashboardBackground';

interface DashboardEmergencyFallbackProps {
  onRetry: () => void;
  onGoToOnboarding: () => void;
  onGoToMaturityCalculator: () => void;
  error?: string;
}

export const DashboardEmergencyFallback: React.FC<DashboardEmergencyFallbackProps> = ({
  onRetry,
  onGoToOnboarding,
  onGoToMaturityCalculator,
  error
}) => {
  return (
    <DashboardBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Dashboard Temporalmente Inaccesible</CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Estamos experimentando algunos problemas técnicos. Puedes intentar algunas opciones:
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button onClick={onRetry} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar Cargar Dashboard
              </Button>
              
              <Button onClick={onGoToOnboarding} className="w-full" variant="outline">
                <User className="w-4 h-4 mr-2" />
                Ir a Configuración Inicial
              </Button>
              
              <Button onClick={onGoToMaturityCalculator} className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Calculadora de Madurez
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Si el problema persiste, intenta refrescar la página o contacta soporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardBackground>
  );
};
