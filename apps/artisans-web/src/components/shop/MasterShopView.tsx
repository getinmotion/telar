import React, { useEffect, useState } from 'react';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Store, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const MasterShopView: React.FC = () => {
  const { masterState, refreshModule, isLoading } = useMasterAgent();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Refresh shop module on mount
    refreshModule('tienda');
    refreshModule('inventario');
    refreshModule('marca');
  }, [refreshModule]);

  useEffect(() => {
    // Generate recommendations based on current state
    if (masterState.tienda.has_shop) {
      const recs: string[] = [];
      
      if (masterState.inventario.sin_precio.length > 0) {
        recs.push(`Hay ${masterState.inventario.sin_precio.length} productos sin precio asignado`);
      }
      
      if (masterState.inventario.productos.length < 3) {
        recs.push('Añade más productos para hacer tu tienda más atractiva (mínimo recomendado: 5)');
      }
      
      if (!masterState.tienda.published) {
        recs.push('Tu tienda está en modo borrador. Publícala para que tus clientes puedan verla');
      }
      
      if (masterState.marca.score < 70) {
        recs.push('Mejora tu marca para que tu tienda tenga una identidad más profesional');
      }

      setRecommendations(recs);
    }
  }, [masterState]);

  const handleCreateShop = () => {
    // Navigate to shop creation with prefilled data
    navigate('/dashboard/create-shop', {
      state: {
        prefillBrand: masterState.marca,
        prefillProducts: masterState.inventario.productos,
      }
    });
  };

  const handleViewShop = () => {
    if (masterState.tienda.url) {
      window.open(`/shop/${masterState.tienda.url}`, '_blank');
    }
  };

  const handleEditShop = () => {
    navigate(`/dashboard/shop/${masterState.tienda.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Shop doesn't exist - Show creation wizard
  if (!masterState.tienda.has_shop) {
    const hasBrandData = masterState.marca.logo || masterState.marca.colores.length > 0;
    const hasProducts = masterState.inventario.productos.length > 0;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Crear Tu Tienda Online</CardTitle>
                <CardDescription>
                  {hasBrandData && hasProducts
                    ? 'Tienes todo listo para crear tu tienda'
                    : 'Completa algunos pasos antes de crear tu tienda'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prerequisites check */}
            <div className="space-y-4">
              <h3 className="font-semibold">Requisitos para crear tu tienda:</h3>
              
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${hasBrandData ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${hasBrandData ? 'bg-primary/10' : 'bg-muted'}`}>
                    {hasBrandData ? '✓' : '○'}
                  </div>
                  <span>Identidad de marca (logo y colores)</span>
                </div>
                
                <div className={`flex items-center gap-2 ${hasProducts ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${hasProducts ? 'bg-primary/10' : 'bg-muted'}`}>
                    {hasProducts ? '✓' : '○'}
                  </div>
                  <span>Al menos un producto en tu inventario</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {hasBrandData && hasProducts ? (
                <Button onClick={handleCreateShop} size="lg" className="w-full">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Crear Mi Tienda Ahora
                </Button>
              ) : (
                <>
                  {!hasBrandData && (
                    <Button
                      onClick={() => navigate('/dashboard/brand')}
                      variant="outline"
                      className="w-full"
                    >
                      Configurar Mi Marca
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  
                  {!hasProducts && (
                    <Button
                      onClick={() => navigate('/dashboard/inventory')}
                      variant="outline"
                      className="w-full"
                    >
                      Añadir Productos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Shop exists - Show overview and recommendations
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Shop Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Tu Tienda: {masterState.perfil.nombre}</CardTitle>
                <CardDescription>
                  {masterState.tienda.published ? (
                    <span className="text-primary">✓ Publicada y visible para clientes</span>
                  ) : (
                    <span className="text-accent">● En modo borrador</span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleViewShop} variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Tienda
              </Button>
              <Button onClick={handleEditShop}>
                Editar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/20 rounded-lg">
              <div className="text-3xl font-bold text-primary">{masterState.tienda.products_count}</div>
              <div className="text-sm text-muted-foreground">Productos</div>
            </div>
            <div className="text-center p-4 bg-secondary/20 rounded-lg">
              <div className="text-3xl font-bold text-primary">{masterState.inventario.stock_total}</div>
              <div className="text-sm text-muted-foreground">Stock Total</div>
            </div>
            <div className="text-center p-4 bg-secondary/20 rounded-lg">
              <div className="text-3xl font-bold text-primary">{masterState.marca.score}%</div>
              <div className="text-sm text-muted-foreground">Score de Marca</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recomendaciones para Mejorar Tu Tienda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
