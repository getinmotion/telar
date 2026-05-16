import React, { useState, useCallback, useMemo } from 'react';
import { RefreshCw, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, Store, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProductModeration } from '@/hooks/useProductModeration';
import { useShopModeration } from '@/hooks/useShopModeration';
import { useQueueScores } from '@/hooks/useQueueScores';
import {
  QueueSidebar,
  QueueCard,
  QueueCardSkeleton,
  QueueEmptyState,
  type QueueSection,
  type QueueSubsection,
  type QueueCardItem,
} from '@/components/moderation/IntelligentQueue';
import { ReviewerWorkspace } from '@/components/moderation/ReviewerWorkspace';
import { ModerationShopDetailView } from '@/components/moderation/ModerationShopDetailView';
import { ModerationPagination } from '@/components/moderation/ModerationPagination';
import { cn } from '@/lib/utils';
import type { ModerationProduct, ModerationHistory } from '@/hooks/useProductModeration';
import type { ModerationShop } from '@/hooks/useShopModeration';
import { moderateProduct } from '@/services/moderation.actions';
import { useIsModerator } from '@/hooks/useIsModerator';
import { useAuth } from '@/context/AuthContext';
import type { RejectionReasonType } from '@/components/moderation/ReviewerWorkspace';
import type { FieldCorrection } from '@/components/moderation/ReviewerWorkspace';

const SECTION_TO_PRODUCT_STATUS: Record<string, string> = {
  pending: 'pending_moderation',
  incomplete: 'draft',
  recently_edited: 'approved_with_edits',
  changes_requested: 'changes_requested',
  rejected: 'rejected',
};

// ─── Stats bar item ───────────────────────────────────────────────────────────

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  active?: boolean;
  onClick: () => void;
}

