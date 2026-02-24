import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Package, Store, LayoutDashboard, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ModerationQueue } from '@/components/moderation/ModerationQueue';
import { ModerationProductEditor } from '@/components/moderation/ModerationProductEditor';
import { ModerationFilters } from '@/components/moderation/ModerationFilters';
import { ModerationAdvancedFilters, AdvancedFilters } from '@/components/moderation/ModerationAdvancedFilters';
import { ModerationShopFilters } from '@/components/moderation/ModerationShopFilters';
import { ModerationShopAdvancedFilters, ShopAdvancedFilters } from '@/components/moderation/ModerationShopAdvancedFilters';
import { ModerationShopQueue } from '@/components/moderation/ModerationShopQueue';
import { ModerationShopDetailView } from '@/components/moderation/ModerationShopDetailView';
import { ModerationShopBulkActions } from '@/components/moderation/ModerationShopBulkActions';
import { ModerationDashboard } from '@/components/moderation/ModerationDashboard';
import { useProductModeration, ModerationProduct, ModerationHistory } from '@/hooks/useProductModeration';
import { useShopModeration, ModerationShop } from '@/hooks/useShopModeration';
import { useModerationStats } from '@/hooks/useModerationStats';
import { ModerationHeader } from '@/components/moderation/ModerationHeader';
import { useSubdomain } from '@/hooks/useSubdomain';
import { useIsModerator } from '@/hooks/useIsModerator';

