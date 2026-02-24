import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, ShoppingBag, DollarSign, Plus } from 'lucide-react';
import { useInventory, type Product, type ProductVariant } from '@/hooks/useInventory';
import { Skeleton } from '@/components/ui/skeleton';
// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface InventorySummaryPanelProps {
  shopId?: string;
  onOpenInventory?: () => void;
  onAddProduct?: () => void;
}

export function InventorySummaryPanel({ 
  shopId, 
  onOpenInventory,
  onAddProduct 
}: InventorySummaryPanelProps) {
  const { fetchProducts, fetchVariants, fetchLowStockVariants, loading } = useInventory();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    withoutPrice: 0
  });

  useEffect(() => {
    loadInventoryData();
  }, [shopId]);

  const loadInventoryData = async () => {
    const productsData = await fetchProducts(shopId);
    setProducts(productsData.slice(0, 5)); // Only show top 5
    
    // Calculate stats
    const active = productsData.filter(p => p.active).length;
    const draft = productsData.filter(p => !p.active).length;
    const withoutPrice = productsData.filter(p => !p.price || p.price === 0).length;
    
    setStats({
      total: productsData.length,
      active,
      draft,
      withoutPrice
    });

    // Get low stock variants
    const lowStock = await fetchLowStockVariants(shopId);
    setLowStockCount(lowStock.length);
  };

  if (loading && products.length === 0) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Inventario</h3>
            <p className="text-sm text-muted-foreground">
              Gestión de productos y stock
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onAddProduct && (
            <Button onClick={onAddProduct} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Producto
            </Button>
          )}
          {onOpenInventory && (
            <Button onClick={onOpenInventory} size="sm">
              Ver Todo
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-secondary/20 rounded-lg border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ShoppingBag className="h-4 w-4" />
            <span>Total Productos</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 mb-1">
            <Package className="h-4 w-4" />
            <span>Activos</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {stats.active}
          </p>
        </div>

        <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Stock Bajo</span>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
            {lowStockCount}
          </p>
        </div>

        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 mb-1">
            <DollarSign className="h-4 w-4" />
            <span>Sin Precio</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {stats.withoutPrice}
          </p>
        </div>
      </div>

      {/* Recent Products Table */}
      {products.length > 0 ? (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Productos Recientes
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr className="text-left text-xs">
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 font-medium hidden md:table-cell">Categoría</th>
                  <th className="p-3 font-medium">Precio</th>
                  <th className="p-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {product.category || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="p-3">
                      {product.price ? (
                        <span className="font-medium text-sm">
                          {formatCurrency(product.price)}
                        </span>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Sin precio
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={product.active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.active ? 'Activo' : 'Borrador'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            No tienes productos aún
          </p>
          {onAddProduct && (
            <Button onClick={onAddProduct} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Producto
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
