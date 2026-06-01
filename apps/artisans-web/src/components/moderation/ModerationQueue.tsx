import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModerationStatusBadge } from "./ModerationStatusBadge";
import { ModerationPagination } from "./ModerationPagination";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Store, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModerationProduct } from "@/hooks/useProductModeration";

interface ModerationQueueProps {
  products: ModerationProduct[];
  selectedProductId: string | null;
  onSelectProduct: (product: ModerationProduct) => void;
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export const ModerationQueue: React.FC<ModerationQueueProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  loading,
  pagination,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="p-2 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-2.5 px-2 py-2 rounded animate-pulse">
            <div className="w-10 h-10 bg-muted rounded shrink-0" />
            <div className="flex-1 space-y-1.5 py-0.5">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
        <Package className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-xs">No hay productos en esta cola</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-1.5 space-y-0.5">
          {products.map((product) => {
            const imageUrl =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "/placeholder.svg";
            const isSelected = selectedProductId === product.id;

            return (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={cn(
                  "w-full flex gap-2.5 px-2 py-2 rounded-md text-left transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/70"
                )}
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-10 h-10 rounded object-cover bg-muted shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-medium truncate leading-tight",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {product.name}
                  </p>
                  <p className={cn(
                    "text-[11px] truncate mt-0.5 flex items-center gap-1",
                    isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    <Store className="w-2.5 h-2.5 shrink-0" />
                    {product.artisan_shops?.shop_name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <ModerationStatusBadge
                      status={product.moderation_status}
                      size="sm"
                    />
                    <span className={cn(
                      "text-[10px]",
                      isSelected ? "text-primary-foreground/60" : "text-muted-foreground"
                    )}>
                      {formatDistanceToNow(new Date(product.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </button>
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
