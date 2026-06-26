import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, CheckCircle, AlertCircle, XCircle, Store, Package, Shield, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProductModeration } from '@/hooks/useProductModeration';
import { useShopModeration } from '@/hooks/useShopModeration';
import { useQueueScores } from '@/hooks/useQueueScores';
import { SANS, SERIF, lc, glassPrimary, glassGreen, GREEN_MOD } from '@/components/dashboard/dashboardStyles';
import {
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
import {
  getPendingTaxonomies,
  updateTaxonomyStatus,
  type TaxonomyType,
  type TaxonomyItem,
} from '@/services/taxonomy.actions';

const SECTION_TO_PRODUCT_STATUS: Record<string, string> = {
  pending: 'pending_moderation',
  incomplete: 'draft',
  recently_edited: 'approved_with_edits',
  changes_requested: 'changes_requested',
  rejected: 'rejected',
};

const TAX_TYPE_LABELS: Record<TaxonomyType, string> = {
  crafts: 'Oficios',
  techniques: 'Técnicas',
  materials: 'Materiales',
  styles: 'Estilos',
  herramientas: 'Herramientas',
};

// ─── Module selector ─────────────────────────────────────────────────────────

interface ModuleCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  sublabel: string;
  active: boolean;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, label, count, sublabel, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...(active ? glassGreen : glassPrimary),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 6,
      borderRadius: 14,
      padding: '14px 18px',
      border: active
        ? `1.5px solid ${GREEN_MOD}`
        : '1.5px solid rgba(21,128,61,0.12)',
      cursor: 'pointer',
      transition: 'all 0.15s',
      flex: '1 1 0',
      minWidth: 0,
      textAlign: 'left',
      boxShadow: active
        ? '0 2px 16px rgba(21,128,61,0.12)'
        : '0 1px 4px rgba(21,27,45,0.04)',
    }}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    }}>
      <span style={{ color: active ? GREEN_MOD : 'rgba(84,67,62,0.45)', display: 'flex' }}>{icon}</span>
      {count > 0 && (
        <span style={{
          borderRadius: 999,
          padding: '2px 8px',
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 800,
          background: active ? `rgba(21,128,61,0.15)` : 'rgba(21,27,45,0.07)',
          color: active ? GREEN_MOD : 'rgba(84,67,62,0.6)',
        }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
    <div>
      <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: active ? 800 : 600, color: active ? GREEN_MOD : '#151b2d', lineHeight: 1.2 }}>
        {label}
      </p>
      <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, color: 'rgba(84,67,62,0.5)', marginTop: 2 }}>
        {sublabel}
      </p>
    </div>
  </button>
);

// ─── Sub-tab pill ─────────────────────────────────────────────────────────────

interface SubTabProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

const SubTab: React.FC<SubTabProps> = ({ label, count, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] transition-all whitespace-nowrap border',
      active
        ? 'bg-green-700/10 border-green-700/20 text-green-700 font-bold'
        : 'border-transparent text-stone-500 font-medium hover:bg-stone-100/80',
    )}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={cn(
        'rounded-full px-1.5 text-[9px] font-bold',
        active ? 'bg-green-700/15 text-green-700' : 'bg-stone-900/7 text-stone-500',
      )}>
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
);

// ─── Taxonomy item row ────────────────────────────────────────────────────────

