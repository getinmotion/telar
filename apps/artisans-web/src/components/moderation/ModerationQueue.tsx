import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ModerationStatusBadge } from './ModerationStatusBadge';
import { ModerationPagination } from './ModerationPagination';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Store, Package, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModerationProduct } from '@/hooks/useProductModeration';

interface ModerationQueueProps {
  products: ModerationProduct[];
  selectedProductId: string | null;
  onSelectProduct: (product: ModerationProduct) => void;
  loading?: boolean;
  // Pagination props
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
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No hay productos en esta cola</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-[calc(100vh-400px)]">
        <div className="space-y-2 pr-3">
          {products.map(product => {
            const imageUrl = Array.isArray(product.images) && product.images.length > 0 
              ? product.images[0] 
              : '/placeholder.svg';

            return (
              <Card
                key={product.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedProductId === product.id && 'ring-2 ring-primary'
                )}
                onClick={() => onSelectProduct(product)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded object-cover bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{product.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Store className="w-3 h-3" />
                        <span className="truncate">{product.artisan_shops?.shop_name}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <ModerationStatusBadge status={product.moderation_status} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(product.created_at), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </span>
                      </div>
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
