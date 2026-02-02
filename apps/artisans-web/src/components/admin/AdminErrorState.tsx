import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title = 'Error al cargar datos',
  message = 'No se pudieron cargar los datos. Verifica tu conexión e intenta de nuevo.',
  onRetry,
  isRetrying = false
}) => {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <WifiOff className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{message}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            disabled={isRetrying}
            className="border-destructive/50 hover:bg-destructive/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Reintentando...' : 'Reintentar'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
