import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModerationDashboard } from '@/components/moderation/ModerationDashboard';
import { useModerationStats } from '@/hooks/useModerationStats';

const BackofficeHomePage: React.FC = () => {
  const { stats, loading, fetchStats } = useModerationStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Operaciones</h1>
          <p className="text-sm text-muted-foreground">
            Resumen en tiempo real de productos, tiendas y datos bancarios
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <ModerationDashboard stats={stats} loading={loading} />
    </div>
  );
};

export default BackofficeHomePage;
