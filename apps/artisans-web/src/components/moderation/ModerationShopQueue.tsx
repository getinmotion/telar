import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, CheckCircle, Package, AlertCircle, CreditCard } from 'lucide-react';
import { ModerationShop } from '@/hooks/useShopModeration';
import { ModerationPagination } from './ModerationPagination';

interface ModerationShopQueueProps {
  shops: ModerationShop[];
  selectedShopId: string | null;
  onSelectShop: (shop: ModerationShop) => void;
  loading: boolean;
  selectedShops?: string[];
  onToggleSelection?: (shopId: string) => void;
  selectionMode?: boolean;
  // Pagination props
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export const ModerationShopQueue: React.FC<ModerationShopQueueProps> = ({
  shops,
  selectedShopId,
  onSelectShop,
  loading,
  selectedShops = [],
  onToggleSelection,
  selectionMode = false,
  pagination,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Store className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
        <p className="font-medium text-foreground">No hay tiendas</p>
        <p className="text-sm text-muted-foreground">
          No se encontraron tiendas con los filtros aplicados
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {shops.map((shop) => {
            const isSelected = selectedShopId === shop.id;
            const isApproved = shop.marketplace_approved === true;
            const isChecked = selectedShops.includes(shop.id);
            
            return (
              <Card
                key={shop.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${isChecked ? 'bg-primary/5 border-primary/30' : ''}`}
                onClick={() => onSelectShop(shop)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Checkbox for selection mode */}
                    {selectionMode && onToggleSelection && (
                      <div 
                        className="flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelection(shop.id);
                        }}
                      >
                        <Checkbox 
                          checked={isChecked}
                          onCheckedChange={() => onToggleSelection(shop.id)}
                        />
                      </div>
                    )}
                    
                    {/* Logo */}
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt={shop.shop_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {shop.shop_name}
                        </h4>
                        {isApproved ? (
                          <Badge variant="default" className="shrink-0 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Marketplace
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            No aprobada
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {shop.region && (
                          <span className="flex items-center gap-1">
                            📍 {shop.region}
                          </span>
                        )}
                        {shop.craft_type && (
                          <span className="flex items-center gap-1">
                            🎨 {shop.craft_type}
                          </span>
                        )}
                      </div>

                      {/* Bank Data Badge */}
                      <div className="flex items-center gap-2 mt-2">
                        {shop.has_bank_data ? (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                            <CreditCard className="w-3 h-3 mr-1" />
                            Datos bancarios ✓
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                            <CreditCard className="w-3 h-3 mr-1" />
                            Sin datos bancarios
                          </Badge>
                        )}
                      </div>

                      {shop.product_counts && (
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {shop.product_counts.total} productos
                          </span>
                          <span className="text-success">
                            ✓ {shop.product_counts.approved} aprobados
                          </span>
                          {shop.product_counts.pending > 0 && (
                            <span className="text-warning">
                              ⏳ {shop.product_counts.pending} pendientes
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <ModerationPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.pageSize}
          onPageChange={onPageChange}
          loading={loading}
        />
      )}
    </div>
  );
};
