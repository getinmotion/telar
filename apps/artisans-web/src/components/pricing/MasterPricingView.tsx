import React, { useEffect } from 'react';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Sparkles, Calculator } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const MasterPricingView: React.FC = () => {
  const { masterState, refreshModule, invokeAgent, isLoading } = useMasterAgent();
  const navigate = useNavigate();

  useEffect(() => {
    refreshModule('inventario');
    refreshModule('pricing');
  }, [refreshModule]);

  const hasCostSheets = masterState.pricing.hojas_costos.length > 0;
  const hasProducts = masterState.inventario.productos.length > 0;

  const handleGeneratePricing = async () => {
    const response = await invokeAgent({
      agent: 'pricing',
      action: 'generate',
      payload: {
        products: masterState.inventario.productos,
      }
    });

    if (response.status === 'success') {
      await refreshModule('pricing');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No products - Show message
  if (!hasProducts) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Calculadora de Precios</CardTitle>
                <CardDescription>
                  Necesitas productos en tu inventario primero
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Para calcular precios, primero debes tener productos en tu inventario.
            </p>

            <Button onClick={() => navigate('/dashboard/inventory')} className="w-full">
              Ir a Inventario
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No cost sheets - Show generation
  if (!hasCostSheets) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Generar Hoja de Costos</CardTitle>
                <CardDescription>
                  Calcula precios óptimos para tus productos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                La IA analizará tus productos y generará hojas de costos considerando:
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Costos de materiales y producción</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Tiempo de elaboración</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Márgenes de ganancia recomendados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Precios de mercado comparables</span>
                </li>
              </ul>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Se generarán hojas de costos para {masterState.inventario.productos.length} productos
                </p>
              </div>
            </div>

            <Button onClick={handleGeneratePricing} size="lg" className="w-full">
              <Sparkles className="mr-2 h-5 w-5" />
              Generar Hojas de Costos con IA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has cost sheets - Show review
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hojas de Costos</h2>
          <p className="text-muted-foreground">
            Última actualización: {new Date(masterState.pricing.last_update || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGeneratePricing} variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Recalcular
          </Button>
          {masterState.tienda.has_shop && (
            <Button onClick={() => {
              // TODO: Push prices to shop
              console.log('Pushing prices to shop...');
            }}>
              <DollarSign className="mr-2 h-4 w-4" />
              Actualizar Precios en Tienda
            </Button>
          )}
        </div>
      </div>

      {/* Cost Sheets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Costo Materiales</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead>Precio Sugerido</TableHead>
                <TableHead>Margen</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterState.pricing.hojas_costos.map((sheet: any) => {
                const product = masterState.inventario.productos.find((p: any) => p.id === sheet.product_id);
                const margin = sheet.suggested_price ? 
                  ((sheet.suggested_price - sheet.material_cost) / sheet.suggested_price * 100).toFixed(0) : 
                  0;

                return (
                  <TableRow key={sheet.id}>
                    <TableCell>
                      <div className="font-semibold">{product?.name || 'Producto'}</div>
                    </TableCell>
                    <TableCell>${sheet.material_cost?.toLocaleString() || 0}</TableCell>
                    <TableCell>{sheet.production_time || '-'}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${sheet.suggested_price?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>{margin}%</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => navigate(`/dashboard/pricing/edit/${sheet.id}`)}
                        variant="ghost"
                        size="sm"
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
