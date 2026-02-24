import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCw, Search, Filter, Download, ShoppingCart, 
  Eye, ChevronLeft, ChevronRight, Package, CreditCard,
  MapPin, Truck, Gift
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  isPickupOrder, 
  isGiftCardPayment, 
  getRealRevenueFromOrder,
  getGiftCardAmount 
} from '@/utils/orderHelpers';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total: number;
  subtotal: number;
  status: string;
  payment_status: string | null;
  fulfillment_status: string | null;
  payment_method: string | null;
  shipping_cost: number | null;
  shipping_address: any;
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  shop_id: string;
  shop_name?: string;
  items: any[];
}

export function AdminOrdersPanel() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          artisan_shops(shop_name)
        `, { count: 'exact' });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('fulfillment_status', statusFilter);
      }
      if (paymentFilter !== 'all') {
        query = query.eq('payment_status', paymentFilter);
      }
      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      let formattedOrders: Order[] = (data || []).map((order: any) => ({
        ...order,
        shop_name: order.artisan_shops?.shop_name,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));

      // Apply type filter client-side
      if (typeFilter === 'pickup') {
        formattedOrders = formattedOrders.filter(isPickupOrder);
      } else if (typeFilter === 'shipping') {
        formattedOrders = formattedOrders.filter(o => !isPickupOrder(o));
      }

      setOrders(formattedOrders);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las órdenes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter, typeFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'fulfilled':
      case 'picked_up':
        return <Badge className="bg-success/20 text-success border-success/30">Entregado</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Enviado</Badge>;
      case 'processing':
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Procesando</Badge>;
      case 'pending':
      case 'unfulfilled':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pendiente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status || 'Sin estado'}</Badge>;
    }
  };

  const getPaymentBadge = (status: string | null) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <Badge className="bg-success/20 text-success border-success/30">Pagado</Badge>;
      case 'pending':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{status || 'Sin pago'}</Badge>;
    }
  };

  const getTypeBadge = (order: Order) => {
    if (isPickupOrder(order)) {
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
          <MapPin className="w-3 h-3 mr-1" />
          Pickup
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
        <Truck className="w-3 h-3 mr-1" />
        Envío
      </Badge>
    );
  };

  const getPaymentBreakdown = (order: Order) => {
    const isGC = isGiftCardPayment(order);
    const gcAmount = getGiftCardAmount(order);
    const realMoney = getRealRevenueFromOrder(order);
    
    if (isGC) {
      if (realMoney > 0) {
        return (
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1 text-purple-600">
              <Gift className="w-3 h-3" />
              <span>GC: {formatCurrency(gcAmount)}</span>
            </div>
            <div className="text-success">
              + Envío: {formatCurrency(realMoney)}
            </div>
          </div>
        );
      }
      return (
        <span className="text-xs text-purple-600 flex items-center gap-1">
          <Gift className="w-3 h-3" />
          100% Gift Card
        </span>
      );
    }
    return null;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const exportToCSV = () => {
    const headers = ['Orden', 'Cliente', 'Email', 'Tipo', 'Total', 'Ingreso Real', 'Estado Envío', 'Estado Pago', 'Guía', 'Tienda', 'Fecha'];
    const rows = orders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      isPickupOrder(order) ? 'Pickup' : 'Envío',
      order.total,
      getRealRevenueFromOrder(order),
      order.fulfillment_status || order.status,
      order.payment_status || '',
      order.tracking_number || '',
      order.shop_name || '',
      format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ordenes_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();

    toast({
      title: 'Exportación exitosa',
      description: `${orders.length} órdenes exportadas a CSV`
    });
  };

  // Calculate summary stats with corrected logic
  const realRevenue = orders.reduce((sum, o) => sum + getRealRevenueFromOrder(o), 0);
  const pickupOrders = orders.filter(isPickupOrder);
  const shippingOrders = orders.filter(o => !isPickupOrder(o));
  const pendingShipping = shippingOrders.filter(o => 
    !o.fulfillment_status || 
    o.fulfillment_status === 'pending' || 
    o.fulfillment_status === 'unfulfilled'
  ).length;
  const pendingPickup = pickupOrders.filter(o => 
    o.fulfillment_status !== 'picked_up' && 
    o.fulfillment_status !== 'fulfilled'
  ).length;
  const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.payment_status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Órdenes</h2>
          <p className="text-muted-foreground">
            {totalCount} órdenes en total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={orders.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Reales</p>
                <p className="text-xl font-bold">{formatCurrency(realRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Truck className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pend. Envío</p>
                <p className="text-xl font-bold">{pendingShipping}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pend. Pickup</p>
                <p className="text-xl font-bold">{pendingPickup}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagadas</p>
                <p className="text-xl font-bold">{paidOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En página</p>
                <p className="text-xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por orden, cliente o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="shipping">Envío</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado envío" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="picked_up">Retirado</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No se encontraron órdenes</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Guía</TableHead>
                  <TableHead>Envío</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold">
                      <div>
                        <span>#{order.order_number}</span>
                        {order.shop_name && (
                          <p className="text-xs text-muted-foreground font-normal">{order.shop_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(order)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        {getPaymentBreakdown(order)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.tracking_number ? (
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {order.tracking_number}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.fulfillment_status || order.status)}
                    </TableCell>
                    <TableCell>
                      {getPaymentBadge(order.payment_status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" title="Ver detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} de {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm px-3">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}