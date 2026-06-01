import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { ModerationShop } from '@/hooks/useShopModeration';
import { ModerationPagination } from './ModerationPagination';
import { cn } from '@/lib/utils';

interface ModerationShopQueueProps {
  shops: ModerationShop[];
  selectedShopId: string | null;
  onSelectShop: (shop: ModerationShop) => void;
  loading: boolean;
  selectedShops?: string[];
  onToggleSelection?: (shopId: string) => void;
  selectionMode?: boolean;
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
      <div className="p-2 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-2.5 px-2 py-2 rounded animate-pulse">
            <Skeleton className="w-10 h-10 rounded shrink-0" />
            <div className="flex-1 space-y-1.5 py-0.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
        <Store className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-xs">No hay tiendas con estos filtros</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-1.5 space-y-0.5">
          {shops.map((shop) => {
            const isSelected = selectedShopId === shop.id;
            const isApproved = shop.marketplaceApproved === true;
            const isChecked = selectedShops.includes(shop.id);

            return (
              <div
                key={shop.id}
                className={cn(
                  "flex gap-2.5 px-2 py-2 rounded-md cursor-pointer transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isChecked
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "hover:bg-muted/70"
                )}
                onClick={() => onSelectShop(shop)}
              >
                {selectionMode && onToggleSelection && (
                  <div
                    className="flex items-center shrink-0"
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
                <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                  {shop.logoUrl ? (
                    <img
                      src={shop.logoUrl}
                      alt={shop.shopName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-medium truncate leading-tight",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {shop.shopName}
                  </p>

                  <div className={cn(
                    "flex items-center gap-1.5 mt-0.5 text-[11px]",
                    isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {isApproved ? (
                      <span className="flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 text-success" />
                        Marketplace
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3 text-warning" />
                        Sin aprobar
                      </span>
                    )}
                    {shop.hasBankData ? (
                      <span className="flex items-center gap-0.5">
                        <CreditCard className="w-3 h-3 text-success" />
                        Banco ✓
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-destructive/70">
                        <CreditCard className="w-3 h-3" />
                        Sin banco
                      </span>
                    )}
                  </div>

                  {(shop.region || shop.craftType) && (
                    <p className={cn(
                      "text-[10px] truncate mt-0.5",
                      isSelected ? "text-primary-foreground/60" : "text-muted-foreground/70"
                    )}>
                      {[shop.region, shop.craftType].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

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