const StatPill: React.FC<StatPillProps> = ({ icon, label, value, accent, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all',
      active
        ? 'border-[#151b2d] bg-[#151b2d] text-white shadow-sm'
        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm',
    )}
  >
    <span className={cn('flex-shrink-0', active ? 'text-white' : accent)}>{icon}</span>
    <span className={cn('font-bold text-sm tabular-nums leading-none', active ? 'text-white' : 'text-[#151b2d]')}>
      {value}
    </span>
    <span className={cn('hidden sm:inline', active ? 'text-white/70' : 'text-gray-500')}>{label}</span>
  </button>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const ModerationOSPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsModerator();

  const [activeSection, setActiveSection] = useState<QueueSection>('products');
  const [activeSubsection, setActiveSubsection] = useState<QueueSubsection>('pending');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedProductHistory, setSelectedProductHistory] = useState<ModerationHistory[]>([]);

  const {
    products,
    counts: productCounts,
    pagination: productPagination,
    loading: productsLoading,
    moderating,
    fetchModerationQueue,
    moderateProduct: handleModerateProduct,
    fetchProductHistory,
  } = useProductModeration();

  const {
    shops,
    counts: shopCounts,
    pagination: shopPagination,
    loading: shopsLoading,
    updating: shopUpdating,
    fetchShops,
    toggleMarketplaceApproval,
    deleteShop,
    publishShopAdmin,
  } = useShopModeration();

  const currentProductIds = useMemo(() => products.map((p) => p.id), [products]);
  const currentShopIds = useMemo(() => shops.map((s) => s.id), [shops]);
  const activeIds = activeSection === 'shops' ? currentShopIds : currentProductIds;
  const { data: scoresMap } = useQueueScores(activeIds);

  // ─── Navigation ──────────────────────────────────────────────────────────

  const handleSectionChange = useCallback(
    (section: QueueSection, subsection?: QueueSubsection) => {
      setActiveSection(section);
      setActiveSubsection(subsection ?? (section === 'shops' ? 'pending_publish' : 'pending'));
      setSelectedProductId(null);
      setSelectedShopId(null);
      if (section === 'products') {
        const status = SECTION_TO_PRODUCT_STATUS[subsection ?? 'pending'] ?? 'pending_moderation';
        fetchModerationQueue({ status, page: 1 });
      } else if (section === 'shops') {
        fetchShops({ filter: subsection === 'pending_publish' ? 'not_approved' : 'all', page: 1 });
      } else if (section === 'taxonomy') {
        window.location.href = '/backoffice/taxonomia';
      }
    },
    [fetchModerationQueue, fetchShops],
  );

  const handleSelectProduct = useCallback(async (id: string) => {
    setSelectedProductId(id);
    setSelectedShopId(null);
    const history = await fetchProductHistory(id);
    setSelectedProductHistory(history ?? []);
  }, [fetchProductHistory]);

  const handleSelectShop = useCallback((id: string) => {
    setSelectedShopId(id);
    setSelectedProductId(null);
  }, []);

  const handleBackToQueue = useCallback(() => {
    setSelectedProductId(null);
    setSelectedShopId(null);
  }, []);

  const handleQuickApprove = useCallback(async (id: string) => {
    try {
      await moderateProduct(id, 'approve', undefined, undefined, user?.id);
      toast.success('Pieza aprobada y disponible en el marketplace.');
      fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation' });
    } catch {
      toast.error('Error al aprobar. Intenta de nuevo.');
    }
  }, [user?.id, activeSubsection, fetchModerationQueue]);

  // ─── Queue data ───────────────────────────────────────────────────────────

  const productCards: QueueCardItem[] = useMemo(
    () => products.map((p) => ({
      id: p.id,
      type: 'product' as const,
      title: p.name,
      subtitle: p.artisan_shops?.shop_name ?? undefined,
      imageUrl: p.images?.[0] ?? null,
      status: p.moderation_status,
      createdAt: p.created_at,
      issues: buildProductIssues(p),
    })),
    [products],
  );

  const shopCards: QueueCardItem[] = useMemo(
    () => shops.map((s) => ({
      id: s.id,
      type: 'shop' as const,
      title: s.shopName,
      subtitle: s.region ?? undefined,
      imageUrl: s.logoUrl,
      status: s.marketplaceApproved ? 'approved' : 'pending_moderation',
      createdAt: s.createdAt,
      issues: buildShopIssues(s),
    })),
    [shops],
  );

  const activeCards = activeSection === 'shops' ? shopCards : productCards;
  const isLoading = activeSection === 'shops' ? shopsLoading : productsLoading;
  const activePagination = activeSection === 'shops' ? shopPagination : productPagination;

  const sectionCounts = {
    products: {
      pending: productCounts?.pending_moderation ?? 0,
      changes_requested: productCounts?.changes_requested ?? 0,
      rejected: productCounts?.rejected ?? 0,
    },
    shops: { pending_publish: shopCounts?.not_approved ?? 0 },
  };

  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) ?? null : null;
  const selectedShop = selectedShopId ? shops.find((s) => s.id === selectedShopId) ?? null : null;
  const showDetail = !!selectedProduct || !!selectedShop;

  // ─── Stats for top bar ───────────────────────────────────────────────────
  const totalPending = (productCounts?.pending_moderation ?? 0) + (shopCounts?.not_approved ?? 0);
  const totalChanges = productCounts?.changes_requested ?? 0;
  const totalRejected = productCounts?.rejected ?? 0;
  const totalApproved = (productCounts?.approved ?? 0) + (productCounts?.approved_with_edits ?? 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50/50">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          {showDetail ? (
            <button
              type="button"
              onClick={handleBackToQueue}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Cola
            </button>
          ) : (
            <h1 className="text-sm font-semibold text-[#151b2d]">Moderación TELAR</h1>
          )}
        </div>

        {/* Stats pills */}
        {!showDetail && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <StatPill
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Pendientes"
              value={totalPending}
              accent="text-amber-500"
              active={activeSection === 'products' && activeSubsection === 'pending'}
              onClick={() => handleSectionChange('products', 'pending')}
            />
            <StatPill
              icon={<AlertCircle className="h-3.5 w-3.5" />}
              label="Esperando"
              value={totalChanges}
              accent="text-orange-500"
              active={activeSection === 'products' && activeSubsection === 'changes_requested'}
              onClick={() => handleSectionChange('products', 'changes_requested')}
            />
            <StatPill
              icon={<XCircle className="h-3.5 w-3.5" />}
              label="No disp."
              value={totalRejected}
              accent="text-red-500"
              active={activeSection === 'products' && activeSubsection === 'rejected'}
              onClick={() => handleSectionChange('products', 'rejected')}
            />
            <StatPill
              icon={<CheckCircle className="h-3.5 w-3.5" />}
              label="Aprobados"
              value={totalApproved}
              accent="text-emerald-500"
              active={activeSection === 'products' && activeSubsection === 'recently_edited'}
              onClick={() => handleSectionChange('products', 'recently_edited')}
            />
            <div className="h-4 w-px bg-gray-200 mx-0.5" />
            <StatPill
              icon={<Store className="h-3.5 w-3.5" />}
              label="Tiendas"
              value={shopCounts?.not_approved ?? 0}
              accent="text-blue-500"
              active={activeSection === 'shops'}
              onClick={() => handleSectionChange('shops', 'pending_publish')}
            />
          </div>
        )}

        {/* Refresh + selected title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showDetail && (
            <p className="text-xs font-medium text-[#151b2d] max-w-[200px] truncate">
              {selectedProduct?.name ?? selectedShop?.shopName}
            </p>
          )}
          <button
            type="button"
            onClick={() => activeSection === 'shops' ? fetchShops({ page: 1 }) : fetchModerationQueue({ page: 1 })}
            className={cn('rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 transition-colors', isLoading && 'opacity-60 pointer-events-none')}
            disabled={isLoading}
            title="Actualizar"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        {!showDetail && (
          <aside className="w-52 flex-shrink-0 overflow-y-auto border-r bg-white">
            <QueueSidebar
              activeSection={activeSection}
              activeSubsection={activeSubsection}
              counts={sectionCounts}
              onSectionChange={handleSectionChange}
            />
          </aside>
        )}

        {/* Main */}
        <main className="flex flex-1 min-w-0 overflow-hidden">
          {showDetail ? (
            /* ── Detail view ── */
            <div className="flex-1 overflow-hidden bg-white">
              {selectedProduct && (
                <ReviewerWorkspace
                  product={selectedProduct}
                  history={selectedProductHistory}
                  onModerate={async (action, comment, edits, rejectionReason, corrections) => {
                    const enrichedEdits = edits
                      ? { ...edits, corrections: corrections ?? [] }
                      : corrections?.length ? { corrections } : undefined;
                    await handleModerateProduct(selectedProduct.id, action, comment, enrichedEdits as any);
                    handleBackToQueue();
                    fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation' });
                  }}
                  moderating={moderating}
                />
              )}
              {selectedShop && (
                <div className="h-full overflow-y-auto p-6">
                  <ModerationShopDetailView
                    shop={selectedShop as any}
                    onApprovalChange={async (shopId, approved, comment) => {
                      await toggleMarketplaceApproval(shopId, approved, comment);
                      handleBackToQueue();
                    }}
                    onPublishChange={async (shopId, action, comment) => {
                      await publishShopAdmin(shopId, action, comment);
                      return true;
                    }}
                    updating={shopUpdating}
                    onDeleteShop={isAdmin ? async (shopId, reason) => { await deleteShop(shopId, reason); handleBackToQueue(); } : undefined}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
            </div>
          ) : (
            /* ── Queue grid ── */
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
              {/* Subheader */}
              <div className="flex items-center justify-between border-b bg-white px-4 py-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    {isLoading ? 'Cargando…' : activeCards.length === 0
                      ? 'Cola vacía'
                      : `${activeCards.length} item${activeCards.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <QueueCardSkeleton key={i} />)}
                  </div>
                ) : activeCards.length === 0 ? (
                  <QueueEmptyState
                    type={activeSection === 'products' ? 'products_pending' : activeSection === 'shops' ? 'shops_pending' : activeSection === 'taxonomy' ? 'taxonomy_pending' : 'default'}
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {activeCards.map((item) => (
                      <QueueCard
                        key={item.id}
                        item={item}
                        score={scoresMap?.[item.id]}
                        isSelected={item.id === selectedProductId || item.id === selectedShopId}
                        onSelect={item.type === 'shop' ? handleSelectShop : handleSelectProduct}
                        onQuickApprove={item.type === 'product' ? handleQuickApprove : undefined}
                        onQuickReview={item.type === 'shop' ? handleSelectShop : handleSelectProduct}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {activePagination && activePagination.totalPages > 1 && (
                <div className="border-t bg-white px-4 py-2 flex-shrink-0">
                  <ModerationPagination
                    currentPage={activePagination.page}
                    totalPages={activePagination.totalPages}
                    totalItems={activePagination.total}
                    itemsPerPage={activePagination.pageSize}
                    onPageChange={(page) => {
                      if (activeSection === 'shops') {
                        fetchShops({ page });
                      } else {
                        fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation', page });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildProductIssues(product: ModerationProduct): string[] {
  const issues: string[] = [];
  if (!product.images || product.images.length === 0) issues.push('Sin fotos');
  if (!product.category || product.category === 'all') issues.push('Sin categoría');
  if (!product.short_description || product.short_description.trim().length < 20) issues.push('Descripción corta');
  if (!product.materials || product.materials.length === 0) issues.push('Sin materiales');
  if (!product.shipping_data_complete) issues.push('Sin logística');
  return issues;
}

function buildShopIssues(shop: ModerationShop): string[] {
  const issues: string[] = [];
  if (!shop.logoUrl) issues.push('Sin logo');
  if (!shop.description || shop.description.trim().length < 30) issues.push('Descripción corta');
  if (!shop.idContraparty) issues.push('Sin datos bancarios');
  return issues;
}

export default ModerationOSPage;
