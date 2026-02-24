import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, AlertCircle, ArrowRight, Store } from 'lucide-react';
import { useShopOrders } from '@/hooks/useShopOrders';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function ShopSalesMiniCard() {
  const navigate = useNavigate();
  const { shop, loading: shopLoading } = useArtisanShop();
  const { stats, loading } = useShopOrders(shop?.id);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount}`;
  };

  // Don't show if user has no shop
  if (shopLoading) {
    return (
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!shop) {
    return null;
  }

  const hasAlert = stats.pendingTracking > 0;

  return (
    <Card 
      className={`bg-card/50 hover:bg-card/80 transition-colors cursor-pointer ${
        hasAlert ? 'border-amber-500/30' : ''
      }`}
      onClick={() => navigate('/mi-tienda/ventas')}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Mi Tienda</p>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                {shop.shop_name}
              </p>
            </div>
          </div>
          {hasAlert && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats.pendingTracking}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
            <DollarSign className="h-3 w-3 mx-auto text-emerald-400 mb-1" />
            {loading ? (
              <Skeleton className="h-5 w-12 mx-auto" />
            ) : (
              <p className="text-sm font-bold text-emerald-400">
                {formatCurrency(stats.totalRevenue)}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">Ingresos</p>
          </div>
          
          <div className="bg-blue-500/10 rounded-lg p-2 text-center">
            <Package className="h-3 w-3 mx-auto text-blue-400 mb-1" />
            {loading ? (
              <Skeleton className="h-5 w-8 mx-auto" />
            ) : (
              <p className="text-sm font-bold text-blue-400">{stats.total}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Ventas</p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-xs h-7"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/mi-tienda/ventas');
          }}
        >
          Ver ventas
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
