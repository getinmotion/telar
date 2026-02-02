
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Settings, Home } from 'lucide-react';
import { DashboardBackground } from './DashboardBackground';

interface DashboardErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({ 
  error, 
  onRetry 
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <DashboardBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-xl text-gray-900">Error en el Taller Digital</CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Algo salió mal al cargar tu taller digital. Puedes intentar las siguientes opciones:
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              
              <Button 
                onClick={() => navigate('/maturity-calculator')} 
                className="w-full" 
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Ir a Configuración
              </Button>
              
              <Button 
                onClick={() => navigate('/')} 
                className="w-full" 
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Si el problema persiste, intenta limpiar el caché del navegador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardBackground>
  );
};
