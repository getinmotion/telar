import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, Truck, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { useShopOrders } from '@/hooks/useShopOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesMiniDashboardProps {
  shopId: string;
}

export function SalesMiniDashboard({ shopId }: SalesMiniDashboardProps) {
  const navigate = useNavigate();
  const { stats, loading } = useShopOrders(shopId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!shopId) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Mis Ventas
          </CardTitle>
          {stats.pendingTracking > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats.pendingTracking} sin guía
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main revenue stat */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-lg p-4 border border-emerald-500/20">
          <p className="text-sm text-muted-foreground mb-1">Ingresos totales</p>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(stats.totalRevenue)}
            </p>
          )}
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Package className="h-4 w-4 mx-auto mb-1 text-blue-400" />
            {loading ? (
              <Skeleton className="h-6 w-8 mx-auto" />
            ) : (
              <p className="text-lg font-bold">{stats.total}</p>
            )}
            <p className="text-xs text-muted-foreground">Órdenes</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Truck className="h-4 w-4 mx-auto mb-1 text-amber-400" />
            {loading ? (
              <Skeleton className="h-6 w-8 mx-auto" />
            ) : (
              <p className="text-lg font-bold">{stats.pendingTracking}</p>
            )}
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/30">
            <MapPin className="h-4 w-4 mx-auto mb-1 text-purple-400" />
            {loading ? (
              <Skeleton className="h-6 w-8 mx-auto" />
            ) : (
              <p className="text-lg font-bold">{stats.pickupOrders}</p>
            )}
            <p className="text-xs text-muted-foreground">Retiros</p>
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={() => navigate('/mi-tienda/ventas')}
          className="w-full"
          variant="outline"
        >
          Ver todas las ventas
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

