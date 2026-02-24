import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory, Product } from '@/hooks/useInventory';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { EventBus } from '@/utils/eventBus';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Search, Edit, Eye, EyeOff, Package, AlertTriangle, Store, Trash2, ShoppingBag, LayoutGrid, FileEdit, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MarketplaceLinksManager } from '@/components/inventory/MarketplaceLinksManager';
import { DeleteProductDialog } from '@/components/inventory/DeleteProductDialog';
import { getMarketplaceIcon, getMarketplaceColor } from '@/utils/marketplaceUtils';
import { ModerationFeedbackBadge } from '@/components/inventory/ModerationFeedbackBadge';
import { QuickStockModal } from '@/components/inventory/QuickStockModal';
import { StockDashboardPanel } from '@/components/inventory/StockDashboardPanel';
import { supabase } from '@/integrations/supabase/client';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { shop } = useArtisanShop();
  const { refreshModule } = useMasterAgent();
  const { loading, fetchProducts, updateProduct, deleteProduct, duplicateProduct, adjustProductStock } = useInventory();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quickStockModalOpen, setQuickStockModalOpen] = useState(false);
  const [moderationComments, setModerationComments] = useState<Record<string, string>>({});

  // Load products when shop is available
  useEffect(() => {
    const loadProducts = async () => {
      if (shop?.id) {
        const data = await fetchProducts(shop.id);
        setProducts(data);
      }
    };
    loadProducts();
  }, [shop?.id]);

  // Fetch moderation comments for rejected/changes_requested products
  useEffect(() => {
    const fetchModerationComments = async () => {
      const productsNeedingComments = products.filter(
        (p) => p.moderation_status === 'rejected' || p.moderation_status === 'changes_requested'
      );
      
      if (productsNeedingComments.length === 0) return;
      
      const productIds = productsNeedingComments.map((p) => p.id);
      
      const { data } = await supabase
        .from('product_moderation_history')
        .select('product_id, comment, created_at')
        .in('product_id', productIds)
        .in('new_status', ['rejected', 'changes_requested'])
        .order('created_at', { ascending: false });
      
      if (data) {
        const commentsMap: Record<string, string> = {};
        data.forEach((record) => {
          if (!commentsMap[record.product_id] && record.comment) {
            commentsMap[record.product_id] = record.comment;
          }
        });
        setModerationComments(commentsMap);
      }
    };
    
    if (products.length > 0) {
      fetchModerationComments();
    }
  }, [products]);

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.active) ||
      (statusFilter === 'inactive' && !product.active) ||
      (statusFilter === 'draft' && product.moderation_status === 'draft');
    
    // Stock filter
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && product.inventory !== null && product.inventory <= 5) ||
      (stockFilter === 'out' && product.inventory === 0) ||
      (stockFilter === 'in-stock' && product.inventory !== null && product.inventory > 0);
    
    return matchesSearch && matchesStatus && matchesStock;
  });

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const updated = await updateProduct(productId, { active: !currentActive });
      if (updated && shop?.id) {
        // Refresh products list
        const data = await fetchProducts(shop.id);
        setProducts(data);
        
        // Publish event to sync with Master Coordinator
        EventBus.publish('inventory.updated', { productId, active: !currentActive });
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/productos/editar/${productId}`);
  };

  const handleOpenMarketplaces = (product: Product) => {
    setSelectedProduct(product);
    setMarketplaceModalOpen(true);
  };

  const handleSaveMarketplaceLinks = async (links: any) => {
    if (!selectedProduct) return;
    
    const updated = await updateProduct(selectedProduct.id, { 
      marketplace_links: links 
    });
    
    if (updated && shop) {
      const data = await fetchProducts(shop.id);
      setProducts(data);
      EventBus.publish('inventory.updated', { 
        productId: selectedProduct.id, 
        marketplaceLinks: links 
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete || !shop) return;
    
    setDeleteLoading(true);
    try {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        // Refresh products list
        const data = await fetchProducts(shop.id);
        setProducts(data);
        
        // Publish event to sync with Master Coordinator
        EventBus.publish('inventory.updated', { 
          productId: productToDelete.id, 
          deleted: true 
        });
        
        setProductToDelete(null);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickStockSave = async (
    productId: string,
    change: number,
    channel: string,
    notes: string
  ) => {
    const success = await adjustProductStock(productId, change, channel, notes);
    if (success && shop) {
      const data = await fetchProducts(shop.id);
      setProducts(data);
      EventBus.publish('inventory.updated', { productId });
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    const newProduct = await duplicateProduct(product.id);
    if (newProduct && shop) {
      const data = await fetchProducts(shop.id);
      setProducts(data);
      EventBus.publish('inventory.updated', { productId: newProduct.id, duplicated: true });
      // Navigate to edit the new duplicate
      navigate(`/productos/editar/${newProduct.id}`);
    }
  };

  const getStockBadge = (inventory: number | null) => {
    if (inventory === null || inventory === 0) {
      return <Badge variant="destructive">Sin stock</Badge>;
    }
    if (inventory <= 5) {
      return <Badge variant="outline" className="border-amber-500 text-amber-600">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Bajo stock
      </Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-600">En stock</Badge>;
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No tienes una tienda</h2>
          <p className="text-muted-foreground mb-4">Crea una tienda para gestionar tu inventario</p>
          <Button onClick={() => navigate('/dashboard')}>Ir al Taller Digital</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mi-tienda')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Inventario de Productos</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona todos tus productos desde aquí
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in-stock">En stock</SelectItem>
                <SelectItem value="low">Bajo stock</SelectItem>
                <SelectItem value="out">Sin stock</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => navigate('/stock-wizard')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Gestión de Stock
            </Button>

            <Button onClick={() => navigate('/productos/subir')}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Producto
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stock Dashboard Panel */}
        {!loading && products.length > 0 && (
          <div className="mb-6">
            <StockDashboardPanel products={products} />
          </div>
        )}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || stockFilter !== 'all'
                ? 'No se encontraron productos con los filtros aplicados'
                : 'Comienza añadiendo tu primer producto'}
            </p>
            {!searchQuery && statusFilter === 'all' && stockFilter === 'all' && (
              <Button onClick={() => navigate('/productos/subir')}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir Primer Producto
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Marketplaces</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const images = Array.isArray(product.images) ? product.images : [];
                  const firstImage = images[0] || '/placeholder.svg';

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.sku && (
                            <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell>
                        {product.price ? formatCurrency(product.price) : 'Sin precio'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{product.inventory ?? 0}</span>
                          {getStockBadge(product.inventory)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {product.marketplace_links?.amazon && (
                            <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:opacity-80 transition-opacity text-xs"
                              style={{
                                backgroundColor: getMarketplaceColor('amazon').bg,
                                color: getMarketplaceColor('amazon').text,
                                borderColor: getMarketplaceColor('amazon').border,
                              }}
                              onClick={() => handleOpenMarketplaces(product)}
                            >
                              {getMarketplaceIcon('amazon')} Amazon
                            </Badge>
                          )}
                          {product.marketplace_links?.mercadolibre && (
                            <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:opacity-80 transition-opacity text-xs"
                              style={{
                                backgroundColor: getMarketplaceColor('mercadolibre').bg,
                                color: getMarketplaceColor('mercadolibre').text,
                                borderColor: getMarketplaceColor('mercadolibre').border,
                              }}
                              onClick={() => handleOpenMarketplaces(product)}
                            >
                              {getMarketplaceIcon('mercadolibre')} ML
                            </Badge>
                          )}
                          {product.marketplace_links?.other && product.marketplace_links.other.length > 0 && (
                            <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:opacity-80 transition-opacity text-xs"
                              onClick={() => handleOpenMarketplaces(product)}
                            >
                              +{product.marketplace_links.other.length}
                            </Badge>
                          )}
                          {(!product.marketplace_links?.amazon && 
                            !product.marketplace_links?.mercadolibre && 
                            !product.marketplace_links?.other?.length) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleOpenMarketplaces(product)}
                            >
                              <Store className="w-3 h-3 mr-1" />
                              Vincular
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {product.moderation_status ? (
                            <ModerationFeedbackBadge 
                              status={product.moderation_status} 
                              comment={moderationComments[product.id]}
                              productId={product.id}
                              productName={product.name}
                            />
                          ) : (
                            product.active ? (
                              <Badge variant="default">Activo</Badge>
                            ) : (
                              <Badge variant="secondary">Inactivo</Badge>
                            )
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDuplicateProduct(product)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Duplicar producto</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {product.moderation_status === 'draft' ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleEdit(product.id)}
                              className="flex items-center gap-1"
                            >
                              <FileEdit className="w-3 h-3" />
                              Completar
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(product.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleActive(product.id, product.active)}
                              >
                                {product.active ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToDelete(product)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        )}
      </div>

      {/* Marketplace Links Manager Modal */}
      {selectedProduct && (
        <MarketplaceLinksManager
          open={marketplaceModalOpen}
          onOpenChange={setMarketplaceModalOpen}
          productName={selectedProduct.name}
          initialLinks={selectedProduct.marketplace_links}
          onSave={handleSaveMarketplaceLinks}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        productName={productToDelete?.name || ''}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
      />

      {/* Quick Stock Modal */}
      <QuickStockModal
        open={quickStockModalOpen}
        onOpenChange={setQuickStockModalOpen}
        products={products}
        onSave={handleQuickStockSave}
      />

      {/* Floating Action Button para registrar venta rápida */}
      <button
        onClick={() => setQuickStockModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50"
        aria-label="Registrar venta rápida"
      >
        <ShoppingBag className="w-6 h-6" />
      </button>
    </div>
  );
};

export default InventoryPage;
