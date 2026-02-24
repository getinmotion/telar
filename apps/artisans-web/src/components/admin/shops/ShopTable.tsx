import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShopWithMetrics } from '@/hooks/useAdminShops';
import { ShopActionsDropdown } from './ShopActionsDropdown';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Store, Package, CreditCard, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopTableProps {
  shops: ShopWithMetrics[];
  selectedShops: string[];
  onToggleSelect: (shopId: string) => void;
  onSelectAll: () => void;
  onApprove: (shopId: string) => Promise<void>;
  onReject: (shopId: string, reason?: string) => Promise<void>;
  onTogglePublish: (shopId: string, publish: boolean) => Promise<void>;
  onDelete: (shopId: string, reason: string) => Promise<void>;
  onCreateCobre: (shopId: string) => Promise<void>;
  actionLoading: string | null;
  loading?: boolean;
}

export const ShopTable: React.FC<ShopTableProps> = ({
  shops,
  selectedShops,
  onToggleSelect,
  onSelectAll,
  onApprove,
  onReject,
  onTogglePublish,
  onDelete,
  onCreateCobre,
  actionLoading,
  loading,
}) => {
  const allSelected = shops.length > 0 && selectedShops.length === shops.length;
  const someSelected = selectedShops.length > 0 && selectedShops.length < shops.length;

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-t border-border bg-background" />
          ))}
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay tiendas</h3>
        <p className="text-sm text-muted-foreground">
          No se encontraron tiendas con los filtros actuales
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as any).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Tienda</TableHead>
            <TableHead>Región</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Productos</TableHead>
            <TableHead className="text-center">Cobre</TableHead>
            <TableHead>Creación</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => (
            <TableRow 
              key={shop.id}
              className={cn(selectedShops.includes(shop.id) && "bg-primary/5")}
            >
              <TableCell>
                <Checkbox
                  checked={selectedShops.includes(shop.id)}
                  onCheckedChange={() => onToggleSelect(shop.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={shop.logo_url || undefined} alt={shop.shop_name} />
                    <AvatarFallback className="rounded-lg bg-primary/10">
                      <Store className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{shop.shop_name}</p>
                    <p className="text-xs text-muted-foreground">/{shop.shop_slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{shop.region || '-'}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{shop.craft_type || '-'}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-center gap-1">
                  {shop.marketplace_approved ? (
                    <Badge variant="default" className="bg-emerald-600 text-xs">
                      Marketplace
                    </Badge>
                  ) : shop.active ? (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                      Pendiente
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                      Inactiva
                    </Badge>
                  )}
                  {shop.featured && (
                    <Badge variant="outline" className="text-xs">
                      Destacada
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{shop.total_products}</span>
                  {shop.pending_products > 0 && (
                    <span className="text-xs text-amber-600">
                      ({shop.pending_products} pend.)
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {shop.id_contraparty ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(shop.created_at), 'dd MMM yyyy', { locale: es })}
                </span>
              </TableCell>
              <TableCell>
                <ShopActionsDropdown
                  shop={shop}
                  onApprove={onApprove}
                  onReject={onReject}
                  onTogglePublish={onTogglePublish}
                  onDelete={onDelete}
                  onCreateCobre={onCreateCobre}
                  loading={actionLoading === shop.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
