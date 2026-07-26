import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Search, Package, Store, Tag, Loader2, CheckCheck, XCircle,
  ArrowRight, Handshake, AlertTriangle, Inbox as InboxIcon, X, Combine,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useProductModeration, type ModerationProduct } from '@/hooks/useProductModeration';
import { useShopModeration, type ModerationShop } from '@/hooks/useShopModeration';
import { useAuth } from '@/context/AuthContext';
import { ModerationPagination } from '@/components/moderation/ModerationPagination';
import {
  getPendingTaxonomies,
  updateTaxonomyStatus,
  getAllTaxonomyItems,
  type TaxonomyType,
  type TaxonomyItem,
  type TaxonomyItemWithCount,
} from '@/services/taxonomy.actions';

// ─── Design tokens (consistentes con Product Studio) ─────────────────────────────
const NAVY = '#142239';
const ORANGE = '#ec6d13';

type InboxType = 'products' | 'shops' | 'taxonomy';

const TAX_TYPE_LABELS: Record<TaxonomyType, string> = {
  crafts: 'Oficios',
  techniques: 'Técnicas',
  materials: 'Materiales',
  styles: 'Estilos',
  herramientas: 'Herramientas',
};

// ─── Fila unificada de la cola ───────────────────────────────────────────────────

interface QueueRow {
  id: string;
  imageUrl: string | null;
  name: string;
  shopName: string;
  createdAt: string;
  agreementName: string | null;
  issues: string[];
  // navegación al Studio
  shopId?: string;
}

// ─── Reason / confirm modal ──────────────────────────────────────────────────────

interface ReasonModalState {
  kind: 'reject' | 'approve';
  scope: 'single' | 'bulk';
  ids: string[];
}