interface TaxonomyRowProps {
  item: TaxonomyItem;
  type: TaxonomyType;
  acting: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const TaxonomyRow: React.FC<TaxonomyRowProps> = ({ item, type, acting, onApprove, onReject }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 16px',
      borderBottom: '1px solid rgba(21,27,45,0.05)',
      background: 'rgba(255,255,255,0.6)',
      transition: 'background 0.1s',
    }}
  >
    <div style={{
      borderRadius: 6,
      padding: '2px 8px',
      fontFamily: SANS,
      fontSize: 9,
      fontWeight: 700,
      background: 'rgba(21,128,61,0.08)',
      color: GREEN_MOD,
      flexShrink: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    }}>
      {TAX_TYPE_LABELS[type]}
    </div>
    <p style={{ flex: 1, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {item.name}
    </p>
    {item.createdAt && (
      <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)', flexShrink: 0 }}>
        {new Date(item.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
      </p>
    )}
    <div className="flex gap-1.5 shrink-0">
      <Button
        type="button"
        size="sm"
        disabled={acting}
        onClick={onApprove}
        variant="outline"
        className="h-7 text-[11px] border-green-700/25 bg-green-700/8 text-green-700 hover:bg-green-700/15 gap-1"
      >
        <CheckCircle className="w-3 h-3" />
        Aprobar
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={acting}
        onClick={onReject}
        variant="outline"
        className="h-7 text-[11px] border-red-500/20 bg-red-500/6 text-red-600 hover:bg-red-500/10 gap-1"
      >
        <XCircle className="w-3 h-3" />
        Rechazar
      </Button>
    </div>
  </div>
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
  const [viewMode, setViewMode] = useState<QueueViewMode | 'kanban'>('list');
  const [sortBy, setSortBy] = useState<SortBy>('oldest');
  const [activeFilters, setActiveFilters] = useState<QueueFilterState>({
    region: '', category: '', hasNoPhotos: false, nonMarketplaceOnly: false,
  });
  const [kanbanData, setKanbanData] = useState<Record<string, QueueCardItem[]>>({});
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const kanbanLoadedRef = useRef(false);

  // Taxonomy state
  const [taxonomyData, setTaxonomyData] = useState<Record<TaxonomyType, TaxonomyItem[]>>({} as any);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [taxonomyActing, setTaxonomyActing] = useState<string | null>(null);
  const [activeTaxType, setActiveTaxType] = useState<TaxonomyType>('crafts');

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

  // ─── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetchModerationQueue({ status: 'pending_moderation', page: 1 });
    fetchCounts();
    fetchShops({ filter: 'not_approved', page: 1 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Taxonomy load ────────────────────────────────────────────────────────

  const fetchTaxonomies = useCallback(async () => {
    setTaxonomyLoading(true);
    try {
      const data = await getPendingTaxonomies();
      setTaxonomyData(data);
    } catch {
      toast.error('Error al cargar taxonomías.');
    } finally {
      setTaxonomyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'taxonomy') {
      fetchTaxonomies();
    }
  }, [activeSection, fetchTaxonomies]);

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
      fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation', page: 1 });
      fetchCounts();
    } catch {
      toast.error('Error al aprobar. Intenta de nuevo.');
    }
  }, [user?.id, activeSubsection, fetchModerationQueue, fetchCounts]);

  // ─── Taxonomy actions ─────────────────────────────────────────────────────

  const handleTaxonomyAction = useCallback(async (
    item: TaxonomyItem,
    type: TaxonomyType,
    action: 'approved' | 'rejected',
  ) => {
    setTaxonomyActing(item.id);
    try {
      await updateTaxonomyStatus(type, item.id, action);
      toast.success(action === 'approved' ? `"${item.name}" aprobado.` : `"${item.name}" rechazado.`);
      // Remove from local state immediately
      setTaxonomyData(prev => ({
        ...prev,
        [type]: (prev[type] ?? []).filter(i => i.id !== item.id),
      }));
    } catch {
      toast.error('Error al actualizar taxonomía.');
    } finally {
      setTaxonomyActing(null);
    }
  }, []);

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

  // Filter options
  const availableRegions = useMemo(
    () => [...new Set(activeCards.map(c => c.region).filter(Boolean) as string[])].sort(),
    [activeCards],
  );
  const availableCategories = useMemo(
    () => [...new Set(activeCards.map(c => c.category).filter(Boolean) as string[])].sort(),
    [activeCards],
  );

  // Pipeline: search → filter → sort
  const q = searchQuery.toLowerCase().trim();

  const filteredAndSortedCards = useMemo(() => {
    let cards = activeCards;
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
    if (activeFilters.region) cards = cards.filter(c => c.region === activeFilters.region);
    if (activeFilters.category) cards = cards.filter(c => c.category === activeFilters.category);
    if (activeFilters.hasNoPhotos) cards = cards.filter(c => !c.imageUrl);
    const sorted = [...cards];
    if (sortBy === 'newest') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sortBy === 'oldest') sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (sortBy === 'most_issues') sorted.sort((a, b) => (b.issues?.length ?? 0) - (a.issues?.length ?? 0));
    else if (sortBy === 'priority_score') sorted.sort((a, b) => (scoresMap?.[b.id]?.priorityScore ?? 0) - (scoresMap?.[a.id]?.priorityScore ?? 0));
    return sorted;
  }, [activeCards, q, activeFilters, sortBy, scoresMap]);

  // Kanban data - Solo cargar cuando se activa el modo kanban por primera vez
  useEffect(() => {
    // Solo ejecutar si:
    // 1. El modo es kanban
    // 2. La sección es products
    // 3. No se ha cargado previamente (evita recargas innecesarias)
    if (viewMode !== 'kanban' || activeSection !== 'products' || kanbanLoadedRef.current) return;

    setKanbanLoading(true);
    kanbanLoadedRef.current = true;

    const statuses = ['pending_moderation', 'changes_requested', 'rejected', 'approved_with_edits'];
    Promise.all(statuses.map(status => getModerationQueue({ userId: user?.id, status, page: 1, pageSize: 30 })))
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
      .catch((error) => {
        console.error('Error loading kanban data:', error);
        kanbanLoadedRef.current = false; // Resetear para permitir retry
      })
      .finally(() => setKanbanLoading(false));
  }, [viewMode, activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Multi-select handlers
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

  useEffect(() => {
    setCheckedIds(new Set());
    setSearchQuery('');
    setActiveFilters({ region: '', category: '', hasNoPhotos: false, nonMarketplaceOnly: false });
    // Resetear el flag de kanban cuando se cambia de sección para permitir recarga
    kanbanLoadedRef.current = false;
  }, [activeSection, activeSubsection]);

  // Derived counts for modules
  const totalProductPending = (productCounts?.pending_moderation ?? 0) + (productCounts?.changes_requested ?? 0) + (productCounts?.rejected ?? 0);
  const totalShopPending = shopCounts?.not_approved ?? 0;
  const totalTaxPending = Object.values(taxonomyData).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);
  const activeTaxItems = taxonomyData[activeTaxType] ?? [];

  const handleRefresh = useCallback(() => {
    if (activeSection === 'taxonomy') {
      fetchTaxonomies();
    } else if (activeSection === 'shops') {
      fetchShops({ filter: 'all', page: 1 });
    } else {
      fetchModerationQueue({ status: SECTION_TO_PRODUCT_STATUS[activeSubsection] ?? 'pending_moderation', page: 1 });
      // Si está en modo kanban, refrescar también los datos del kanban
      if (viewMode === 'kanban') {
        kanbanLoadedRef.current = false; // Resetear para forzar recarga
      }
    }
  }, [activeSection, activeSubsection, viewMode, fetchTaxonomies, fetchShops, fetchModerationQueue]);

  const isRefreshing = activeSection === 'taxonomy' ? taxonomyLoading : isLoading;

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

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0 sticky top-0 z-30"
        style={{
          background: 'rgba(249,247,242,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(21,128,61,0.1)',
        }}
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          {showDetail ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBackToQueue}
              className="gap-1.5 text-xs font-bold border-green-700/15 bg-white/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Lista
            </Button>
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
                  Piezas · Tiendas · Taxonomías
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showDetail && (
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#151b2d', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedProduct?.name ?? selectedShop?.shopName}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Actualizar"
            className="h-8 w-8 border-green-700/15 bg-white/80"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 text-green-700', isRefreshing && 'animate-spin')} />
          </Button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">

        {!showDetail && (
          <>
            {/* ── Module selector ── */}
            <div
              className="flex-shrink-0"
              style={{
                padding: '16px 16px 0',
              }}
            >
              <div className="flex gap-3">
                <ModuleCard
                  icon={<Package className="h-5 w-5" />}
                  label="Productos"
                  count={totalProductPending}
                  sublabel="Piezas artesanales"
                  active={activeSection === 'products'}
                  onClick={() => handleSectionChange('products', 'pending')}
                />
                <ModuleCard
                  icon={<Store className="h-5 w-5" />}
                  label="Tiendas"
                  count={totalShopPending}
                  sublabel="Talleres y artisanos"
                  active={activeSection === 'shops'}
                  onClick={() => handleSectionChange('shops', 'pending_publish')}
                />
                <ModuleCard
                  icon={<Tag className="h-5 w-5" />}
                  label="Taxonomías"
                  count={totalTaxPending}
                  sublabel="Categorías y etiquetas"
                  active={activeSection === 'taxonomy'}
                  onClick={() => handleSectionChange('taxonomy')}
                />
              </div>
            </div>

            {/* ── Sub-tabs ── */}
            <div
              className="flex-shrink-0 flex items-center gap-1 overflow-x-auto"
              style={{
                padding: '10px 16px 8px',
                borderBottom: '1px solid rgba(21,128,61,0.08)',
              }}
            >
              {activeSection === 'products' && (
                <>
                  <SubTab
                    label="Pendiente"
                    count={productCounts?.pending_moderation}
                    active={activeSubsection === 'pending'}
                    onClick={() => handleSectionChange('products', 'pending')}
                  />
                  <SubTab
                    label="Con cambios"
                    count={productCounts?.changes_requested}
                    active={activeSubsection === 'changes_requested'}
                    onClick={() => handleSectionChange('products', 'changes_requested')}
                  />
                  <SubTab
                    label="Rechazados"
                    count={productCounts?.rejected}
                    active={activeSubsection === 'rejected'}
                    onClick={() => handleSectionChange('products', 'rejected')}
                  />
                  <SubTab
                    label="Incompletos"
                    active={activeSubsection === 'incomplete'}
                    onClick={() => handleSectionChange('products', 'incomplete')}
                  />
                </>
              )}

              {activeSection === 'shops' && (
                <SubTab
                  label="Por aprobar"
                  count={shopCounts?.not_approved}
                  active={activeSubsection === 'pending_publish'}
                  onClick={() => handleSectionChange('shops', 'pending_publish')}
                />
              )}

              {activeSection === 'taxonomy' && (
                (Object.keys(TAX_TYPE_LABELS) as TaxonomyType[]).map(type => (
                  <SubTab
                    key={type}
                    label={TAX_TYPE_LABELS[type]}
                    count={(taxonomyData[type] ?? []).length}
                    active={activeTaxType === type}
                    onClick={() => setActiveTaxType(type)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* ── Main content ── */}
        <main className="flex flex-1 min-h-0 overflow-hidden">
          {showDetail ? (
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
          ) : activeSection === 'taxonomy' ? (
            /* ── Taxonomy queue ── */
            <div className="flex-1 flex flex-col overflow-hidden">
              {taxonomyLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: GREEN_MOD }} />
                </div>
              ) : activeTaxItems.length === 0 ? (
                <div className="p-4">
                  <QueueEmptyState type="taxonomy_pending" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {activeTaxItems.map(item => (
                    <TaxonomyRow
                      key={item.id}
                      item={item}
                      type={activeTaxType}
                      acting={taxonomyActing === item.id}
                      onApprove={() => handleTaxonomyAction(item, activeTaxType, 'approved')}
                      onReject={() => handleTaxonomyAction(item, activeTaxType, 'rejected')}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Products / Shops queue ── */
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

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

              {checkedIds.size > 0 && viewMode !== 'kanban' && (
                <div
                  className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(21,128,61,0.12)', background: 'rgba(21,128,61,0.04)' }}
                >
                  <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: GREEN_MOD, marginRight: 4 }}>
                    {checkedIds.size} seleccionado{checkedIds.size !== 1 ? 's' : ''}
                  </p>
                  {(activeSection === 'products' || activeSection === 'shops') && (
                    <Button type="button" size="sm" variant="outline" disabled={bulkInProgress} onClick={() => handleBulkAction('approve')}
                      className="h-7 text-[11px] border-green-700/25 bg-green-700/10 text-green-700 hover:bg-green-700/15 gap-1">
                      <CheckCircle className="w-3 h-3" /> Aprobar
                    </Button>
                  )}
                  {activeSection === 'products' && (
                    <>
                      <Button type="button" size="sm" variant="outline" disabled={bulkInProgress} onClick={() => handleBulkAction('request_changes')}
                        className="h-7 text-[11px] border-orange-500/25 bg-orange-500/8 text-orange-700 hover:bg-orange-500/15 gap-1">
                        <AlertCircle className="w-3 h-3" /> Cambios
                      </Button>
                      <Button type="button" size="sm" variant="outline" disabled={bulkInProgress} onClick={() => handleBulkAction('reject')}
                        className="h-7 text-[11px] border-red-500/25 bg-red-500/8 text-red-600 hover:bg-red-500/15 gap-1">
                        <XCircle className="w-3 h-3" /> Rechazar
                      </Button>
                    </>
                  )}
                  <Button type="button" size="sm" variant="ghost" onClick={clearSelection}
                    className="ml-auto h-7 text-[11px] text-stone-400 hover:text-stone-600 gap-1">
                    <XCircle className="w-3 h-3" /> Cancelar
                  </Button>
                </div>
              )}

              {viewMode === 'table' && !isLoading && filteredAndSortedCards.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderBottom: '1px solid rgba(21,27,45,0.06)', background: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                  {<div style={{ width: 16, flexShrink: 0 }} />}
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
                        type={q ? 'default' : activeSection === 'products' ? 'products_pending' : activeSection === 'shops' ? 'shops_pending' : 'default'}
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
