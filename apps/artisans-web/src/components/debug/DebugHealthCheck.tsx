import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthCheckItem {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message?: string;
}

interface DebugHealthCheckProps {
  items: HealthCheckItem[];
  lastUpdate?: string;
}

export const DebugHealthCheck: React.FC<DebugHealthCheckProps> = ({ items, lastUpdate }) => {
  const getStatusIcon = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'error':
        return 'border-red-200 bg-red-50/50';
      case 'info':
        return 'border-blue-200 bg-blue-50/50';
    }
  };

  const successCount = items.filter(i => i.status === 'success').length;
  const warningCount = items.filter(i => i.status === 'warning').length;
  const errorCount = items.filter(i => i.status === 'error').length;

  const overallStatus = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success';
  const overallColor = 
    overallStatus === 'error' ? 'text-red-600' :
    overallStatus === 'warning' ? 'text-yellow-600' :
    'text-green-600';

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Health Check</h3>
            <p className="text-sm text-muted-foreground">Sistema de diagnóstico rápido</p>
          </div>
          <div className="text-right">
            <div className={cn("text-3xl font-bold", overallColor)}>
              {successCount}/{items.length}
            </div>
            <p className="text-xs text-muted-foreground">checks passed</p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
                getStatusColor(item.status)
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.label}</p>
                {item.message && (
                  <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {lastUpdate && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Última actualización: {lastUpdate}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
