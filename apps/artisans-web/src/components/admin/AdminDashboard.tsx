import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, Store, Package, ShoppingCart, AlertCircle, TrendingUp, 
  CheckCircle, DollarSign, Truck, CreditCard, Clock, AlertTriangle,
  ArrowRight, Eye, Ticket, Wallet, RefreshCw, Gift, MapPin
} from 'lucide-react';
import { useAdminStats, RecentOrder, RecentTransaction, CobreBalance, ShopStats } from '@/hooks/useAdminStats';
import { AdminSyncIndicator } from './AdminSyncIndicator';
import { AdminErrorState } from './AdminErrorState';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminDashboard = ({ onNavigateToTab }: AdminDashboardProps) => {
  const { stats, isLoading, isError, refetch, dataUpdatedAt, isFetching } = useAdminStats();

  if (isError) {
    return (
      <AdminErrorState 
        title="Error al cargar estadísticas"
        message="No se pudieron cargar las estadísticas del dashboard. Verifica tu conexión e intenta de nuevo."
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

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
        return <Badge className="bg-success/20 text-success border-success/30">Completado</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Enviado</Badge>;
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
      default:
        return <Badge variant="outline">{status || 'Sin pago'}</Badge>;
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    badge, 
    subtitle,
    onClick,
    trend
  }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: number;
    subtitle?: string;
    onClick?: () => void;
    trend?: { value: number; label: string };
  }) => (
    <Card 
      className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <span className="inline-block w-16 h-7 bg-muted animate-pulse rounded" />
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-success mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend.label}
          </p>
        )}
        {badge !== undefined && badge > 0 && (
          <Badge variant="destructive" className="mt-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            {badge} pendientes
          </Badge>
        )}
        {onClick && (
          <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalles <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AlertCard = ({ 
    title, 
    count, 
    icon: Icon, 
    color, 
    description,
    actionLabel,
    onAction
  }: {
    title: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    if (count === 0) return null;
    
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${color}`}>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-bold">{count}</Badge>
          {actionLabel && onAction && (
            <Button size="sm" variant="ghost" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Administrativo</h2>
          <p className="text-muted-foreground">
            Resumen general de la plataforma
          </p>
        </div>
        <AdminSyncIndicator
          lastUpdated={dataUpdatedAt}
          isFetching={isFetching}
          isError={isError}
          onRefresh={() => refetch()}
        />
      </div>

      {/* Alerts Section */}
      {(stats?.pendingModeration || 0) + (stats?.overdueOrders || 0) + (stats?.expiringCoupons || 0) > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Alertas</h3>
          <div className="grid gap-2">
            <AlertCard
              title="Productos pendientes de moderación"
              count={stats?.pendingModeration || 0}
              icon={Package}
              color="bg-orange-50 border-orange-200 text-orange-700"
              description="Requieren revisión antes de publicarse"
              actionLabel="Revisar"
              onAction={() => onNavigateToTab?.('moderation')}
            />
            <AlertCard
              title="Órdenes sin enviar (> 3 días)"
              count={stats?.overdueOrders || 0}
              icon={AlertTriangle}
              color="bg-red-50 border-red-200 text-red-700"
              description="Órdenes con envío pendiente hace más de 3 días"
              actionLabel="Ver"
              onAction={() => onNavigateToTab?.('orders')}
            />
            <AlertCard
              title="Cupones por vencer"
              count={stats?.expiringCoupons || 0}
              icon={Ticket}
              color="bg-yellow-50 border-yellow-200 text-yellow-700"
              description="Cupones que vencen en los próximos 7 días"
              actionLabel="Ver"
              onAction={() => onNavigateToTab?.('promotions')}
            />
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Usuarios Totales"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="text-primary"
          onClick={() => onNavigateToTab?.('users')}
        />
        <StatCard
          title="Tiendas"
          value={stats?.shopStats?.total ?? stats?.totalShops ?? 0}
          icon={Store}
          color="text-secondary"
          subtitle={`${stats?.shopStats?.active ?? stats?.activeShops ?? 0} activas • ${stats?.shopStats?.published ?? 0} publicadas`}
        />
        <StatCard
          title="Productos"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          color="text-accent"
          badge={stats?.pendingModeration}
          subtitle={`${stats?.publishedProducts ?? 0} publicados`}
          onClick={() => onNavigateToTab?.('moderation')}
        />
        <StatCard
          title="Órdenes Totales"
          value={stats?.totalOrders ?? 0}
          icon={ShoppingCart}
          color="text-success"
          subtitle={`${stats?.recentOrders ?? 0} últimos 7 días`}
          onClick={() => onNavigateToTab?.('orders')}
        />
      </div>

      {/* Cobre Balance Card */}
      {stats?.cobreBalance && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Balance Cobre
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
              {stats.cobreBalance.currency}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Disponible</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(stats.cobreBalance.available)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendiente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(stats.cobreBalance.pending)}
                </p>
              </div>
            </div>
            {stats.cobreBalance.lastUpdated && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Actualizado: {new Date(stats.cobreBalance.lastUpdated).toLocaleTimeString('es-CO')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shop Breakdown Card */}
      {stats?.shopStats && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Store className="h-5 w-5 text-secondary" />
              Desglose de Tiendas
            </CardTitle>
            <Badge variant="outline">{stats.shopStats.total} total</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Estado</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activas</span>
                  <Badge className="bg-success/20 text-success border-success/30">{stats.shopStats.active}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inactivas</span>
                  <Badge variant="outline">{stats.shopStats.inactive}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Publicación</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Publicadas</span>
                  <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">{stats.shopStats.published}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sin publicar</span>
                  <Badge variant="outline">{stats.shopStats.pendingPublish}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Marketplace</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Aprobadas</span>
                  <Badge className="bg-success/20 text-success border-success/30">{stats.shopStats.marketplaceApproved}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pendientes</span>
                  <Badge className="bg-warning/20 text-warning border-warning/30">{stats.shopStats.marketplacePending}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Datos Bancarios</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Con datos</span>
                  <Badge className="bg-success/20 text-success border-success/30">{stats.shopStats.withBankData}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sin datos</span>
                  <Badge variant="destructive">{stats.shopStats.withoutBankData}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={DollarSign}
          color="text-success"
          subtitle="Gift Cards + Pagos reales"
        />
        <StatCard
          title="Gift Cards Vendidas"
          value={formatCurrency(stats?.giftCardRevenue ?? 0)}
          icon={Gift}
          color="text-purple-500"
          subtitle={`Mes: ${formatCurrency(stats?.monthlyGiftCardRevenue ?? 0)}`}
        />
        <StatCard
          title="Pagos Reales"
          value={formatCurrency(stats?.realMoneyRevenue ?? 0)}
          icon={CreditCard}
          color="text-blue-500"
          subtitle={`Shipping/BreBe: ${formatCurrency(stats?.monthlyRealMoneyRevenue ?? 0)}`}
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(stats?.monthlyRevenue ?? 0)}
          icon={TrendingUp}
          color="text-emerald-500"
          subtitle="Mes actual"
        />
        <StatCard
          title="Pendientes de Envío"
          value={stats?.pendingShipment ?? 0}
          icon={Truck}
          color="text-orange-500"
          subtitle={`${stats?.pendingPickup ?? 0} pickups pendientes`}
          onClick={() => onNavigateToTab?.('orders')}
        />
      </div>

      {/* Pickup indicator if any */}
      {(stats?.pendingPickup ?? 0) > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">{stats?.pendingPickup} órdenes de recogida en tienda pendientes</span>
        </div>
      )}

      {/* Recent Transactions and System Status */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Transactions Table (Orders + Gift Cards) */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Transacciones Recientes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigateToTab?.('orders')}
              className="text-primary"
            >
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentTransactions.slice(0, 7).map((tx: RecentTransaction) => (
                    <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm font-medium">
                        {tx.type === 'order' ? `#${tx.reference}` : tx.reference}
                      </TableCell>
                      <TableCell>
                        {tx.type === 'gift_card' ? (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                            <Gift className="h-3 w-3 mr-1" />
                            Gift Card
                          </Badge>
                        ) : tx.isPickup ? (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                            <MapPin className="h-3 w-3 mr-1" />
                            Pickup
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Truck className="h-3 w-3 mr-1" />
                            Envío
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{tx.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{tx.details}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{formatCurrency(tx.total)}</span>
                          {tx.type === 'order' && tx.giftCardUsed && (
                            <span className="text-xs text-muted-foreground">
                              {tx.giftCardAmount && tx.giftCardAmount > 0 && (
                                <span className="text-purple-600">GC: {formatCurrency(tx.giftCardAmount)}</span>
                              )}
                              {tx.realMoneyAmount && tx.realMoneyAmount > 0 && (
                                <span className="text-emerald-600"> | Envío: {formatCurrency(tx.realMoneyAmount)}</span>
                              )}
                              {(!tx.realMoneyAmount || tx.realMoneyAmount === 0) && (
                                <span className="text-purple-600"> (100% GC)</span>
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tx.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No hay transacciones recientes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status and Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Operativo</div>
              <p className="text-xs text-muted-foreground mt-2">
                Todas las funciones activas • Auto-refresh 60s
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base de datos</span>
                  <Badge className="bg-success/20 text-success">OK</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pagos</span>
                  <Badge className="bg-success/20 text-success">OK</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <Badge className="bg-success/20 text-success">OK</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderación Pendiente</CardTitle>
              <Clock className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <span className="inline-block w-8 h-7 bg-muted animate-pulse rounded" />
                ) : (
                  stats?.pendingModeration ?? 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Productos esperando revisión
              </p>
              {(stats?.pendingModeration ?? 0) > 0 && (
                <Button 
                  size="sm" 
                  className="w-full mt-3" 
                  onClick={() => onNavigateToTab?.('moderation')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Revisar ahora
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
