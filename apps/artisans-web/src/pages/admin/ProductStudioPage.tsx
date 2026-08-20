import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Store,
  Package,
  ChevronRight,
  Search,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductStudio } from '@/hooks/useProductStudio';
import { useShopRailFilters } from '@/hooks/useShopRailFilters';
import { StudioShopRail } from '@/components/studio/StudioShopRail';
import { ProductReviewWizard } from '@/components/studio/ProductReviewWizard';
import { ModerationActionBar } from '@/components/moderation/ModerationActionBar';
import { ReadinessPanel } from '@/components/studio/ReadinessPanel';
import { computeProductReadiness } from '@/components/studio/readiness';
import type { ModerationAction, StudioShop } from '@/hooks/useProductStudio';
import type { NewWizardState } from '@/components/shop/new-product-wizard/hooks/useNewWizardState';
import { buildTestProductState, type InjectVariant } from '@/components/studio/test-data/buildTestProduct';

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

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

/** Datos de la tienda que el wizard de creación no puede adivinar por pieza. */
function seedFromShop(shop: StudioShop): Partial<NewWizardState> {
  return {
    workshopName: shop.shopName,
    ...(shop.region ? { department: shop.region, shippingOrigin: shop.region } : {}),
  };
}

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function ProductStudioPage() {
  const {
    shops, loadingShops, fetchAllShops,
    selectedShop, selectShop,
    products, loadingProducts, productCounts,
    selectedProduct, loadingProduct, selectProduct, clearProduct,
    saving, updateProduct, createProduct,
    moderating, moderateProductAction,
    taxonomy, loadTaxonomy,
  } = useProductStudio();

  const rail = useShopRailFilters(shops);
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAllShops();
    loadTaxonomy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deep-link desde el Inbox: /backoffice/studio?shopId=…&productId=…
  const [searchParams] = useSearchParams();
  const deepLinkedRef = useRef(false);
  useEffect(() => {
    if (deepLinkedRef.current || shops.length === 0) return;
    const shopId = searchParams.get('shopId');
    const productId = searchParams.get('productId');
    if (!shopId || !productId) return;
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) return;
    deepLinkedRef.current = true;
    selectShop(shop);
    selectProduct(productId);
  }, [shops, searchParams, selectShop, selectProduct]);

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

  // Navegación por la cola de pendientes de la tienda seleccionada.
  const adjacentPendingId = (dir: 1 | -1): string | null => {
    if (!selectedProduct) return null;
    const idx = products.findIndex((p) => p.id === selectedProduct.id);
    if (idx === -1) return null;
    for (let i = idx + dir; i >= 0 && i < products.length; i += dir) {
      if (products[i].status === 'pending_moderation') return products[i].id;
    }
    return null;
  };
  const goAdjacentPending = (dir: 1 | -1) => {
    const id = adjacentPendingId(dir);
    if (id) selectProduct(id);
  };

  // Crear una pieza en nombre de la tienda seleccionada: queda en borrador y el
  // Studio salta a su ficha para revisarla/enviarla.
  const handleCreate = async (dto: Parameters<typeof createProduct>[0]) => {
    const ok = await createProduct(dto);
    if (ok) setCreating(false);
    return ok;
  };

  // Datos de prueba para la tienda seleccionada: solo rellena el formulario, no guarda.
  const handleInject = async (variant: InjectVariant): Promise<Partial<NewWizardState> | null> => {
    if (!selectedShop) return null;
    if (taxonomy.crafts.length === 0 && taxonomy.categories.length === 0) {
      toast.error('La taxonomía aún no cargó; intenta de nuevo en unos segundos');
      return null;
    }
    try {
      const patch = await buildTestProductState({ variant, shop: selectedShop, taxonomy });
      toast.success(
        variant === 'realista'
          ? 'Datos de prueba inyectados según el oficio de la tienda'
          : 'Ficha "próximamente" inyectada',
      );
      return patch;
    } catch (err) {
      console.error('[ProductStudio] Error inyectando datos de prueba:', err);
      toast.error('No se pudieron generar los datos de prueba');
      return null;
    }
  };

  const handleModerate = async (action: ModerationAction, comment?: string) => {
    if (!selectedProduct) return;
    await moderateProductAction(selectedProduct.id, action, comment);
    // Tras decidir, avanzar automáticamente al siguiente pendiente.
    goAdjacentPending(1);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Sidebar tiendas (rail compartido, colapsable) ────────────────── */}
      <StudioShopRail
        title="Product Studio"
        controller={rail}
        selectedId={selectedShop?.id ?? null}
        onSelect={(s) => { setCreating(false); selectShop(s); }}
        loading={loadingShops}
        showHealth
      />

      {/* ── Área principal ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f0ec]">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-white">
          {creating && selectedShop ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}
                className="gap-1 text-sm text-slate-500 hover:text-slate-900 px-2">
                <ArrowLeft className="h-4 w-4" />
                {selectedShop.shopName}
              </Button>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-sm font-semibold text-slate-800">Nuevo producto</span>
              <span className="ml-auto text-xs text-slate-400">Se guardará como borrador de esta tienda</span>
            </>
          ) : selectedProduct ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={clearProduct}
                className="gap-1 text-sm text-slate-500 hover:text-slate-900 px-2">
                <ArrowLeft className="h-4 w-4" />
                {selectedShop?.shopName ?? 'Tienda'}
              </Button>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-sm font-semibold text-slate-800 truncate max-w-xs">{selectedProduct.name}</span>
              <StatusBadge status={selectedProduct.status} />
              {selectedShop?.agreementName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                  title="Convenio">
                  <span className="material-symbols-outlined text-[12px]">handshake</span>
                  {selectedShop.agreementName}
                </span>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                <Button type="button" variant="outline" size="sm" disabled={!adjacentPendingId(-1)}
                  onClick={() => goAdjacentPending(-1)} className="h-7 gap-1 text-xs">
                  <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={!adjacentPendingId(1)}
                  onClick={() => goAdjacentPending(1)} className="h-7 gap-1 text-xs">
                  Siguiente <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          ) : selectedShop ? (
            <>
              <Store className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">{selectedShop.shopName}</span>
              {selectedShop.region && <span className="text-xs text-slate-400">{selectedShop.region}</span>}
              <span className="ml-auto text-xs text-slate-500">
                {productCounts.total} producto{productCounts.total !== 1 ? 's' : ''}
              </span>
              <Button type="button" size="sm" onClick={() => setCreating(true)}
                className="h-7 gap-1 text-xs font-semibold text-white hover:opacity-90"
                style={{ background: ORANGE }}>
                <Plus className="h-3.5 w-3.5" /> Nuevo producto
              </Button>
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

          {/* Alta de producto por el moderador (mismos 6 pasos del artesano) */}
          {selectedShop && creating && (
            <div className="h-full min-h-0">
              <ProductReviewWizard
                mode="create"
                seed={seedFromShop(selectedShop)}
                shopUserId={selectedShop.userId}
                shopId={selectedShop.id}
                onSave={handleCreate}
                onCancelCreate={() => setCreating(false)}
                onInject={handleInject}
                saving={saving}
              />
            </div>
          )}

          {/* Lista de productos */}
          {selectedShop && !creating && !selectedProduct && (
            <div className="h-full flex flex-col">
              {/* Filtros */}
              <div className="flex-shrink-0 px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input type="text" placeholder="Buscar producto…" value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 h-8 text-xs border-slate-200 focus-visible:ring-blue-400" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    ['all', 'Todos', productCounts.total],
                    ['pending_moderation', 'Pendientes', productCounts.pending],
                    ['approved', 'Aprobados', productCounts.approved],
                    ['changes_requested', 'Con cambios', productCounts.changes_requested],
                    ['rejected', 'Rechazados', productCounts.rejected],
                  ] as [string, string, number][]).map(([val, label, count]) => (
                    <Button key={val} type="button" size="sm" onClick={() => setProductStatusFilter(val)}
                      className={cn(
                        'rounded-full h-7 px-3 text-[11px] font-semibold transition-colors',
                        productStatusFilter === val
                          ? 'bg-[#142239] text-white hover:bg-[#1a2d4a]'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}>
                      {label}
                      {count > 0 && (
                        <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                          productStatusFilter === val ? 'bg-white/20' : 'bg-slate-200')}>
                          {count}
                        </span>
                      )}
                    </Button>
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
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <Package className="h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-500">Sin productos en esta vista</p>
                    <Button type="button" size="sm" onClick={() => setCreating(true)}
                      className="gap-1 text-xs font-semibold text-white hover:opacity-90"
                      style={{ background: ORANGE }}>
                      <Plus className="h-3.5 w-3.5" /> Nuevo producto
                    </Button>
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
          {selectedShop && !creating && selectedProduct && !loadingProduct && (() => {
            const readiness = computeProductReadiness(selectedProduct);
            const guardedModerate = (action: ModerationAction, comment?: string) => {
              if (action === 'approve' && !readiness.ready &&
                  !window.confirm('Faltan requisitos para este producto. ¿Aprobar de todas formas?')) {
                return;
              }
              handleModerate(action, comment);
            };
            return (
              <div className="flex h-full min-h-0">
                {/* Centro: wizard */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <ProductReviewWizard
                      product={selectedProduct}
                      shopUserId={selectedShop?.userId}
                      shopId={selectedShop?.id}
                      onSave={updateProduct}
                      saving={saving}
                    />
                  </div>
                </div>
                {/* Derecha: panel "¿listo para aprobar?" + acciones */}
                <aside className="w-80 flex-shrink-0 border-l border-slate-200">
                  <ReadinessPanel title="¿Listo para aprobar?" items={readiness.items} ready={readiness.ready}>
                    <ModerationActionBar
                      status={selectedProduct.status}
                      busy={moderating}
                      onAction={guardedModerate}
                    />
                  </ReadinessPanel>
                </aside>
              </div>
            );
          })()}

          {selectedShop && !creating && selectedProduct && loadingProduct && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
