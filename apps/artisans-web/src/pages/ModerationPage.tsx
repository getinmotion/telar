import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Package, Store, CheckSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useProductModeration, ModerationProduct, ModerationHistory } from '@/hooks/useProductModeration';
import { useShopModeration, ModerationShop } from '@/hooks/useShopModeration';
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

  const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products');

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

  const fetchQueue = useCallback(() => {
    fetchModerationQueue(activeFilter, advancedFilters, productPage);
  }, [activeFilter, advancedFilters, productPage, fetchModerationQueue]);

  useEffect(() => {
    const timer = setTimeout(fetchQueue, 300);
    return () => clearTimeout(timer);
  }, [fetchQueue]);

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

  const handleShopApprovalChange = async (shopId: string, approved: boolean, _comment?: string) => {
    const success = await toggleMarketplaceApproval(shopId, approved);
    if (success) fetchShopsQueue();
  };

  const handleRefresh = () => {
    if (activeTab === 'products') {
      fetchQueue();
      setSelectedProduct(null);
    } else {
      fetchShopsQueue();
      setSelectedShop(null);
    }
  };

  const handleSelectShop = (shop: ModerationShop) => setSelectedShop(shop);

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

  const handleDeleteShop = async (shopId: string, _reason?: string) => {
    const success = await deleteShop(shopId);
    if (success) {
      setSelectedShop(null);
      fetchShopsQueue();
    }
  };

  const handleToggleSelection = (shopId: string) => {
    setSelectedShops(prev =>
      prev.includes(shopId) ? prev.filter(id => id !== shopId) : [...prev, shopId]
    );
  };

  const handleClearSelection = () => {
    setSelectedShops([]);
    setSelectionMode(false);
  };

  const handleBulkApprove = async () => {
    const validIds = selectedShops.filter(id => shops.some(s => s.id === id));
    if (validIds.length === 0) { handleClearSelection(); return; }
    setBulkProcessing(true); setBulkProgress(0);
    try {
      const result = await bulkToggleMarketplaceApproval(
        validIds, true, (c, t) => setBulkProgress((c / t) * 100)
      );
      toast.success(`${result.success} tiendas aprobadas${result.failed > 0 ? `, ${result.failed} fallaron` : ''}`);
    } finally {
      setBulkProcessing(false); setSelectedShops([]); setSelectionMode(false); fetchShopsQueue();
    }
  };

  const handleBulkReject = async () => {
    const validIds = selectedShops.filter(id => shops.some(s => s.id === id));
    if (validIds.length === 0) { handleClearSelection(); return; }
    setBulkProcessing(true); setBulkProgress(0);
    try {
      const result = await bulkToggleMarketplaceApproval(
        validIds, false, (c, t) => setBulkProgress((c / t) * 100)
      );
      toast.success(`${result.success} tiendas rechazadas${result.failed > 0 ? `, ${result.failed} fallaron` : ''}`);
    } finally {
      setBulkProcessing(false); setSelectedShops([]); setSelectionMode(false); fetchShopsQueue();
    }
  };

  const handleBulkDelete = async (reason: string) => {
    const validIds = selectedShops.filter(id => shops.some(s => s.id === id));
    if (validIds.length === 0) { handleClearSelection(); return; }
    setBulkProcessing(true); setBulkProgress(0);
    try {
      const result = await bulkDeleteShops(validIds, reason, (c, t) => setBulkProgress((c / t) * 100));
      toast.success(`${result.success} tiendas eliminadas${result.failed > 0 ? `, ${result.failed} fallaron` : ''}`);
    } finally {
      setBulkProcessing(false); setSelectedShops([]); setSelectionMode(false); fetchShopsQueue();
    }
  };

  const isLoading = activeTab === 'products' ? loading : shopsLoading;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {isModerationSubdomain && <ModerationHeader />}

      {/* ── Top bar: título + tabs + refresh ── */}
      <div className={`border-b bg-card shrink-0 ${isModerationSubdomain ? 'pt-16' : ''}`}>
        <div className="px-4 h-12 flex items-center justify-between gap-4">
          <span className="font-semibold text-sm text-foreground whitespace-nowrap">
            Panel de Moderación
          </span>

          <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-colors
                ${activeTab === 'products'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Package className="w-3.5 h-3.5" />
              Productos
              {counts.pending_moderation > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {counts.pending_moderation}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-colors
                ${activeTab === 'shops'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Store className="w-3.5 h-3.5" />
              Tiendas
              {shopCounts.not_approved > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {shopCounts.not_approved}
                </Badge>
              )}
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="shrink-0 h-7 px-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Barra de filtros unificada ── */}
      <div className="border-b bg-muted/30 shrink-0 px-4 py-2 flex items-center gap-2 min-h-[44px]">
        {activeTab === 'products' ? (
          <>
            <ModerationFilters
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              counts={counts}
            />
            <div className="ml-auto shrink-0">
              <ModerationAdvancedFilters
                filters={advancedFilters}
                onFiltersChange={handleAdvancedFiltersChange}
              />
            </div>
          </>
        ) : (
          <>
            <ModerationShopFilters
              activeFilter={activeShopFilter}
              onFilterChange={handleShopFilterChange}
              counts={shopCounts}
            />
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Button
                variant={selectionMode ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) setSelectedShops([]);
                }}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                {selectionMode ? `${selectedShops.length} sel.` : 'Seleccionar'}
              </Button>
              <ModerationShopAdvancedFilters
                filters={shopAdvancedFilters}
                onFiltersChange={handleShopAdvancedFiltersChange}
                regions={availableRegions}
                craftTypes={availableCraftTypes}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Contenido principal: lista | detalle ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* PRODUCTOS */}
        {activeTab === 'products' && (
          <>
            {/* Lista */}
            <div className={`w-72 xl:w-80 border-r flex flex-col shrink-0 overflow-hidden
              ${selectedProduct ? 'hidden lg:flex' : 'flex'}`}>
              {productPagination.total > 0 && (
                <div className="px-3 py-1.5 border-b text-xs text-muted-foreground bg-muted/20">
                  {productPagination.total} productos
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <ModerationQueue
                  products={products}
                  selectedProductId={selectedProduct?.id || null}
                  onSelectProduct={handleSelectProduct}
                  loading={loading}
                  pagination={productPagination}
                  onPageChange={handleProductPageChange}
                />
              </div>
            </div>

            {/* Detalle / Editor */}
            <div className={`flex-1 overflow-y-auto
              ${!selectedProduct ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex flex-col'}`}>
              {selectedProduct ? (
                <>
                  <div className="lg:hidden px-4 pt-3 pb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-1 h-7 text-xs"
                      onClick={() => setSelectedProduct(null)}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      Volver
                    </Button>
                  </div>
                  <ModerationProductEditor
                    product={selectedProduct}
                    history={productHistory}
                    onModerate={handleModerate}
                    onShopApprovalChange={handleShopApprovalChange}
                    moderating={moderating}
                  />
                </>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-sm">Selecciona un producto</p>
                  <p className="text-xs mt-1 opacity-70">Haz clic en la lista para revisarlo</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TIENDAS */}
        {activeTab === 'shops' && (
          <>
            {/* Lista */}
            <div className={`w-72 xl:w-80 border-r flex flex-col shrink-0 overflow-hidden
              ${selectedShop ? 'hidden lg:flex' : 'flex'}`}>
              {shopPagination.total > 0 && (
                <div className="px-3 py-1.5 border-b text-xs text-muted-foreground bg-muted/20">
                  {shopPagination.total} tiendas
                </div>
              )}
              <div className="flex-1 overflow-hidden">
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
              </div>
            </div>

            {/* Detalle */}
            <div className={`flex-1 overflow-y-auto
              ${!selectedShop ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex flex-col'}`}>
              {selectedShop ? (
                <>
                  <div className="lg:hidden px-4 pt-3 pb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-1 h-7 text-xs"
                      onClick={() => setSelectedShop(null)}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      Volver
                    </Button>
                  </div>
                  <ModerationShopDetailView
                    shop={selectedShop}
                    onApprovalChange={handleShopApprovalChange}
                    onPublishChange={publishShopAdmin}
                    updating={shopUpdating}
                    isAdmin={isAdmin}
                    onDeleteShop={handleDeleteShop}
                    onRefresh={fetchShopsQueue}
                  />
                </>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-sm">Selecciona una tienda</p>
                  <p className="text-xs mt-1 opacity-70">Haz clic en la lista para revisarla</p>
                </div>
              )}
            </div>

            {/* Bulk actions flotante */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProductModerationPage;
