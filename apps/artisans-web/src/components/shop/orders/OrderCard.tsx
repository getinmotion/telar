import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { TrackingInfo } from './TrackingInfo';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ShopOrder } from '@/hooks/useShopOrders';

interface OrderCardProps {
  order: ShopOrder;
  onUpdateTracking: (orderId: string, tracking: string) => Promise<boolean>;
  onUpdateStatus: (orderId: string, status: string) => Promise<boolean>;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateTracking,
  onUpdateStatus,
}) => {
  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <Badge className="bg-success/20 text-success border-success/30">💳 Pagado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">⏳ Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">❌ Fallido</Badge>;
      default:
        return <Badge variant="outline">{status || 'Desconocido'}</Badge>;
    }
  };

  const getFulfillmentStatusBadge = (status?: string) => {
    switch (status) {
      case 'fulfilled':
        return <Badge className="bg-success/20 text-success border-success/30">✅ Entregado</Badge>;
      case 'shipped':
        return <Badge className="bg-primary/20 text-primary border-primary/30">🚚 Enviado</Badge>;
      case 'partial':
        return <Badge variant="secondary">📦 Parcial</Badge>;
      case 'unfulfilled':
      default:
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">📋 Por enviar</Badge>;
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Sin dirección';
    if (typeof address === 'string') return address;
    
    const parts = [
      address.line1 || address.address,
      address.line2,
      address.city || address.desc_ciudad,
      address.state || address.desc_depart,
      address.postal_code
    ].filter(Boolean);
    
    return parts.join(', ') || 'Sin dirección';
  };

  const parseItems = (items: any) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    try {
      return JSON.parse(items);
    } catch {
      return [];
    }
  };

  const orderItems = parseItems(order.items);
  const isPaid = order.payment_status === 'paid' || order.payment_status === 'completed';
  
  // Detectar si es pickup (retiro en local)
  const isPickup = order.shipping_address?.method === 'pickup' || 
                   order.shipping_cost === 0 && (!order.shipping_address || Object.keys(order.shipping_address).length === 0);
  
  // Solo necesita guía si NO es pickup
  const needsTracking = isPaid && !order.tracking_number && order.fulfillment_status !== 'fulfilled' && !isPickup;

  return (
    <Card className={`p-4 space-y-4 ${needsTracking ? 'border-warning/50 bg-warning/5' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-foreground">#{order.order_number}</h4>
            {needsTracking && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <AlertCircle className="w-3 h-3 mr-1" />
                Requiere guía
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {format(new Date(order.created_at), "d MMM yyyy, HH:mm", { locale: es })}
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          {getPaymentStatusBadge(order.payment_status)}
          {getFulfillmentStatusBadge(order.fulfillment_status)}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{order.customer_name}</span>
        </div>
        {order.customer_phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <a href={`tel:${order.customer_phone}`} className="hover:text-primary">
              {order.customer_phone}
            </a>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="w-3 h-3" />
          <a href={`mailto:${order.customer_email}`} className="hover:text-primary">
            {order.customer_email}
          </a>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            {isPickup ? (
              <span className="text-primary font-medium">📍 Retiro en local</span>
            ) : (
              formatAddress(order.shipping_address)
            )}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Package className="w-3 h-3" />
          Productos ({orderItems.length})
        </h5>
        <div className="space-y-1">
          {orderItems.map((item: any, idx: number) => {
            const productName = item.product_name || item.name || 'Producto';
            const productImage = item.product_image || item.image;
            const variantInfo = item.variant_name ? ` (${item.variant_name})` : '';
            
            return (
              <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  {productImage && (
                    <img 
                      src={productImage} 
                      alt={productName}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-foreground">
                    {item.quantity}x {productName}{variantInfo}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  ${(item.price * item.quantity).toLocaleString('es-CO')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-lg font-bold text-foreground">
          ${order.total.toLocaleString('es-CO')}
        </span>
      </div>

      {/* Tracking Section - Solo para envíos, no pickup */}
      {isPaid && !isPickup && (
        <div className="pt-2 border-t border-border">
          <TrackingInfo
            trackingNumber={order.tracking_number}
            fulfillmentStatus={order.fulfillment_status}
            onSaveTracking={(tracking) => onUpdateTracking(order.id, tracking)}
          />
        </div>
      )}

      {/* Pickup Actions */}
      {isPaid && isPickup && order.fulfillment_status !== 'fulfilled' && order.fulfillment_status !== 'picked_up' && (
        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'picked_up')}
            className="bg-primary hover:bg-primary/90"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Marcar como Retirado
          </Button>
        </div>
      )}

      {/* Actions para órdenes con envío */}
      {order.tracking_number && !isPickup && (
        <div className="flex justify-end gap-2 pt-2">
          {order.fulfillment_status !== 'shipped' && order.fulfillment_status !== 'fulfilled' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(order.id, 'shipped')}
              className="bg-primary hover:bg-primary/90"
            >
              <Truck className="w-4 h-4 mr-1" />
              Marcar como Enviado
            </Button>
          )}
          {order.fulfillment_status === 'shipped' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(order.id, 'fulfilled')}
              className="text-success border-success/30 hover:bg-success/10"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Marcar como Entregado
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
