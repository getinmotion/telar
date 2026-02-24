import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Truck, 
  MapPin,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { useShopOrders, orderRequiresShipping, orderNeedsTracking, ShopOrder } from '@/hooks/useShopOrders';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type FilterTab = 'all' | 'pending' | 'shipped' | 'delivered' | 'pickup';

export default function ShopSalesPage() {
  const navigate = useNavigate();
  const { shop } = useArtisanShop();
  const { orders, loading, stats, fetchOrders, updateTrackingNumber, markAsPickedUp } = useShopOrders(shop?.id);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter orders based on active tab and search
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by tab
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(o => 
          (o.status === 'pending' || o.status === 'confirmed') && 
          orderRequiresShipping(o)
        );
        break;
      case 'shipped':
        filtered = filtered.filter(o => o.status === 'shipped' || o.fulfillment_status === 'shipped');
        break;
      case 'delivered':
        filtered = filtered.filter(o => o.status === 'delivered' || o.fulfillment_status === 'fulfilled');
        break;
      case 'pickup':
        filtered = filtered.filter(o => !orderRequiresShipping(o));
        break;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_number.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.customer_email.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [orders, activeTab, searchTerm]);

  // Chart data - aggregate orders by date
  const chartData = useMemo(() => {
    const dateMap = new Map<string, number>();
    
    orders.forEach(order => {
      if (order.payment_status === 'paid') {
        const date = format(new Date(order.created_at), 'dd MMM', { locale: es });
        dateMap.set(date, (dateMap.get(date) || 0) + order.total);
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, total]) => ({ date, total }))
      .slice(-7); // Last 7 days with sales
  }, [orders]);

  const handleSaveTracking = async () => {
    if (!selectedOrder || !trackingInput.trim()) return;
    
    setIsSubmitting(true);
    const success = await updateTrackingNumber(selectedOrder.id, trackingInput.trim());
    setIsSubmitting(false);
    
    if (success) {
      setTrackingDialogOpen(false);
      setTrackingInput('');
      setSelectedOrder(null);
    }
  };

  const handleMarkAsPickedUp = async (order: ShopOrder) => {
    await markAsPickedUp(order.id);
  };

  const openTrackingDialog = (order: ShopOrder) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || '');
    setTrackingDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (order: ShopOrder) => {
    const isPickup = !orderRequiresShipping(order);
    
    if (order.status === 'delivered' || order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'picked_up') {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {isPickup ? 'Recogido' : 'Entregado'}
      </Badge>;
    }
    
    if (order.status === 'shipped' || order.fulfillment_status === 'shipped') {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
        <Truck className="w-3 h-3 mr-1" />
        Enviado
      </Badge>;
    }
    
    if (isPickup) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
        <MapPin className="w-3 h-3 mr-1" />
        Retiro local
      </Badge>;
    }
    
    if (orderNeedsTracking(order)) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
        <AlertCircle className="w-3 h-3 mr-1" />
        Sin guía
      </Badge>;
    }
    
    return <Badge className="bg-muted text-muted-foreground">
      <Clock className="w-3 h-3 mr-1" />
      Pendiente
    </Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Orden', 'Fecha', 'Cliente', 'Email', 'Total', 'Estado', 'Método Envío'];
    const rows = orders.map(o => [
      o.order_number,
      format(new Date(o.created_at), 'dd/MM/yyyy HH:mm'),
      o.customer_name,
      o.customer_email,
      o.total,
      o.status,
      orderRequiresShipping(o) ? 'Servientrega' : 'Retiro local'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No tienes una tienda configurada</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mis Ventas - {shop.shop_name} | Telar</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/mi-tienda')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Mis Ventas</h1>
                  <p className="text-sm text-muted-foreground">{shop.shop_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ingresos totales</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {loading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Package className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total órdenes</p>
                    <p className="text-xl font-bold text-blue-400">
                      {loading ? <Skeleton className="h-6 w-12" /> : stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Truck className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sin guía</p>
                    <p className="text-xl font-bold text-amber-400">
                      {loading ? <Skeleton className="h-6 w-12" /> : stats.pendingTracking}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Retiros locales</p>
                    <p className="text-xl font-bold text-purple-400">
                      {loading ? <Skeleton className="h-6 w-12" /> : stats.pickupOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ventas recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        fill="url(#salesGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Orders List */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Órdenes</CardTitle>
                  <CardDescription>Gestiona tus ventas y envíos</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar orden..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    Todas ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pendientes
                  </TabsTrigger>
                  <TabsTrigger value="shipped">
                    Enviadas
                  </TabsTrigger>
                  <TabsTrigger value="delivered">
                    Entregadas
                  </TabsTrigger>
                  <TabsTrigger value="pickup">
                    Retiros ({stats.pickupOrders})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No hay órdenes en esta categoría</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map(order => (
                        <OrderRow
                          key={order.id}
                          order={order}
                          onAddTracking={() => openTrackingDialog(order)}
                          onMarkAsPickedUp={() => handleMarkAsPickedUp(order)}
                          formatCurrency={formatCurrency}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar número de guía</DialogTitle>
              <DialogDescription>
                Ingresa el número de guía de Servientrega para la orden {selectedOrder?.order_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tracking">Número de guía Servientrega</Label>
                <Input
                  id="tracking"
                  placeholder="Ej: 1234567890"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTracking} disabled={!trackingInput.trim() || isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar guía'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// Order Row Component
function OrderRow({ 
  order, 
  onAddTracking, 
  onMarkAsPickedUp,
  formatCurrency,
  getStatusBadge
}: { 
  order: ShopOrder;
  onAddTracking: () => void;
  onMarkAsPickedUp: () => void;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (order: ShopOrder) => React.ReactNode;
}) {
  const isPickup = !orderRequiresShipping(order);
  const needsTracking = orderNeedsTracking(order);
  const isDelivered = order.status === 'delivered' || order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'picked_up';
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium">{order.order_number}</span>
            {getStatusBadge(order)}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm font-medium">{order.customer_name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {order.customer_email}
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {order.customer_phone}
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
            <p className="text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isDelivered && (
              <>
                {isPickup ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={onMarkAsPickedUp}
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Marcar recogido
                  </Button>
                ) : needsTracking ? (
                  <Button 
                    size="sm" 
                    onClick={onAddTracking}
                    className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    Agregar guía
                  </Button>
                ) : order.tracking_number ? (
                  <Badge variant="outline" className="font-mono">
                    Guía: {order.tracking_number}
                  </Badge>
                ) : null}
              </>
            )}

            {order.customer_phone && (
              <Button
                size="sm"
                variant="ghost"
                asChild
              >
                <a 
                  href={`https://wa.me/57${order.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Items preview */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex flex-wrap gap-2">
          {items.map((item: any, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {item.quantity}x {item.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
