import React, { useEffect, useMemo, useState } from 'react';
import {
  Store,
  Package,
  ChevronRight,
  Search,
  Loader2,
  ArrowLeft,
  CheckCheck,
  Edit3,
  MessageCircle,
  XCircle,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductStudio, type StudioShop } from '@/hooks/useProductStudio';
import { StudioProductEditor } from '@/components/studio/StudioProductEditor';
import type { ModerationAction } from '@/hooks/useProductStudio';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const NAVY   = '#142239';
const ORANGE = '#ec6d13';
const GOLDEN = '#c29200';
const GREEN  = '#166534';

// ─── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:               { label: 'Borrador',            color: '#6b7280', bg: '#f3f4f6' },
  pending_moderation:  { label: 'Pendiente',           color: ORANGE,    bg: '#fff7ed' },
  changes_requested:   { label: 'Con cambios',         color: GOLDEN,    bg: '#fffbeb' },
  approved:            { label: 'Aprobado',            color: GREEN,     bg: '#f0fdf4' },
  approved_with_edits: { label: 'Aprobado (ajustado)', color: GREEN,     bg: '#f0fdf4' },
  rejected:            { label: 'No publicado',        color: '#dc2626', bg: '#fef2f2' },
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

function HealthDot({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? GOLDEN : '#ef4444';
  return <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function ShopRow({ shop, selected, onClick }: { shop: StudioShop; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors rounded-md',
        selected ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white',
      )}>
      {shop.logoUrl ? (
        <img src={shop.logoUrl} alt={shop.shopName} className="h-7 w-7 rounded-md object-cover flex-shrink-0" />
      ) : (
        <div className="h-7 w-7 rounded-md flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <Store className="h-3.5 w-3.5 opacity-60" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate leading-tight">{shop.shopName}</p>
        <p className="text-[10px] opacity-50 truncate">{shop.region ?? shop.craftType ?? '–'}</p>
      </div>
      <HealthDot score={shop.healthScore} />
    </button>
  );
}

// ─── Decision bar ───────────────────────────────────────────────────────────────

function DecisionBar({ status, moderating, onAction }: {
  status: string;
  moderating: boolean;
  onAction: (action: ModerationAction, comment?: string) => void;
}) {
  const [showComment, setShowComment] = useState<ModerationAction | null>(null);
  const [comment, setComment] = useState('');

  const handleAction = (action: ModerationAction) => {
    if (action === 'approve' || action === 'approve_with_edits') {
      onAction(action);
    } else {
      setShowComment(action);
    }
  };

  const handleConfirm = () => {
    if (showComment && comment.trim().length >= 10) {
      onAction(showComment, comment.trim());
      setShowComment(null);
      setComment('');
    }
  };

  return (
    <div className="border-t px-4 py-3 space-y-2 flex-shrink-0"
      style={{ borderColor: 'rgba(20,34,57,0.12)', background: '#f8fafc' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Decisión</span>
          <StatusBadge status={status} />
        </div>
        {moderating && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {!showComment && (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={moderating} onClick={() => handleAction('approve')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            style={{ background: GREEN }}>
            <CheckCheck className="h-3.5 w-3.5" /> Aprobar
          </button>
          <button type="button" disabled={moderating} onClick={() => handleAction('request_changes')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            style={{ background: GOLDEN }}>
            <MessageCircle className="h-3.5 w-3.5" /> Pedir cambios
          </button>
          <button type="button" disabled={moderating} onClick={() => handleAction('approve_with_edits')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            style={{ background: '#2563eb' }}>
            <Edit3 className="h-3.5 w-3.5" /> Aprobar con ajustes
          </button>
          <button type="button" disabled={moderating} onClick={() => handleAction('reject')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            style={{ background: '#dc2626' }}>
            <XCircle className="h-3.5 w-3.5" /> No publicar
          </button>
        </div>
      )}

      {showComment && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              {showComment === 'request_changes' ? 'Mensaje al artesano' : 'Motivo de rechazo'}
            </p>
            <button type="button" onClick={() => setShowComment(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600">Cancelar</button>
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
            placeholder="Mín. 10 caracteres…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button type="button" disabled={comment.trim().length < 10 || moderating} onClick={handleConfirm}
            className="w-full rounded-lg py-2 text-xs font-semibold text-white disabled:opacity-40"
            style={{ background: showComment === 'request_changes' ? GOLDEN : '#dc2626' }}>
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function ProductStudioPage() {
  const {
    shops, loadingShops, fetchAllShops,
    selectedShop, selectShop,
    products, loadingProducts, productCounts,
    selectedProduct, loadingProduct, selectProduct, clearProduct,
    saving, updateProduct,
    moderating, moderateProductAction,
    taxonomy, loadTaxonomy,
  } = useProductStudio();

  const [shopSearch, setShopSearch] = useState('');
  const [shopSort, setShopSort] = useState<'az' | 'za' | 'recent' | 'health'>('az');
  const [shopFilter, setShopFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchAllShops();
    loadTaxonomy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredShops = useMemo(() => {
    let list = shops;
    if (shopFilter === 'approved') list = list.filter((s) => s.marketplaceApproved);
    else if (shopFilter === 'pending') list = list.filter((s) => !s.marketplaceApproved);
    if (shopSearch.trim()) {
      const q = shopSearch.toLowerCase();
      list = list.filter((s) =>
        s.shopName.toLowerCase().includes(q) || (s.region ?? '').toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (shopSort === 'az') return a.shopName.localeCompare(b.shopName);
      if (shopSort === 'za') return b.shopName.localeCompare(a.shopName);
      if (shopSort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (shopSort === 'health') return b.healthScore - a.healthScore;
      return 0;
    });
  }, [shops, shopSearch, shopSort, shopFilter]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (productStatusFilter !== 'all') {
      list = list.filter((p) =>
        productStatusFilter === 'approved'
          ? p.status === 'approved' || p.status === 'approved_with_edits'
          : p.status === productStatusFilter,
      );
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, productStatusFilter, productSearch]);

  const handleModerate = async (action: ModerationAction, comment?: string) => {
    if (!selectedProduct) return;
    await moderateProductAction(selectedProduct.id, action, comment);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Sidebar tiendas ──────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 flex flex-col overflow-hidden" style={{ background: NAVY }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Product Studio</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-300" />
            <input type="text" placeholder="Buscar tienda…" value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
              className="w-full rounded-md pl-7 pr-2 py-1.5 text-xs text-white placeholder-blue-400 focus:outline-none focus:ring-1 focus:ring-white/30"
              style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 pb-3 flex-shrink-0 grid grid-cols-2 gap-1.5">
          <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold text-white">{shops.length}</p>
            <p className="text-[10px] text-blue-300">Tiendas</p>
          </div>
          <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold" style={{ color: ORANGE }}>{shops.filter((s) => s.marketplaceApproved).length}</p>
            <p className="text-[10px] text-blue-300">Aprobadas</p>
          </div>
        </div>

        {/* Filtro + Orden */}
        <div className="px-3 pb-3 flex-shrink-0 space-y-2">
          {/* Filtro estado */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3 w-3 text-blue-400 flex-shrink-0" />
            <div className="flex flex-1 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {(['all', 'approved', 'pending'] as const).map((val) => (
                <button key={val} type="button" onClick={() => setShopFilter(val)}
                  className="flex-1 py-1 text-[10px] font-semibold transition-colors"
                  style={shopFilter === val
                    ? { background: ORANGE, color: '#fff' }
                    : { color: 'rgba(255,255,255,0.5)' }}>
                  {val === 'all' ? 'Todas' : val === 'approved' ? 'Aprobadas' : 'Pendientes'}
                </button>
              ))}
            </div>
          </div>
          {/* Orden */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3 w-3 text-blue-400 flex-shrink-0" />
            <select value={shopSort} onChange={(e) => setShopSort(e.target.value as typeof shopSort)}
              className="flex-1 rounded-md px-2 py-1 text-[11px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/30 appearance-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <option value="az" style={{ background: NAVY }}>A → Z</option>
              <option value="za" style={{ background: NAVY }}>Z → A</option>
              <option value="recent" style={{ background: NAVY }}>Más recientes</option>
              <option value="health" style={{ background: NAVY }}>Mejor health score</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {loadingShops ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
            </div>
          ) : filteredShops.length === 0 ? (
            <p className="text-center py-6 text-xs text-blue-400">Sin resultados</p>
          ) : (
            filteredShops.map((shop) => (
              <ShopRow key={shop.id} shop={shop}
                selected={selectedShop?.id === shop.id}
                onClick={() => selectShop(shop)} />
            ))
          )}
        </div>
      </aside>

      {/* ── Área principal ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f0ec]">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-white">
          {selectedProduct ? (
            <>
              <button type="button" onClick={clearProduct}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {selectedShop?.shopName ?? 'Tienda'}
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-sm font-semibold text-slate-800 truncate max-w-xs">{selectedProduct.name}</span>
              <StatusBadge status={selectedProduct.status} />
            </>
          ) : selectedShop ? (
            <>
              <Store className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">{selectedShop.shopName}</span>
              {selectedShop.region && <span className="text-xs text-slate-400">{selectedShop.region}</span>}
              <span className="ml-auto text-xs text-slate-500">
                {productCounts.total} producto{productCounts.total !== 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-400">Selecciona una tienda para comenzar</span>
          )}
        </header>

        {/* Body */}
        <div className="flex-1 overflow-hidden">

          {/* Empty state */}
          {!selectedShop && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-3">
                <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${NAVY}15` }}>
                  <Package className="h-8 w-8" style={{ color: NAVY }} />
                </div>
                <p className="text-sm font-semibold text-slate-700">Product Studio</p>
                <p className="text-xs text-slate-400 max-w-xs">Selecciona una tienda en la barra lateral para ver y gestionar sus productos.</p>
              </div>
            </div>
          )}

          {/* Lista de productos */}
          {selectedShop && !selectedProduct && (
            <div className="h-full flex flex-col">
              {/* Filtros */}
              <div className="flex-shrink-0 px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input type="text" placeholder="Buscar producto…" value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    ['all', 'Todos', productCounts.total],
                    ['pending_moderation', 'Pendientes', productCounts.pending],
                    ['approved', 'Aprobados', productCounts.approved],
                    ['changes_requested', 'Con cambios', productCounts.changes_requested],
                    ['rejected', 'Rechazados', productCounts.rejected],
                  ] as [string, string, number][]).map(([val, label, count]) => (
                    <button key={val} type="button" onClick={() => setProductStatusFilter(val)}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                        productStatusFilter === val ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                      style={productStatusFilter === val ? { background: NAVY } : undefined}>
                      {label}
                      {count > 0 && (
                        <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                          productStatusFilter === val ? 'bg-white/20' : 'bg-white')}>
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-5">
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-2">
                    <Package className="h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-500">Sin productos en esta vista</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredProducts.map((product) => {
                      const primaryImage = product.media
                        ?.filter((m) => m.mediaType === 'image')
                        .sort((a, b) => a.displayOrder - b.displayOrder)[0];
                      return (
                        <button key={product.id} type="button"
                          onClick={() => selectProduct(product.id)}
                          className="group rounded-2xl overflow-hidden text-left transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.82)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.65)',
                            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.04)',
                          }}>
                          <div className="aspect-square bg-slate-100 overflow-hidden">
                            {primaryImage ? (
                              <img src={primaryImage.mediaUrl} alt={product.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-1.5">
                            <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug font-['Manrope']">
                              {product.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <StatusBadge status={product.status} />
                              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Editor de producto */}
          {selectedShop && selectedProduct && !loadingProduct && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden min-h-0">
                <StudioProductEditor
                  product={selectedProduct}
                  taxonomy={taxonomy}
                  saving={saving}
                  onUpdate={updateProduct}
                />
              </div>
              <DecisionBar
                status={selectedProduct.status}
                moderating={moderating}
                onAction={handleModerate}
              />
            </div>
          )}

          {selectedShop && selectedProduct && loadingProduct && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
