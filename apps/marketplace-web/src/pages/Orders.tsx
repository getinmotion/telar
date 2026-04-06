import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Package, CreditCard, Gift, ChevronDown, Truck, AlertCircle, Wallet, Banknote, MapPin, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/currencyUtils';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  product_image?: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  payment_method: string;
  notes: string | null;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  estimated_delivery_date: string | null;
  shipping_address_id: string | null;
  subtotal: number | null;
  shipping_cost: number | null;
  gift_card_discount: number | null;
  gift_card_code: string | null;
  delivery_method: string | null;
  paid_amount: number | null;
  order_items: OrderItem[];
}

interface OrdersProps {
  orders: Order[];
}

const Orders = ({ orders }: OrdersProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleViewOrder = (cartId: string) => {
    setSearchParams({ tab: 'orders', carrito: cartId });
  };

  const statusConfig: Record<string, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    explanation: string;
  }> = {
    open: {
      label: 'Pendiente',
      variant: 'secondary',
      icon: <Clock className="h-4 w-4" />,
      explanation: 'Tu pedido está siendo procesado. Te notificaremos cuando sea confirmado.'
    },
    converted: {
      label: 'Confirmado',
      variant: 'default',
      icon: <CheckCircle2 className="h-4 w-4" />,
      explanation: 'Tu pedido ha sido confirmado y está siendo preparado para envío.'
    },
    shipped: {
      label: 'Enviado',
      variant: 'default',
      icon: <Truck className="h-4 w-4" />,
      explanation: 'Tu pedido está en camino. Puedes rastrear el envío con el número de guía.'
    },
    delivered: {
      label: 'Entregado',
      variant: 'default',
      icon: <CheckCircle2 className="h-4 w-4" />,
      explanation: 'Tu pedido ha sido entregado exitosamente. ¡Disfruta tus productos artesanales!'
    },
    cancelled: {
      label: 'Cancelado',
      variant: 'destructive',
      icon: <XCircle className="h-4 w-4" />,
      explanation: 'Este pedido fue cancelado y no será procesado.'
    }
  };

  const getStatusBadge = (status: string) => {
    console.log('status', status)
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodInfo = (method: string) => {
    const methodMap: Record<string, { label: string; icon: React.ReactNode }> = {
      credit_card: { label: 'Tarjeta de crédito', icon: <CreditCard className="h-4 w-4" /> },
      debit_card: { label: 'Tarjeta débito', icon: <CreditCard className="h-4 w-4" /> },
      pse: { label: 'PSE', icon: <Banknote className="h-4 w-4" /> },
      nequi: { label: 'Nequi', icon: <Wallet className="h-4 w-4" /> },
      gift_card: { label: 'Gift Card', icon: <Gift className="h-4 w-4" /> },
      cash_on_delivery: { label: 'Pago contraentrega', icon: <Banknote className="h-4 w-4" /> },
    };
    return methodMap[method] || { label: method, icon: <Wallet className="h-4 w-4" /> };
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tienes pedidos aún</p>
          <Button className="mt-4" onClick={() => navigate('/productos')}>
            Explorar Productos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const paymentInfo = getPaymentMethodInfo(order.payment_method);
        const statusInfo = statusConfig[order.status] || statusConfig.pending;

        return (
          <Card key={order.id}>
            <CardHeader className="pb-3 px-4 md:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <CardTitle className="text-base md:text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {new Date(order.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </div>
              {/* Status explanation */}
              <div className="mt-2 flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{statusInfo.explanation}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 md:px-6">
              {/* Products section */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Productos ({order.order_items.length})
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name || 'Producto'}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name || 'Producto artesanal'}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity} × ${item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* <Separator /> */}

              {/* Order details section */}
              {/* <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Detalles del pedido
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="space-y-3 text-sm bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Desglose del pago
                    </h4>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal productos</span>
                      <span>${(order.subtotal || order.total || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {order.delivery_method === 'pickup' ? (
                          <>
                            <MapPin className="h-3 w-3" />
                            Envío (Retiro en local)
                          </>
                        ) : (
                          <>
                            <Truck className="h-3 w-3" />
                            Envío (Servientrega)
                          </>
                        )}
                      </span>
                      <span>
                        {order.delivery_method === 'pickup' ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          `+$${(order.shipping_cost || 0).toLocaleString()}`
                        )}
                      </span>
                    </div>

                    <Separator className="my-2" />

                    {(order.gift_card_discount !== null && order.gift_card_discount > 0) && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1">
                          <Gift className="h-4 w-4" />
                          Pagado con Gift Card
                          {order.gift_card_code && (
                            <span className="text-xs font-mono bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                              {order.gift_card_code}
                            </span>
                          )}
                        </span>
                        <span className="font-medium">-{formatCurrency(order.gift_card_discount)}</span>
                      </div>
                    )}

                    {(order.paid_amount !== null && order.paid_amount > 0) && (
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {paymentInfo.icon}
                          Pagado con {order.payment_method === 'gift_card' ? 'Breve' : paymentInfo.label}
                        </span>
                        <span className="font-medium">{formatCurrency(order.paid_amount)}</span>
                      </div>
                    )}

                    {order.payment_method === 'gift_card' && (order.paid_amount === null || order.paid_amount === 0) && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                        <Gift className="h-5 w-5" />
                        <span className="font-medium">Pagado al 100% con Gift Card</span>
                      </div>
                    )}

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>TOTAL</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground pt-2">
                      <span>Fecha del pedido</span>
                      <span>{new Date(order.created_at).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {order.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground block mb-1">Notas:</span>
                        <p className="text-foreground">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible> */}

              {/* Shipping section - only show if has tracking or shipped */}
              {/* {(order.tracking_number || order.shipped_at || order.status === 'shipped' || order.status === 'delivered') && (
                <>
                  <Separator />
                  <Collapsible defaultOpen={order.status === 'shipped'}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Información de envío
                      </span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="space-y-3 text-sm bg-muted/30 rounded-lg p-4">
                        {order.carrier && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Transportadora</span>
                            <span className="capitalize font-medium">{order.carrier}</span>
                          </div>
                        )}
                        {order.tracking_number && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Número de guía</span>
                            <span className="font-mono font-medium">{order.tracking_number}</span>
                          </div>
                        )}
                        {order.shipped_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de envío</span>
                            <span>{new Date(order.shipped_at).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                        )}
                        {order.estimated_delivery_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Entrega estimada</span>
                            <span className="font-medium text-primary">
                              {new Date(order.estimated_delivery_date).toLocaleDateString('es-CO', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )} */}

              <Separator />
              <div className="pt-2">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => handleViewOrder(order.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver compra
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Orders;