const ProductModerationPage: React.FC = () => {
  const { isModerationSubdomain } = useSubdomain();
  const { isAdmin } = useIsModerator();
  
  // Products
  const {
    products,
    counts,
    pagination: productPagination,
    loading,
    moderating,
    fetchModerationQueue,
    moderateProduct,
    updateShopMarketplaceApproval,
    fetchProductHistory,
  } = useProductModeration();

  // Shops
  const {
    shops,
    counts: shopCounts,
    pagination: shopPagination,
    loading: shopsLoading,
    updating: shopUpdating,
    availableRegions,
    availableCraftTypes,
    fetchShops,
    toggleMarketplaceApproval,
    bulkToggleMarketplaceApproval,
    deleteShop,
    bulkDeleteShops,
    publishShopAdmin,
  } = useShopModeration();

  // Moderation Stats
  const {
    stats: moderationStats,
    loading: statsLoading,
    fetchStats,
  } = useModerationStats();

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'shops'>('dashboard');
  
  // Products state
  const [activeFilter, setActiveFilter] = useState('pending_moderation');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    search: '',
    category: 'all',
    region: 'all',
    onlyNonMarketplace: false,
  });
  const [productPage, setProductPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ModerationProduct | null>(null);
  const [productHistory, setProductHistory] = useState<ModerationHistory[]>([]);

  // Shops state
  const [activeShopFilter, setActiveShopFilter] = useState('all');
  const [shopAdvancedFilters, setShopAdvancedFilters] = useState<ShopAdvancedFilters>({
    search: '',
    hasBankData: 'all',
    minApprovedProducts: 'all',
    region: 'all',
    craftType: 'all',
  });
  const [shopPage, setShopPage] = useState(1);
  const [selectedShop, setSelectedShop] = useState<ModerationShop | null>(null);

  // Bulk selection state
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch products
  const fetchQueue = useCallback(() => {
    fetchModerationQueue(activeFilter, advancedFilters, productPage);
  }, [activeFilter, advancedFilters, productPage, fetchModerationQueue]);

  useEffect(() => {
    const timer = setTimeout(fetchQueue, 300);
    return () => clearTimeout(timer);
  }, [fetchQueue]);

  // Fetch shops
  const fetchShopsQueue = useCallback(() => {
    fetchShops(activeShopFilter, shopAdvancedFilters, shopPage);
  }, [activeShopFilter, shopAdvancedFilters, shopPage, fetchShops]);

  useEffect(() => {
    if (activeTab === 'shops') {
      const timer = setTimeout(fetchShopsQueue, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchShopsQueue]);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductHistory(selectedProduct.id).then(setProductHistory);
    } else {
      setProductHistory([]);
    }
  }, [selectedProduct, fetchProductHistory]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setProductPage(1);
    setSelectedProduct(null);
  };

  const handleAdvancedFiltersChange = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setProductPage(1);
    setSelectedProduct(null);
  };

  const handleProductPageChange = (page: number) => {
    setProductPage(page);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product: ModerationProduct) => {
    setSelectedProduct(product);
  };

  const handleModerate = async (
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    edits?: Record<string, any>
  ) => {
    if (!selectedProduct) return;
    
    await moderateProduct(selectedProduct.id, action, comment, edits);
    setSelectedProduct(null);
    fetchQueue();
  };

  const handleShopApprovalChange = async (shopId: string, approved: boolean, comment?: string) => {
    const success = await toggleMarketplaceApproval(shopId, approved, comment);
    if (success) {
      fetchShopsQueue();
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'products') {
      fetchQueue();
      setSelectedProduct(null);
    } else {
      fetchShopsQueue();
      setSelectedShop(null);
    }
  };

  const handleSelectShop = (shop: ModerationShop) => {
    setSelectedShop(shop);
  };

  const handleShopFilterChange = (filter: string) => {
    setActiveShopFilter(filter);
    setShopPage(1);
    setSelectedShop(null);
  };

  const handleShopAdvancedFiltersChange = (filters: ShopAdvancedFilters) => {
    setShopAdvancedFilters(filters);
    setShopPage(1);
    setSelectedShop(null);
  };

  const handleShopPageChange = (page: number) => {
    setShopPage(page);
    setSelectedShop(null);
  };

  const handleDeleteShop = async (shopId: string, reason: string) => {
    const success = await deleteShop(shopId, reason);
    if (success) {
      setSelectedShop(null);
      fetchShopsQueue();
    }
  };

  // Bulk actions
  const handleToggleSelection = (shopId: string) => {
    setSelectedShops(prev => 
      prev.includes(shopId) 
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
  };

  const handleClearSelection = () => {
    setSelectedShops([]);
    setSelectionMode(false);
  };

  const handleBulkApprove = async () => {
    if (selectedShops.length === 0) return;
    
    // Validate IDs exist in current list
    const validIds = selectedShops.filter(id => shops.some(s => s.id === id));
    if (validIds.length === 0) {
      handleClearSelection();
      return;
    }

    setBulkProcessing(true);
    setBulkProgress(0);
    
    try {
      const result = await bulkToggleMarketplaceApproval(
        validIds, 
        true,
        (current, total) => setBulkProgress((current / total) * 100)
      );
      
      toast.success(`${result.success} tiendas aprobadas${result.failed > 0 ? `, ${result.failed} fallaron` : ''}`);
    } finally {
      setBulkProcessing(false);
      setSelectedShops([]);
      setSelectionMode(false);
      fetchShopsQueue();
    }
  };

  const handleBulkReject = async () => {
    if (selectedShops.length === 0) return;
    
    const validIds = selectedShops.filter(id => shops.some(s => s.id === id));
    if (validIds.length === 0) {
      handleClearSelection();
      return;
    }

    setBulkProcessing(true);
    setBulkProgress(0);
    
    try {
      const result = await bulkToggleMarketplaceApproval(
        validIds, 
        false,
        (current, total) => setBulkProgress((current / total) * 100)
      );
      
      toast.success(`${result.success} tiendas rechazadas${result.failed > 0 ? `, ${result.failed} fallaron` : ''}`);
    } finally {
      setBulkProcessing(false);
      setSelectedShops([]);
      setSelectionMode(false);
      fetchShopsQueue();
    }
  };

  const handleBulkDelete = async (reason: string) => {
    if (selectedShops.length === 0) return;
    
    const validIds = selectedShops.filter(id => shops.some(s => s.id === id));
    if (validIds.length === 0) {
      handleClearSelection();
      return;
    }

    setBulkProcessing(true);
    setBulkProgress(0);
    
    try {
      const result = await bulkDeleteShops(
        validIds,
        reason,
        (current, total) => setBulkProgress((current / total) * 100)
      );
      
      toast.success(`${result.success} tiendas eliminadas${result.failed > 0 ? `, ${result.failed} fallaron` : ''}`);
    } finally {
      setBulkProcessing(false);
      setSelectedShops([]);
      setSelectionMode(false);
      fetchShopsQueue();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {isModerationSubdomain && <ModerationHeader />}
      
      <div className={isModerationSubdomain ? "pt-16" : ""}>
        {/* Title bar */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Panel de Moderación</h1>
                <p className="text-sm text-muted-foreground">
                  Revisa productos y aprueba tiendas para el marketplace
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={activeTab === 'dashboard' ? statsLoading : activeTab === 'products' ? loading : shopsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${(activeTab === 'dashboard' ? statsLoading : activeTab === 'products' ? loading : shopsLoading) ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="border-b bg-card/50">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'dashboard' | 'products' | 'shops')}>
              <TabsList>
                <TabsTrigger value="dashboard" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="w-4 h-4" />
                  Productos
                  <Badge variant="secondary">{counts.pending_moderation}</Badge>
                </TabsTrigger>
                <TabsTrigger value="shops" className="gap-2">
                  <Store className="w-4 h-4" />
                  Tiendas
                  <Badge variant="secondary">{shopCounts.not_approved}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} className="container mx-auto px-4">
          <TabsContent value="dashboard" className="mt-0 py-6">
            <ModerationDashboard 
              stats={moderationStats} 
              loading={statsLoading} 
            />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            {/* Product Filters */}
            <div className="py-3 border-b bg-card/50">
              <ModerationFilters
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                counts={counts}
              />
            </div>

            {/* Advanced Filters */}
            <div className="py-3 border-b">
              <ModerationAdvancedFilters
                filters={advancedFilters}
                onFiltersChange={handleAdvancedFiltersChange}
              />
            </div>

            {/* Products Grid */}
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue List */}
                <div className="lg:col-span-1">
                  <Card className="h-[calc(100vh-340px)]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Cola de Productos
                        {productPagination.total > 0 && (
                          <span className="text-muted-foreground font-normal">
                            ({productPagination.total})
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-60px)]">
                      <ModerationQueue
                        products={products}
                        selectedProductId={selectedProduct?.id || null}
                        onSelectProduct={handleSelectProduct}
                        loading={loading}
                        pagination={productPagination}
                        onPageChange={handleProductPageChange}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Detail View / Editor */}
                <div className="lg:col-span-2">
                  {selectedProduct ? (
                    <ScrollArea className="h-[calc(100vh-340px)]">
                      <ModerationProductEditor
                        product={selectedProduct}
                        history={productHistory}
                        onModerate={handleModerate}
                        onShopApprovalChange={handleShopApprovalChange}
                        moderating={moderating}
                      />
                    </ScrollArea>
                  ) : (
                    <Card className="h-[calc(100vh-340px)] flex items-center justify-center">
                      <CardContent className="text-center text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Selecciona un producto</p>
                        <p className="text-sm">Haz clic en un producto de la cola para revisarlo y editarlo</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shops" className="mt-0">
            {/* Shop Filters */}
            <div className="py-3 border-b bg-card/50">
              <ModerationShopFilters
                activeFilter={activeShopFilter}
                onFilterChange={handleShopFilterChange}
                counts={shopCounts}
              />
            </div>

            {/* Advanced Filters */}
            <div className="border-b">
              <ModerationShopAdvancedFilters
                filters={shopAdvancedFilters}
                onFiltersChange={handleShopAdvancedFiltersChange}
                regions={availableRegions}
                craftTypes={availableCraftTypes}
              />
            </div>

            {/* Shops Grid */}
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue List */}
                <div className="lg:col-span-1">
                  <Card className="h-[calc(100vh-380px)]">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          Tiendas
                          {shopPagination.total > 0 && (
                            <span className="text-muted-foreground font-normal">
                              ({shopPagination.total})
                            </span>
                          )}
                        </CardTitle>
                        <Button
                          variant={selectionMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectionMode(!selectionMode);
                            if (selectionMode) setSelectedShops([]);
                          }}
                        >
                          <CheckSquare className="w-4 h-4 mr-1" />
                          {selectionMode ? 'Cancelar' : 'Seleccionar'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-60px)]">
                      <ModerationShopQueue
                        shops={shops}
                        selectedShopId={selectedShop?.id || null}
                        onSelectShop={handleSelectShop}
                        loading={shopsLoading}
                        selectedShops={selectedShops}
                        onToggleSelection={handleToggleSelection}
                        selectionMode={selectionMode}
                        pagination={shopPagination}
                        onPageChange={handleShopPageChange}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Bulk Actions */}
                <ModerationShopBulkActions
                  selectedCount={selectedShops.length}
                  onApproveAll={handleBulkApprove}
                  onRejectAll={handleBulkReject}
                  onDeleteAll={isAdmin ? handleBulkDelete : undefined}
                  onClearSelection={handleClearSelection}
                  isProcessing={bulkProcessing}
                  progress={bulkProgress}
                  isAdmin={isAdmin}
                />

                {/* Detail View */}
                <div className="lg:col-span-2">
                  {selectedShop ? (
                    <ScrollArea className="h-[calc(100vh-380px)]">
                      <ModerationShopDetailView
                        shop={selectedShop}
                        onApprovalChange={handleShopApprovalChange}
                        onPublishChange={publishShopAdmin}
                        updating={shopUpdating}
                        isAdmin={isAdmin}
                        onDeleteShop={handleDeleteShop}
                        onRefresh={fetchShopsQueue}
                      />
                    </ScrollArea>
                  ) : (
                    <Card className="h-[calc(100vh-380px)] flex items-center justify-center">
                      <CardContent className="text-center text-muted-foreground">
                        <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Selecciona una tienda</p>
                        <p className="text-sm">Haz clic en una tienda de la lista para revisar y aprobar</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductModerationPage;
