import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODERATION_STATUS_LABELS } from '@/constants/moderation-copy';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Truck,
  FileText,
  ShieldCheck,
  BookOpen,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubdomain } from '@/hooks/useSubdomain';
import { useAuthStore } from '@/stores/authStore';
import { ModerationStats, ShopSummary, ProductSummary } from '@/hooks/useModerationStats';
import { ModerationDrillDownModal } from './ModerationDrillDownModal';

interface ModerationDashboardProps {
  stats: ModerationStats;
  loading?: boolean;
  onShopClick?: (shop: ShopSummary) => void;
  onProductClick?: (product: ProductSummary) => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  variant = 'default', 
  subtitle,
  onClick
}) => {
  const variantClasses = {
    default: 'border-border',
    success: 'border-l-4 border-l-success',
    warning: 'border-l-4 border-l-warning',
    destructive: 'border-l-4 border-l-destructive',
    info: 'border-l-4 border-l-primary',
  };

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md', 
        variantClasses[variant],
        onClick && 'cursor-pointer hover:bg-accent/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

type DrillDownType = 
  | 'products_pending' 
  | 'products_approved' 
  | 'products_approved_edits'
  | 'products_changes_requested'
  | 'products_rejected'
  | 'products_draft'
  | 'shops_all'
  | 'shops_marketplace_approved'
  | 'shops_not_approved'
  | 'shops_published'
  | 'shops_pending_publish'
  | 'shops_with_bank'
  | 'shops_without_bank';

interface DrillDownConfig {
  title: string;
  type: 'shops' | 'products';
  shops?: ShopSummary[];
  products?: ProductSummary[];
}

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  stats,
  loading,
  onShopClick,
  onProductClick
}) => {
  const navigate = useNavigate();
  const { isModerationSubdomain } = useSubdomain();
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin === true);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownConfig, setDrillDownConfig] = useState<DrillDownConfig | null>(null);

  const openDrillDown = (drillType: DrillDownType) => {
    const configs: Record<DrillDownType, DrillDownConfig> = {
      products_pending: {
        title: `Productos Pendientes (${stats.products.pending_moderation})`,
        type: 'products',
        products: stats.productDetails.pending_moderation,
      },
      products_approved: {
        title: `${MODERATION_STATUS_LABELS['approved']} (${stats.products.approved})`,
        type: 'products',
        products: stats.productDetails.approved,
      },
      products_approved_edits: {
        title: `${MODERATION_STATUS_LABELS['approved_with_edits']} (${stats.products.approved_with_edits})`,
        type: 'products',
        products: stats.productDetails.approved_with_edits,
      },
      products_changes_requested: {
        title: `${MODERATION_STATUS_LABELS['changes_requested']} (${stats.products.changes_requested})`,
        type: 'products',
        products: stats.productDetails.changes_requested,
      },
      products_rejected: {
        title: `${MODERATION_STATUS_LABELS['rejected']} (${stats.products.rejected})`,
        type: 'products',
        products: stats.productDetails.rejected,
      },
      products_draft: {
        title: `Productos en Borrador (${stats.products.draft})`,
        type: 'products',
        products: stats.productDetails.draft,
      },
      shops_all: {
        title: `Todas las Tiendas (${stats.shops.all})`,
        type: 'shops',
        shops: stats.shopDetails.all,
      },
      shops_marketplace_approved: {
        title: `Tiendas en Marketplace (${stats.shops.approved})`,
        type: 'shops',
        shops: stats.shopDetails.approved,
      },
      shops_not_approved: {
        title: `Tiendas Sin Aprobar (${stats.shops.not_approved})`,
        type: 'shops',
        shops: stats.shopDetails.notApproved,
      },
      shops_published: {
        title: `Tiendas Publicadas (${stats.publishedShops})`,
        type: 'shops',
        shops: stats.shopDetails.published,
      },
      shops_pending_publish: {
        title: `Tiendas Pendientes de Publicar (${stats.pendingPublishShops})`,
        type: 'shops',
        shops: stats.shopDetails.pendingPublish,
      },
      shops_with_bank: {
        title: `Tiendas con Datos Bancarios (${stats.shopsWithBankData})`,
        type: 'shops',
        shops: stats.shopDetails.withBankData,
      },
      shops_without_bank: {
        title: `Tiendas sin Datos Bancarios (${stats.shopsWithoutBankData})`,
        type: 'shops',
        shops: stats.shopDetails.withoutBankData,
      },
    };

    setDrillDownConfig(configs[drillType]);
    setDrillDownOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const bankDataPercentage = stats.shops.all > 0 
    ? Math.round((stats.shopsWithBankData / stats.shops.all) * 100) 
    : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Products Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Productos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Pendientes"
              value={stats.products.pending_moderation}
              icon={<Clock className="w-5 h-5 text-warning" />}
              variant="warning"
              onClick={() => openDrillDown('products_pending')}
            />
            <StatCard
              title={MODERATION_STATUS_LABELS['approved']}
              value={stats.products.approved}
              icon={<CheckCircle className="w-5 h-5 text-success" />}
              variant="success"
              onClick={() => openDrillDown('products_approved')}
            />
            <StatCard
              title={MODERATION_STATUS_LABELS['approved_with_edits']}
              value={stats.products.approved_with_edits}
              icon={<CheckCircle className="w-5 h-5 text-success" />}
              variant="success"
              onClick={() => openDrillDown('products_approved_edits')}
            />
            <StatCard
              title={MODERATION_STATUS_LABELS['changes_requested']}
              value={stats.products.changes_requested}
              icon={<AlertCircle className="w-5 h-5 text-warning" />}
              variant="warning"
              onClick={() => openDrillDown('products_changes_requested')}
            />
            <StatCard
              title={MODERATION_STATUS_LABELS['rejected']}
              value={stats.products.rejected}
              icon={<XCircle className="w-5 h-5 text-destructive" />}
              variant="destructive"
              onClick={() => openDrillDown('products_rejected')}
            />
            <StatCard
              title="Borradores"
              value={stats.products.draft}
              icon={<Package className="w-5 h-5 text-muted-foreground" />}
              onClick={() => openDrillDown('products_draft')}
            />
          </div>
        </div>

        {/* Shops Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Store className="w-4 h-4" />
            Tiendas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total tiendas"
              value={stats.shops.all}
              icon={<Store className="w-5 h-5 text-primary" />}
              variant="info"
              onClick={() => openDrillDown('shops_all')}
            />
            <StatCard
              title="Marketplace ✓"
              value={stats.shops.approved}
              icon={<CheckCircle className="w-5 h-5 text-success" />}
              variant="success"
              onClick={() => openDrillDown('shops_marketplace_approved')}
            />
            <StatCard
              title="Sin aprobar"
              value={stats.shops.not_approved}
              icon={<Clock className="w-5 h-5 text-warning" />}
              variant="warning"
              onClick={() => openDrillDown('shops_not_approved')}
            />
            <StatCard
              title="Publicadas"
              value={stats.publishedShops}
              icon={<TrendingUp className="w-5 h-5 text-success" />}
              variant="success"
              onClick={() => openDrillDown('shops_published')}
            />
            <StatCard
              title="Pendiente publicar"
              value={stats.pendingPublishShops}
              icon={<Clock className="w-5 h-5 text-muted-foreground" />}
              onClick={() => openDrillDown('shops_pending_publish')}
            />
          </div>
        </div>

        {/* Bank Data Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Datos Bancarios
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              title="Con datos bancarios"
              value={stats.shopsWithBankData}
              icon={<CreditCard className="w-5 h-5 text-success" />}
              variant="success"
              subtitle={`${bankDataPercentage}% del total`}
              onClick={() => openDrillDown('shops_with_bank')}
            />
            <StatCard
              title="Sin datos bancarios"
              value={stats.shopsWithoutBankData}
              icon={<CreditCard className="w-5 h-5 text-destructive" />}
              variant="destructive"
              onClick={() => openDrillDown('shops_without_bank')}
            />
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Completitud</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{ width: `${bankDataPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{bankDataPercentage}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Acciones rápidas — grid responsive */}
        <div className="pt-2 space-y-3">
          {isSuperAdmin && (
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
              Super-admin
            </div>
          )}
          {isSuperAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11"
                onClick={() =>
                  navigate(
                    isModerationSubdomain ? '/usuarios' : '/moderacion/usuarios',
                  )
                }
              >
                <ShieldCheck className="w-4 h-4 flex-none" />
                <span className="truncate">Gestión de Usuarios</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11"
                onClick={() =>
                  navigate(
                    isModerationSubdomain
                      ? '/historias-cms'
                      : '/moderacion/historias-cms',
                  )
                }
              >
                <BookOpen className="w-4 h-4 flex-none" />
                <span className="truncate">Historias / Blog</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11"
                onClick={() =>
                  navigate(
                    isModerationSubdomain
                      ? '/colecciones-cms'
                      : '/moderacion/colecciones-cms',
                  )
                }
              >
                <Layers className="w-4 h-4 flex-none" />
                <span className="truncate">Colecciones</span>
              </Button>
            </div>
          )}

          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold pt-2">
            Operación
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="default"
              className="w-full justify-start gap-2 h-11"
              onClick={() =>
                navigate(
                  isModerationSubdomain
                    ? '/revisor-productos'
                    : '/moderacion/revisor-productos',
                )
              }
            >
              <ClipboardList className="w-4 h-4 flex-none" />
              <span className="truncate">Revisor de Productos</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-11"
              onClick={() =>
                navigate(
                  isModerationSubdomain
                    ? '/envios-dashboard'
                    : '/moderacion/envios-dashboard',
                )
              }
            >
              <Truck className="w-4 h-4 flex-none" />
              <span className="truncate">Dashboard de Envíos</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-11"
              onClick={() =>
                navigate(isModerationSubdomain ? '/cms' : '/moderacion/cms')
              }
            >
              <FileText className="w-4 h-4 flex-none" />
              <span className="truncate">CMS Editorial</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-11"
              onClick={() =>
                navigate(
                  isModerationSubdomain ? '/analytics' : '/moderacion/analytics',
                )
              }
            >
              <BarChart3 className="w-4 h-4 flex-none" />
              <span className="truncate">Analytics Productos</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Drill Down Modal */}
      {drillDownConfig && (
        <ModerationDrillDownModal
          isOpen={drillDownOpen}
          onClose={() => setDrillDownOpen(false)}
          title={drillDownConfig.title}
          type={drillDownConfig.type}
          shops={drillDownConfig.shops}
          products={drillDownConfig.products}
          onShopClick={onShopClick}
          onProductClick={onProductClick}
        />
      )}
    </>
  );
};