const ReasonModal: React.FC<{
  state: ReasonModalState;
  busy: boolean;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
}> = ({ state, busy, onClose, onConfirm }) => {
  const [comment, setComment] = useState('');
  const isReject = state.kind === 'reject';
  const n = state.ids.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        style={{ fontFamily: "'Manrope', sans-serif" }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2">
          {isReject
            ? <XCircle className="h-5 w-5 text-red-600" />
            : <CheckCheck className="h-5 w-5 text-green-700" />}
          <h3 className="text-sm font-bold text-slate-800">
            {isReject ? 'Rechazar' : 'Aprobar'}{' '}
            {state.scope === 'bulk' ? `${n} elemento${n !== 1 ? 's' : ''}` : 'elemento'}
          </h3>
        </div>
        {isReject ? (
          <>
            <p className="mb-2 text-xs text-slate-500">
              El motivo queda registrado en el historial de auditoría.
            </p>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
              placeholder="Motivo del rechazo (mín. 10 caracteres)…"
              className="resize-none border-slate-200 text-xs" />
          </>
        ) : (
          <p className="text-xs text-slate-500">
            {state.scope === 'bulk'
              ? `Vas a publicar ${n} elemento${n !== 1 ? 's' : ''} sin abrirlos individualmente. Esta acción queda registrada.`
              : 'El elemento quedará publicado en el marketplace.'}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}
            className="text-xs text-slate-500">Cancelar</Button>
          <Button type="button" size="sm" disabled={busy || (isReject && comment.trim().length < 10)}
            onClick={() => onConfirm(isReject ? comment.trim() : undefined)}
            className={cn('gap-1.5 text-xs text-white',
              isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-green-700 hover:bg-green-800')}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Chip de banderas (issues) ───────────────────────────────────────────────────

const FlagsChip: React.FC<{ issues: string[] }> = ({ issues }) => {
  if (!issues.length) {
    return <span className="text-[11px] text-slate-300">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
      title={issues.join(' · ')}>
      <AlertTriangle className="h-3 w-3" />
      {issues.length}
    </span>
  );
};

// ─── Página ──────────────────────────────────────────────────────────────────────

const ModerationOSPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState<InboxType>('products');
  const [search, setSearch] = useState('');
  const [agreementFilter, setAgreementFilter] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [reasonModal, setReasonModal] = useState<ReasonModalState | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  // Taxonomy state
  const [taxonomyData, setTaxonomyData] = useState<Record<TaxonomyType, TaxonomyItem[]>>({} as Record<TaxonomyType, TaxonomyItem[]>);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [taxonomyActing, setTaxonomyActing] = useState<string | null>(null);
  const [mergeState, setMergeState] = useState<{
    itemId: string; type: TaxonomyType; query: string;
    results: TaxonomyItemWithCount[]; selectedId: string | null; searching: boolean;
  } | null>(null);

  const {
    products, counts: productCounts, pagination: productPagination, loading: productsLoading,
    fetchModerationQueue, fetchCounts, moderateProduct: modProduct, bulkModerateProducts,
  } = useProductModeration();

  const {
    shops, counts: shopCounts, pagination: shopPagination, loading: shopsLoading,
    fetchShops, toggleMarketplaceApproval, bulkToggleMarketplaceApproval,
  } = useShopModeration();

  // ─── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCounts();
    fetchShops({ filter: 'not_approved', page: 1 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Productos: búsqueda universal server-side (nombre, tienda, SKU, ciudad).
  const loadProducts = useCallback((page: number, searchTerm: string) => {
    fetchModerationQueue({
      status: 'pending_moderation',
      page,
      advancedFilters: { search: searchTerm, category: '', region: '', onlyNonMarketplace: false },
    });
  }, [fetchModerationQueue]);

  // Tiendas: búsqueda universal server-side (tienda, email del dueño, ciudad).
  const loadShops = useCallback((page: number, searchTerm: string) => {
    fetchShops({
      filter: 'not_approved',
      page,
      advancedFilters: { search: searchTerm, hasBankData: 'all', minApprovedProducts: 'all', region: '', craftType: '' },
    });
  }, [fetchShops]);

  // Debounce de la búsqueda server-side (productos y tiendas).
  useEffect(() => {
    if (type === 'taxonomy') return;
    const t = setTimeout(
      () => (type === 'products' ? loadProducts(1, search) : loadShops(1, search)),
      300,
    );
    return () => clearTimeout(t);
  }, [type, search, loadProducts, loadShops]);

  const fetchTaxonomies = useCallback(async () => {
    setTaxonomyLoading(true);
    try {
      setTaxonomyData(await getPendingTaxonomies());
    } catch {
      toast.error('Error al cargar taxonomías.');
    } finally {
      setTaxonomyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (type === 'taxonomy') fetchTaxonomies();
    setCheckedIds(new Set());
    setSearch('');
    setAgreementFilter('');
  }, [type, fetchTaxonomies]);

  // ─── Filas normalizadas ────────────────────────────────────────────────────
  const rows: QueueRow[] = useMemo(() => {
    if (type === 'products') {
      return products.map((p) => ({
        id: p.id,
        imageUrl: p.images?.[0] ?? null,
        name: p.name,
        shopName: p.artisan_shops?.shop_name ?? '—',
        createdAt: p.created_at,
        agreementName: p.agreementName ?? null,
        issues: buildProductIssues(p),
        shopId: p.artisan_shops?.id,
      }));
    }
    if (type === 'shops') {
      return shops.map((s) => ({
        id: s.id,
        imageUrl: s.logoUrl,
        name: s.shopName,
        shopName: s.region ?? '—',
        createdAt: s.createdAt,
        agreementName: s.agreementName ?? null,
        issues: buildShopIssues(s),
      }));
    }
    return [];
  }, [type, products, shops]);

  // Opciones de convenio derivadas de los datos presentes (hasta wiring de backend).
  const agreementOptions = useMemo(
    () => [...new Set(rows.map((r) => r.agreementName).filter(Boolean) as string[])].sort(),
    [rows],
  );

  const q = search.toLowerCase().trim();
  const filteredRows = useMemo(() => {
    let list = rows;
    // La búsqueda de productos y tiendas la resuelve el servidor (incluye
    // SKU/email/ciudad, que no están en la fila). El convenio se filtra en
    // cliente sobre la página cargada.
    if (agreementFilter) list = list.filter((r) => r.agreementName === agreementFilter);
    return list;
  }, [rows, agreementFilter]);

  const isLoading = type === 'products' ? productsLoading : type === 'shops' ? shopsLoading : taxonomyLoading;
  const pagination = type === 'products' ? productPagination : type === 'shops' ? shopPagination : null;

  const pendingCounts = {
    products: productCounts?.pending_moderation ?? 0,
    shops: shopCounts?.not_approved ?? 0,
    taxonomy: Object.values(taxonomyData).reduce((a, arr) => a + (arr?.length ?? 0), 0),
  };

  // ─── Refresh ────────────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    if (type === 'taxonomy') fetchTaxonomies();
    else if (type === 'shops') loadShops(1, search);
    else { loadProducts(1, search); fetchCounts(); }
  }, [type, fetchTaxonomies, loadShops, loadProducts, search, fetchCounts]);

  // ─── Acciones fila ────────────────────────────────────────────────────────────
  const reviewInStudio = useCallback((row: QueueRow) => {
    if (type === 'products' && row.shopId) {
      navigate(`/backoffice/studio?shopId=${row.shopId}&productId=${row.id}`);
    } else if (type === 'shops') {
      navigate(`/backoffice/store-studio?shopId=${row.id}`);
    }
  }, [type, navigate]);

  const approveRow = useCallback(async (id: string) => {
    setRowBusy(id);
    try {
      if (type === 'products') await modProduct(id, 'approve');
      else await toggleMarketplaceApproval(id, true);
    } finally {
      setRowBusy(null);
    }
  }, [type, modProduct, toggleMarketplaceApproval]);

  const doReject = useCallback(async (ids: string[], comment?: string) => {
    if (type === 'products') {
      if (ids.length === 1) await modProduct(ids[0], 'reject', comment);
      else await bulkModerateProducts(ids, 'reject', comment);
    } else {
      for (const id of ids) await toggleMarketplaceApproval(id, false, comment);
    }
  }, [type, modProduct, bulkModerateProducts, toggleMarketplaceApproval]);

  const doApprove = useCallback(async (ids: string[]) => {
    if (type === 'products') {
      if (ids.length === 1) await modProduct(ids[0], 'approve');
      else await bulkModerateProducts(ids, 'approve');
    } else {
      if (ids.length === 1) await toggleMarketplaceApproval(ids[0], true);
      else await bulkToggleMarketplaceApproval(ids, true);
    }
  }, [type, modProduct, bulkModerateProducts, toggleMarketplaceApproval, bulkToggleMarketplaceApproval]);

  const runModal = useCallback(async (comment?: string) => {
    if (!reasonModal) return;
    setBulkBusy(true);
    try {
      if (reasonModal.kind === 'reject') await doReject(reasonModal.ids, comment);
      else await doApprove(reasonModal.ids);
      setCheckedIds(new Set());
      if (type === 'shops') fetchShops({ filter: 'not_approved', page: 1 });
      if (type === 'products') fetchCounts();
    } finally {
      setBulkBusy(false);
      setReasonModal(null);
    }
  }, [reasonModal, doReject, doApprove, type, fetchShops, fetchCounts]);

  // ─── Taxonomy inline ──────────────────────────────────────────────────────────
  const handleTaxonomyAction = useCallback(async (
    item: TaxonomyItem, taxType: TaxonomyType, action: 'approved' | 'rejected',
  ) => {
    setTaxonomyActing(item.id);
    try {
      await updateTaxonomyStatus(taxType, item.id, action);
      toast.success(action === 'approved' ? `"${item.name}" aprobado.` : `"${item.name}" rechazado.`);
      setTaxonomyData((prev) => ({ ...prev, [taxType]: (prev[taxType] ?? []).filter((i) => i.id !== item.id) }));
    } catch {
      toast.error('Error al actualizar taxonomía.');
    } finally {
      setTaxonomyActing(null);
    }
  }, []);

  // Fusionar (merge → alias): busca el término canónico y fusiona el pendiente.
  const searchCanonical = useCallback(async (type: TaxonomyType, query: string) => {
    if (!query.trim()) {
      setMergeState((s) => (s ? { ...s, results: [], searching: false } : null));
      return;
    }
    setMergeState((s) => (s ? { ...s, searching: true } : null));
    try {
      const res = await getAllTaxonomyItems(type, { search: query, status: 'approved' });
      setMergeState((s) => (s ? { ...s, results: res.slice(0, 6), searching: false } : null));
    } catch {
      setMergeState((s) => (s ? { ...s, searching: false } : null));
    }
  }, []);

  const doMerge = useCallback(async (item: TaxonomyItem, taxType: TaxonomyType) => {
    if (!mergeState?.selectedId) return;
    setTaxonomyActing(item.id);
    try {
      await updateTaxonomyStatus(taxType, item.id, 'approved', mergeState.selectedId);
      setTaxonomyData((prev) => ({ ...prev, [taxType]: (prev[taxType] ?? []).filter((i) => i.id !== item.id) }));
      setMergeState(null);
      toast.success(`"${item.name}" registrado como alias.`);
    } catch {
      toast.error('No se pudo fusionar el término.');
    } finally {
      setTaxonomyActing(null);
    }
  }, [mergeState]);

  // Filas de taxonomía aplanadas + búsqueda
  const taxonomyRows = useMemo(() => {
    const flat: { item: TaxonomyItem; taxType: TaxonomyType }[] = [];
    (Object.keys(TAX_TYPE_LABELS) as TaxonomyType[]).forEach((taxType) => {
      (taxonomyData[taxType] ?? []).forEach((item) => flat.push({ item, taxType }));
    });
    if (!q) return flat;
    return flat.filter(({ item }) => item.name.toLowerCase().includes(q));
  }, [taxonomyData, q]);

  // ─── Selección ────────────────────────────────────────────────────────────────
  const toggleCheck = (id: string) => setCheckedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const allChecked = filteredRows.length > 0 && checkedIds.size === filteredRows.length;
  const toggleAll = () => setCheckedIds(allChecked ? new Set() : new Set(filteredRows.map((r) => r.id)));

  const showTable = type !== 'taxonomy';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f0ec]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: NAVY }}>
            <InboxIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Inbox</p>
            <p className="text-[11px] text-slate-400">Cola de pendientes por revisar</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={refresh} disabled={isLoading}
          title="Actualizar" className="h-8 w-8 border-slate-200">
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} style={{ color: ORANGE }} />
        </Button>
      </header>

      {/* Toolbar: tipo · búsqueda · convenio */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-5 py-2.5">
        {/* Tipo */}
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {([
            ['products', 'Productos', Package, pendingCounts.products],
            ['shops', 'Tiendas', Store, pendingCounts.shops],
            ['taxonomy', 'Taxonomías', Tag, pendingCounts.taxonomy],
          ] as [InboxType, string, React.ComponentType<{ className?: string }>, number][]).map(([val, label, Icon, count]) => (
            <button key={val} type="button" onClick={() => setType(val)}
              className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors',
                type === val ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              <Icon className="h-3.5 w-3.5" style={type === val ? { color: ORANGE } : undefined} />
              {label}
              {count > 0 && (
                <span className="rounded-full px-1.5 text-[9px] font-bold"
                  style={{ background: type === val ? 'rgba(236,109,19,0.12)' : '#e2e8f0', color: type === val ? ORANGE : '#64748b' }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Búsqueda universal */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, tienda, convenio…"
            className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300" />
        </div>

        {/* Convenio */}
        {showTable && (
          <div className="flex items-center gap-1.5">
            <Handshake className="h-3.5 w-3.5 text-slate-400" />
            <select value={agreementFilter} onChange={(e) => setAgreementFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 focus:outline-none">
              <option value="">Todos los convenios</option>
              {agreementOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Bulk bar */}
      {showTable && checkedIds.size > 0 && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-slate-200 bg-orange-50/60 px-5 py-2">
          <p className="mr-1 text-xs font-bold" style={{ color: ORANGE }}>
            {checkedIds.size} seleccionado{checkedIds.size !== 1 ? 's' : ''}
          </p>
          <Button type="button" size="sm" onClick={() => setReasonModal({ kind: 'approve', scope: 'bulk', ids: [...checkedIds] })}
            className="h-7 gap-1 bg-green-700 text-[11px] text-white hover:bg-green-800">
            <CheckCheck className="h-3 w-3" /> Aprobar
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => setReasonModal({ kind: 'reject', scope: 'bulk', ids: [...checkedIds] })}
            className="h-7 gap-1 text-[11px]">
            <XCircle className="h-3 w-3" /> Rechazar
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setCheckedIds(new Set())}
            className="ml-auto h-7 gap-1 text-[11px] text-slate-400 hover:text-slate-600">
            <X className="h-3 w-3" /> Cancelar
          </Button>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : type === 'taxonomy' ? (
          taxonomyRows.length === 0 ? (
            <EmptyState label="No hay taxonomías pendientes." />
          ) : (
            <div>
              {taxonomyRows.map(({ item, taxType }) => {
                const isMerging = mergeState?.itemId === item.id;
                return (
                  <div key={item.id} className="border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50">
                      <span className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                        style={{ background: 'rgba(20,34,57,0.06)', color: NAVY }}>
                        {TAX_TYPE_LABELS[taxType]}
                      </span>
                      <p className="flex-1 truncate text-[13px] font-semibold text-slate-800">{item.name}</p>
                      {item.createdAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                      <div className="flex gap-1.5">
                        <Button type="button" size="sm" disabled={taxonomyActing === item.id}
                          onClick={() => handleTaxonomyAction(item, taxType, 'approved')}
                          className="h-7 gap-1 bg-green-700 text-[11px] text-white hover:bg-green-800">
                          <CheckCheck className="h-3 w-3" /> Aprobar
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled={taxonomyActing === item.id}
                          onClick={() => setMergeState(isMerging ? null : { itemId: item.id, type: taxType, query: '', results: [], selectedId: null, searching: false })}
                          className={cn('h-7 gap-1 border-indigo-200 text-[11px] text-indigo-600 hover:bg-indigo-50', isMerging && 'bg-indigo-50')}>
                          <Combine className="h-3 w-3" /> Fusionar
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled={taxonomyActing === item.id}
                          onClick={() => handleTaxonomyAction(item, taxType, 'rejected')}
                          className="h-7 gap-1 border-red-200 text-[11px] text-red-600 hover:bg-red-50">
                          <XCircle className="h-3 w-3" /> Rechazar
                        </Button>
                      </div>
                    </div>

                    {isMerging && mergeState && (
                      <div className="mx-5 mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 text-[11px] font-bold text-slate-600">
                          Fusionar "{item.name}" como alias de un {TAX_TYPE_LABELS[taxType].toLowerCase().replace(/s$/, '')} existente:
                        </p>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input type="text" autoFocus value={mergeState.query}
                            onChange={(e) => {
                              const q = e.target.value;
                              setMergeState((s) => (s ? { ...s, query: q, selectedId: null } : null));
                              searchCanonical(taxType, q);
                            }}
                            placeholder="Buscar término canónico…"
                            className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300" />
                        </div>
                        {mergeState.searching && <p className="mt-1.5 text-[11px] italic text-slate-400">Buscando…</p>}
                        {mergeState.results.length > 0 && !mergeState.searching && (
                          <div className="mt-2 flex flex-col gap-1">
                            {mergeState.results.map((r) => (
                              <button key={r.id} type="button"
                                onClick={() => setMergeState((s) => (s ? { ...s, selectedId: r.id, query: r.name, results: [] } : null))}
                                className={cn('rounded-md border px-3 py-1.5 text-left text-xs',
                                  mergeState.selectedId === r.id ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
                                {r.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {mergeState.selectedId && (
                          <div className="mt-2.5 flex gap-2">
                            <Button type="button" size="sm" disabled={taxonomyActing === item.id}
                              onClick={() => doMerge(item, taxType)}
                              className="h-7 gap-1 bg-indigo-600 text-[11px] text-white hover:bg-indigo-700">
                              Confirmar fusión
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setMergeState(null)}
                              className="h-7 text-[11px] text-slate-400 hover:text-slate-600">Cancelar</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : filteredRows.length === 0 ? (
          <EmptyState label={q || agreementFilter ? 'Sin resultados para tu búsqueda.' : 'No hay pendientes por revisar. 🎉'} />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <th className="w-10 px-3 py-2">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="cursor-pointer" />
                </th>
                <th className="w-14 py-2">Foto</th>
                <th className="py-2">Nombre</th>
                <th className="py-2">{type === 'products' ? 'Tienda' : 'Región'}</th>
                <th className="py-2">Convenio</th>
                <th className="py-2 text-center">Banderas</th>
                <th className="py-2">Fecha</th>
                <th className="py-2 pr-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 bg-white hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={checkedIds.has(row.id)} onChange={() => toggleCheck(row.id)} className="cursor-pointer" />
                  </td>
                  <td className="py-2">
                    {row.imageUrl ? (
                      <img src={row.imageUrl} alt={row.name} className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                        {type === 'shops' ? <Store className="h-4 w-4 text-slate-300" /> : <Package className="h-4 w-4 text-slate-300" />}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <p className="max-w-[220px] truncate text-[13px] font-semibold text-slate-800">{row.name}</p>
                  </td>
                  <td className="py-2 pr-3 text-[12px] text-slate-500">
                    <span className="block max-w-[160px] truncate">{row.shopName}</span>
                  </td>
                  <td className="py-2 pr-3">
                    {row.agreementName
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <Handshake className="h-3 w-3" />{row.agreementName}
                        </span>
                      : <span className="text-[11px] text-slate-300">—</span>}
                  </td>
                  <td className="py-2 text-center"><FlagsChip issues={row.issues} /></td>
                  <td className="py-2 pr-3 text-[11px] text-slate-400">
                    {new Date(row.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button type="button" size="sm" disabled={rowBusy === row.id}
                        onClick={() => approveRow(row.id)}
                        className="h-7 gap-1 bg-green-700 text-[11px] text-white hover:bg-green-800">
                        {rowBusy === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                        Aprobar
                      </Button>
                      <Button type="button" size="sm" variant="outline" disabled={rowBusy === row.id}
                        onClick={() => setReasonModal({ kind: 'reject', scope: 'single', ids: [row.id] })}
                        className="h-7 gap-1 border-red-200 text-[11px] text-red-600 hover:bg-red-50">
                        <XCircle className="h-3 w-3" /> Rechazar
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => reviewInStudio(row)}
                        className="h-7 gap-1 border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
                        style={{ borderColor: 'rgba(20,34,57,0.15)' }}>
                        Revisar en Studio <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-slate-200 bg-white px-4 py-2">
          <ModerationPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.pageSize}
            onPageChange={(page) => {
              if (type === 'shops') loadShops(page, search);
              else loadProducts(page, search);
            }}
          />
        </div>
      )}

      {reasonModal && (
        <ReasonModal state={reasonModal} busy={bulkBusy}
          onClose={() => setReasonModal(null)} onConfirm={runModal} />
      )}
    </div>
  );
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
    <InboxIcon className="h-10 w-10 text-slate-300" />
    <p className="text-sm text-slate-400">{label}</p>
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────────

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
