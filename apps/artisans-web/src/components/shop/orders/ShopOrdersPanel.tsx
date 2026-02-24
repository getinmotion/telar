import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useShopOrders } from '@/hooks/useShopOrders';
import { OrderCard } from './OrderCard';
import { motion } from 'framer-motion';

interface ShopOrdersPanelProps {
  shopId: string | undefined;
}

export const ShopOrdersPanel: React.FC<ShopOrdersPanelProps> = ({ shopId }) => {
  const { 
    orders, 
    loading, 
    stats, 
    fetchOrders,
    updateTrackingNumber, 
    updateFulfillmentStatus 
  } = useShopOrders(shopId);

  if (loading) {
    return (
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Mis Ventas</h3>
          <Badge variant="secondary" className="ml-1">
            {stats.total}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchOrders}
          className="h-8 w-8"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-warning/10 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-warning" />
          </div>
          <div className="text-lg font-bold text-foreground">{stats.pending}</div>
          <div className="text-xs text-muted-foreground">Pendientes</div>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Package className="w-3 h-3 text-primary" />
          </div>
          <div className="text-lg font-bold text-foreground">{stats.processing}</div>
          <div className="text-xs text-muted-foreground">Procesando</div>
        </div>
        <div className="bg-accent/10 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Truck className="w-3 h-3 text-accent" />
          </div>
          <div className="text-lg font-bold text-foreground">{stats.shipped}</div>
          <div className="text-xs text-muted-foreground">Enviados</div>
        </div>
        <div className="bg-success/10 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3 text-success" />
          </div>
          <div className="text-lg font-bold text-foreground">{stats.delivered}</div>
          <div className="text-xs text-muted-foreground">Entregados</div>
        </div>
      </div>

      {/* Alert for orders needing tracking */}
      {stats.pendingTracking > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg"
        >
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <span className="text-sm text-foreground">
            <strong>{stats.pendingTracking}</strong> {stats.pendingTracking === 1 ? 'pedido requiere' : 'pedidos requieren'} número de guía
          </span>
        </motion.div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No tienes ventas aún</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tus pedidos aparecerán aquí cuando los clientes compren tus productos
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4 pr-2">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <OrderCard
                  order={order}
                  onUpdateTracking={updateTrackingNumber}
                  onUpdateStatus={updateFulfillmentStatus}
                />
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
