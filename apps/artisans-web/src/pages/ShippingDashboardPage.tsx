import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Truck, Package, Search, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShippingAnalytics } from '@/hooks/useShippingAnalytics';
import { useSubdomain } from '@/hooks/useSubdomain';
import { ModerationHeader } from '@/components/moderation/ModerationHeader';
import { BoxSimulatorTab } from '@/components/shipping-dashboard/BoxSimulatorTab';
import { BulkQuoterTab } from '@/components/shipping-dashboard/BulkQuoterTab';
import { ArtisanExplorerTab } from '@/components/shipping-dashboard/ArtisanExplorerTab';
import { CoverageOverviewTab } from '@/components/shipping-dashboard/CoverageOverviewTab';

const ShippingDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isModerationSubdomain } = useSubdomain();
  const { shopsData, loading, error, fetchShopsData } = useShippingAnalytics();

  useEffect(() => {
    fetchShopsData();
  }, [fetchShopsData]);

  const goBack = () => {
    navigate(isModerationSubdomain ? '/' : '/moderacion');
  };

  return (
    <div className="min-h-screen">
      {isModerationSubdomain && <ModerationHeader />}

      <div className={isModerationSubdomain ? 'pt-16' : ''}>
        {/* Title bar */}
        <div className="border-b border-white/50 glass-header">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={goBack}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Dashboard de Envios</h1>
                  <p className="text-sm text-muted-foreground">
                    Simulador y analitica de costos de envio con Servientrega
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchShopsData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {error && (
            <Card className="mb-4 border-destructive">
              <CardContent className="p-4 text-destructive text-sm">
                Error cargando datos: {error}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="simulador" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="simulador" className="gap-1">
                <Truck className="w-3 h-3" />
                <span className="hidden sm:inline">Simulador Cajas</span>
                <span className="sm:hidden">Simular</span>
              </TabsTrigger>
              <TabsTrigger value="masivo" className="gap-1">
                <Package className="w-3 h-3" />
                <span className="hidden sm:inline">Cotizador Masivo</span>
                <span className="sm:hidden">Masivo</span>
              </TabsTrigger>
              <TabsTrigger value="explorador" className="gap-1">
                <Search className="w-3 h-3" />
                <span className="hidden sm:inline">Explorador Artesanos</span>
                <span className="sm:hidden">Explorar</span>
              </TabsTrigger>
              <TabsTrigger value="cobertura" className="gap-1">
                <BarChart3 className="w-3 h-3" />
                <span className="hidden sm:inline">Cobertura General</span>
                <span className="sm:hidden">Cobertura</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simulador">
              <BoxSimulatorTab />
            </TabsContent>

            <TabsContent value="masivo">
              <BulkQuoterTab shopsData={shopsData} />
            </TabsContent>

            <TabsContent value="explorador">
              <ArtisanExplorerTab shopsData={shopsData} />
            </TabsContent>

            <TabsContent value="cobertura">
              <CoverageOverviewTab shopsData={shopsData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ShippingDashboardPage;
