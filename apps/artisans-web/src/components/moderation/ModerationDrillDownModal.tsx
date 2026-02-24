import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShopSummary, ProductSummary } from '@/hooks/useModerationStats';
import { Search, Store, Package, ExternalLink, CreditCard, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ModerationDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'shops' | 'products';
  shops?: ShopSummary[];
  products?: ProductSummary[];
  onShopClick?: (shop: ShopSummary) => void;
  onProductClick?: (product: ProductSummary) => void;
}

type SortField = 'name' | 'date' | 'bank';
type SortOrder = 'asc' | 'desc';

export const ModerationDrillDownModal: React.FC<ModerationDrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  shops = [],
  products = [],
  onShopClick,
  onProductClick,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredShops = useMemo(() => {
    let result = shops.filter(s => 
      s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      s.craft_type?.toLowerCase().includes(search.toLowerCase()) ||
      s.region?.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.shop_name.localeCompare(b.shop_name);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'bank':
          comparison = (a.has_bank_data ? 1 : 0) - (b.has_bank_data ? 1 : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [shops, search, sortField, sortOrder]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shop_name.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, search, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    let csv = '';
    if (type === 'shops') {
      csv = 'Nombre,Tipo,Región,Datos Bancarios,Marketplace,Estado,Creada\n';
      filteredShops.forEach(s => {
        csv += `"${s.shop_name}","${s.craft_type || ''}","${s.region || ''}",${s.has_bank_data ? 'Sí' : 'No'},${s.marketplace_approved ? 'Aprobada' : 'Pendiente'},"${s.publish_status || 'pending'}","${s.created_at}"\n`;
      });
    } else {
      csv = 'Nombre,Tienda,Estado,Precio,Creado\n';
      filteredProducts.forEach(p => {
        csv += `"${p.name}","${p.shop_name}","${p.moderation_status || 'draft'}",${p.price},"${p.created_at}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
    link.click();
  };

  const items = type === 'shops' ? filteredShops : filteredProducts;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'shops' ? <Store className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and sort */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('name')}
              className={sortField === 'name' ? 'bg-muted' : ''}
            >
              <ArrowUpDown className="w-4 h-4 mr-1" />
              Nombre
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('date')}
              className={sortField === 'date' ? 'bg-muted' : ''}
            >
              <ArrowUpDown className="w-4 h-4 mr-1" />
              Fecha
            </Button>
            {type === 'shops' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('bank')}
                className={sortField === 'bank' ? 'bg-muted' : ''}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Banco
              </Button>
            )}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            {items.length} resultado{items.length !== 1 ? 's' : ''}
          </p>

          {/* Items list */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {type === 'shops' ? (
                filteredShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onShopClick?.(shop)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Store className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{shop.shop_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {shop.craft_type || 'Sin tipo'} {shop.region && `• ${shop.region}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-1">
                          {shop.has_bank_data ? (
                            <Badge variant="outline" className="text-xs border-success text-success">
                              <CreditCard className="w-3 h-3 mr-1" />
                              Banco
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-destructive text-destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Sin banco
                            </Badge>
                          )}
                          {shop.marketplace_approved && (
                            <Badge variant="outline" className="text-xs border-success text-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              MP
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(shop.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onProductClick?.(product)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{product.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.shop_name} • ${product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {product.moderation_status || 'draft'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(product.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              Exportar CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
