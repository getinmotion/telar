import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, Store, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProductModeration } from '@/hooks/useProductModeration';
import { useShopModeration } from '@/hooks/useShopModeration';
import { useQueueScores } from '@/hooks/useQueueScores';
import { SANS, SERIF, lc, glassPrimary, glassGreen, GREEN_MOD } from '@/components/dashboard/dashboardStyles';
import {
  QueueSidebar,
  QueueCard,
  QueueCardSkeleton,
  QueueEmptyState,
  QueueToolbar,
  QueueKanban,
  type QueueSection,
  type QueueSubsection,
  type QueueCardItem,
  type QueueViewMode,
  type QueueFilterState,
  type SortBy,
} from '@/components/moderation/IntelligentQueue';
import { ReviewerWorkspace } from '@/components/moderation/ReviewerWorkspace';
import { ModerationShopDetailView } from '@/components/moderation/ModerationShopDetailView';
import { ModerationPagination } from '@/components/moderation/ModerationPagination';
import { cn } from '@/lib/utils';
import type { ModerationProduct, ModerationHistory } from '@/hooks/useProductModeration';
import type { ModerationShop } from '@/hooks/useShopModeration';
import { moderateProduct, getModerationQueue } from '@/services/moderation.actions';
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
  active?: boolean;
  onClick: () => void;
}

const StatPill: React.FC<StatPillProps> = ({ icon, label, value, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...(active ? glassGreen : glassPrimary),
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderRadius: 10,
      padding: '7px 12px',
      border: active ? `1px solid ${GREEN_MOD}` : '1px solid rgba(21,128,61,0.12)',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}
  >
    <span style={{ color: active ? GREEN_MOD : 'rgba(21,128,61,0.5)', flexShrink: 0, display: 'flex' }}>{icon}</span>
    <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: active ? GREEN_MOD : '#151b2d', lineHeight: 1, tabularNums: true } as React.CSSProperties}>
      {value}
    </span>
    <span style={{ ...lc(active ? 0.7 : 0.4), fontSize: 8 }} className="hidden sm:block">{label}</span>
  </button>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const ModerationOSPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsModerator();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<QueueSection>('products');
  const [activeSubsection, setActiveSubsection] = useState<QueueSubsection>('pending');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedProductHistory, setSelectedProductHistory] = useState<ModerationHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkInProgress, setBulkInProgress] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<QueueViewMode | 'kanban'>('list');
  const [sortBy, setSortBy] = useState<SortBy>('oldest');
  const [activeFilters, setActiveFilters] = useState<QueueFilterState>({
    region: '', category: '', hasNoPhotos: false, nonMarketplaceOnly: false,
  });
  const [kanbanData, setKanbanData] = useState<Record<string, QueueCardItem[]>>({});
  const [kanbanLoading, setKanbanLoading] = useState(false);

  const {
    products,
    counts: productCounts,
    pagination: productPagination,
    loading: productsLoading,
    moderating,
    fetchModerationQueue,
    fetchCounts,
    moderateProduct: handleModerateProduct,
    bulkModerateProducts,
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
    bulkToggleMarketplaceApproval,
    deleteShop,
    publishShopAdmin,
  } = useShopModeration();

  const currentProductIds = useMemo(() => products.map((p) => p.id), [products]);
  const currentShopIds = useMemo(() => shops.map((s) => s.id), [shops]);
  const activeIds = activeSection === 'shops' ? currentShopIds : currentProductIds;
  const { data: scoresMap } = useQueueScores(activeIds);

  // ─── Carga inicial ────────────────────────────────────────────────────────

  useEffect(() => {
    fetchModerationQueue({ status: 'pending_moderation', page: 1 });
    fetchCounts();
    fetchShops({ filter: 'not_approved', page: 1 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        navigate('/backoffice/taxonomia/moderacion');
      } else if (section === 'marketplace') {
        navigate('/backoffice/curation');
      }
    },
    [fetchModerationQueue, fetchShops, fetchCounts, navigate],
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
      fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation', page: 1 });
      fetchCounts();
    } catch {
      toast.error('Error al aprobar. Intenta de nuevo.');
    }
  }, [user?.id, activeSubsection, fetchModerationQueue, fetchCounts]);

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
      region: p.artisan_shops?.region ?? undefined,
      category: p.category || undefined,
      sku: p.sku ?? undefined,
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
      region: s.region ?? undefined,
      email: (s as any).contactConfig?.email ?? undefined,
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

  // ─── Filter options derivadas ─────────────────────────────────────────────
  const availableRegions = useMemo(
    () => [...new Set(activeCards.map(c => c.region).filter(Boolean) as string[])].sort(),
    [activeCards],
  );
  const availableCategories = useMemo(
    () => [...new Set(activeCards.map(c => c.category).filter(Boolean) as string[])].sort(),
    [activeCards],
  );

  // ─── Pipeline: search → filter → sort ────────────────────────────────────
  const q = searchQuery.toLowerCase().trim();

  const filteredAndSortedCards = useMemo(() => {
    let cards = activeCards;

    // Text search
    if (q) {
      cards = cards.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.region?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.sku?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }

    // Filters
    if (activeFilters.region) cards = cards.filter(c => c.region === activeFilters.region);
    if (activeFilters.category) cards = cards.filter(c => c.category === activeFilters.category);
    if (activeFilters.hasNoPhotos) cards = cards.filter(c => !c.imageUrl);

    // Sort
    const sorted = [...cards];
    if (sortBy === 'newest') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sortBy === 'oldest') sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (sortBy === 'most_issues') sorted.sort((a, b) => (b.issues?.length ?? 0) - (a.issues?.length ?? 0));
    else if (sortBy === 'priority_score') sorted.sort((a, b) => (scoresMap?.[b.id]?.priorityScore ?? 0) - (scoresMap?.[a.id]?.priorityScore ?? 0));

    return sorted;
  }, [activeCards, q, activeFilters, sortBy, scoresMap]);

  // ─── Kanban data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'kanban' || activeSection !== 'products') return;
    setKanbanLoading(true);
    const statuses = ['pending_moderation', 'changes_requested', 'rejected', 'approved_with_edits'];
    Promise.all(statuses.map(status => getModerationQueue({ status, page: 1, pageSize: 30 })))
      .then(results => {
        const grouped: Record<string, QueueCardItem[]> = {};
        statuses.forEach((status, i) => {
          grouped[status] = (results[i].data ?? []).map(p => ({
            id: p.id,
            type: 'product' as const,
            title: p.name,
            subtitle: p.shop?.shopName,
            imageUrl: p.images?.[0] ?? null,
            status: p.moderationStatus,
            createdAt: p.createdAt,
            issues: [],
            region: p.shop?.region ?? undefined,
          }));
        });
        setKanbanData(grouped);
      })
      .finally(() => setKanbanLoading(false));
  }, [viewMode, activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Multi-select handlers ────────────────────────────────────────────────
  const handleCheckChange = useCallback((id: string, checked: boolean) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (checkedIds.size === filteredAndSortedCards.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredAndSortedCards.map(c => c.id)));
    }
  }, [checkedIds, filteredAndSortedCards]);

  const clearSelection = useCallback(() => setCheckedIds(new Set()), []);

  const handleBulkAction = useCallback(async (
    action: 'approve' | 'request_changes' | 'reject',
  ) => {
    const ids = Array.from(checkedIds);
    if (!ids.length) return;
    setBulkInProgress(true);
    try {
      if (activeSection === 'shops') {
        const approved = action === 'approve';
        await bulkToggleMarketplaceApproval(ids, approved);
        fetchShops({ filter: 'not_approved', page: 1 });
      } else {
        await bulkModerateProducts(ids, action);
        fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation', page: 1 });
        fetchCounts();
      }
      setCheckedIds(new Set());
    } finally {
      setBulkInProgress(false);
    }
  }, [checkedIds, activeSection, activeSubsection, bulkModerateProducts, bulkToggleMarketplaceApproval, fetchShops, fetchModerationQueue, fetchCounts]);

  // Clear selection + filters when section changes
  useEffect(() => {
    setCheckedIds(new Set());
    setSearchQuery('');
    setActiveFilters({ region: '', category: '', hasNoPhotos: false, nonMarketplaceOnly: false });
  }, [activeSection, activeSubsection]);

  // ─── Stats for top bar ───────────────────────────────────────────────────
  const totalPending = (productCounts?.pending_moderation ?? 0) + (shopCounts?.not_approved ?? 0);
  const totalChanges = productCounts?.changes_requested ?? 0;
  const totalRejected = productCounts?.rejected ?? 0;

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{
        backgroundColor: '#f9f7f2',
        backgroundImage: `
          radial-gradient(circle at top left, rgba(21,128,61,0.12) 0%, transparent 40%),
          radial-gradient(circle at bottom right, rgba(21,128,61,0.07) 0%, transparent 44%),
          radial-gradient(circle at top right, rgba(255,244,223,0.7) 0%, transparent 36%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >

      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0 sticky top-0 z-30"
        style={{
          background: 'rgba(249,247,242,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(21,128,61,0.1)',
        }}
      >
        {/* Left: back button or brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {showDetail ? (
            <button
              type="button"
              onClick={handleBackToQueue}
              style={{
                ...glassPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                padding: '6px 10px',
                border: '1px solid rgba(21,128,61,0.15)',
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
                color: '#151b2d',
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Lista
            </button>
          ) : (
            <>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(21,128,61,0.15) 0%, rgba(5,46,22,0.1) 100%)',
                border: '1px solid rgba(21,128,61,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Shield className="h-4 w-4" style={{ color: GREEN_MOD }} />
              </div>
              <div>
                <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>Lista de aprobación</p>
                <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: 'rgba(84,67,62,0.55)', marginTop: 1 }}>
                  Piezas · Tiendas
                </p>
              </div>
            </>
          )}
        </div>

        {/* Center: Stats pills */}
        {!showDetail && (
          <div className="flex items-center gap-2 overflow-x-auto">
            <StatPill
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Pendientes"
              value={totalPending}
              active={activeSection === 'products' && activeSubsection === 'pending'}
              onClick={() => handleSectionChange('products', 'pending')}
            />
            <StatPill
              icon={<AlertCircle className="h-3.5 w-3.5" />}
              label="Con cambios"
              value={totalChanges}
              active={activeSection === 'products' && activeSubsection === 'changes_requested'}
              onClick={() => handleSectionChange('products', 'changes_requested')}
            />
            <StatPill
              icon={<XCircle className="h-3.5 w-3.5" />}
              label="No disp."
              value={totalRejected}
              active={activeSection === 'products' && activeSubsection === 'rejected'}
              onClick={() => handleSectionChange('products', 'rejected')}
            />
            <div style={{ width: 1, height: 20, background: 'rgba(21,128,61,0.15)', margin: '0 2px' }} />
            <StatPill
              icon={<Store className="h-3.5 w-3.5" />}
              label="Tiendas"
              value={shopCounts?.not_approved ?? 0}
              active={activeSection === 'shops'}
              onClick={() => handleSectionChange('shops', 'pending_publish')}
            />
          </div>
        )}

        {/* Right: selected title + refresh */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showDetail && (
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#151b2d', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedProduct?.name ?? selectedShop?.shopName}
            </p>
          )}
          <button
            type="button"
            onClick={() => activeSection === 'shops' ? fetchShops({ filter: 'all', page: 1 }) : fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation', page: 1 })}
            style={{
              ...glassPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              padding: 7,
              border: '1px solid rgba(21,128,61,0.15)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              pointerEvents: isLoading ? 'none' : undefined,
            }}
            disabled={isLoading}
            title="Actualizar"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} style={{ color: GREEN_MOD }} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        {!showDetail && (
          <aside
            style={{
              ...glassPrimary,
              borderRight: '1px solid rgba(21,128,61,0.1)',
              width: 208,
              flexShrink: 0,
              overflowY: 'auto',
            }}
          >
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
                    fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation', page: 1 });
                    fetchCounts();
                  }}
                  moderating={moderating}
                />
              )}
              {selectedShop && (
                <div className="h-full overflow-hidden">
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
            /* ── Queue area ── */
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

              {/* Toolbar */}
              <QueueToolbar
                section={activeSection}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={activeFilters}
                onFiltersChange={setActiveFilters}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                availableRegions={availableRegions}
                availableCategories={availableCategories}
                totalItems={filteredAndSortedCards.length}
              />

              {/* Bulk actions bar */}
              {checkedIds.size > 0 && viewMode !== 'kanban' && (
                <div
                  className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(21,128,61,0.12)', background: 'rgba(21,128,61,0.04)' }}
                >
                  <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: GREEN_MOD, marginRight: 4 }}>
                    {checkedIds.size} seleccionado{checkedIds.size !== 1 ? 's' : ''}
                  </p>
                  {(activeSection === 'products' || activeSection === 'shops') && (
                    <button type="button" disabled={bulkInProgress} onClick={() => handleBulkAction('approve')}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 7, border: '1px solid rgba(21,128,61,0.25)', background: 'rgba(21,128,61,0.1)', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: GREEN_MOD, cursor: bulkInProgress ? 'not-allowed' : 'pointer', opacity: bulkInProgress ? 0.6 : 1 }}>
                      <CheckCircle style={{ width: 11, height: 11 }} /> Aprobar
                    </button>
                  )}
                  {activeSection === 'products' && (
                    <>
                      <button type="button" disabled={bulkInProgress} onClick={() => handleBulkAction('request_changes')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 7, border: '1px solid rgba(249,115,22,0.25)', background: 'rgba(249,115,22,0.08)', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#c2410c', cursor: bulkInProgress ? 'not-allowed' : 'pointer', opacity: bulkInProgress ? 0.6 : 1 }}>
                        <AlertCircle style={{ width: 11, height: 11 }} /> Cambios
                      </button>
                      <button type="button" disabled={bulkInProgress} onClick={() => handleBulkAction('reject')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#dc2626', cursor: bulkInProgress ? 'not-allowed' : 'pointer', opacity: bulkInProgress ? 0.6 : 1 }}>
                        <XCircle style={{ width: 11, height: 11 }} /> Rechazar
                      </button>
                    </>
                  )}
                  <button type="button" onClick={clearSelection}
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(21,27,45,0.1)', background: 'transparent', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(84,67,62,0.5)', cursor: 'pointer' }}>
                    <XCircle style={{ width: 11, height: 11 }} /> Cancelar
                  </button>
                </div>
              )}

              {/* Table header */}
              {viewMode === 'table' && !isLoading && filteredAndSortedCards.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderBottom: '1px solid rgba(21,27,45,0.06)', background: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                  {/* checkbox placeholder */ <div style={{ width: 16, flexShrink: 0 }} />}
                  <div style={{ width: 32, flexShrink: 0 }} />
                  <p style={{ flex: '2 1 0', ...lc(0.35), fontSize: 8 }}>Nombre</p>
                  <p style={{ flex: '1.5 1 0', ...lc(0.35), fontSize: 8 }}>Taller</p>
                  <p style={{ flex: '1 1 0', ...lc(0.35), fontSize: 8 }}>Región</p>
                  <p style={{ ...lc(0.35), fontSize: 8, flexShrink: 0, width: 80 }}>Estado</p>
                  <p style={{ ...lc(0.35), fontSize: 8, flexShrink: 0, width: 40, textAlign: 'center' }}>Issues</p>
                  <p style={{ ...lc(0.35), fontSize: 8, flexShrink: 0, width: 90, textAlign: 'right' }}>Fecha</p>
                  <div style={{ flexShrink: 0, width: 80 }} />
                </div>
              )}

              {/* Content area */}
              {viewMode === 'kanban' ? (
                <div className="flex-1 overflow-hidden">
                  <QueueKanban
                    data={kanbanData}
                    loading={kanbanLoading}
                    scoresMap={scoresMap ?? undefined}
                    onSelect={handleSelectProduct}
                    onQuickApprove={handleQuickApprove}
                    checkedIds={checkedIds}
                    onCheckChange={handleCheckChange}
                  />
                </div>
              ) : (
                <div className={`flex-1 overflow-y-auto ${viewMode === 'table' ? '' : 'p-3'}`}>
                  {isLoading ? (
                    <div className={viewMode === 'grid' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-3' : 'flex flex-col gap-1.5'}>
                      {Array.from({ length: 8 }).map((_, i) => <QueueCardSkeleton key={i} />)}
                    </div>
                  ) : filteredAndSortedCards.length === 0 ? (
                    <div className="p-4">
                      <QueueEmptyState
                        type={q ? 'default' : activeSection === 'products' ? 'products_pending' : activeSection === 'shops' ? 'shops_pending' : activeSection === 'taxonomy' ? 'taxonomy_pending' : 'default'}
                      />
                    </div>
                  ) : (
                    <div className={
                      viewMode === 'grid'
                        ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : viewMode === 'table'
                        ? 'flex flex-col'
                        : 'flex flex-col gap-1.5'
                    }>
                      {filteredAndSortedCards.map((item) => (
                        <QueueCard
                          key={item.id}
                          item={item}
                          viewMode={viewMode as QueueViewMode}
                          score={scoresMap?.[item.id]}
                          isSelected={item.id === selectedProductId || item.id === selectedShopId}
                          isChecked={checkedIds.has(item.id)}
                          onCheckChange={handleCheckChange}
                          onSelect={item.type === 'shop' ? handleSelectShop : handleSelectProduct}
                          onQuickApprove={item.type === 'product' ? handleQuickApprove : undefined}
                          onQuickReview={item.type === 'shop' ? handleSelectShop : handleSelectProduct}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {activePagination && activePagination.totalPages > 1 && (
                <div
                  className="px-4 py-2 flex-shrink-0"
                  style={{
                    borderTop: '1px solid rgba(21,128,61,0.08)',
                    background: 'rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <ModerationPagination
                    currentPage={activePagination.page}
                    totalPages={activePagination.totalPages}
                    totalItems={activePagination.total}
                    itemsPerPage={activePagination.pageSize}
                    onPageChange={(page) => {
                      if (activeSection === 'shops') {
                        fetchShops({ filter: 'all', page });
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
