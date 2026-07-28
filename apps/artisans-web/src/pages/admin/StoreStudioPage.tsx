import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store, Loader2, ChevronLeft, ChevronRight, Handshake } from 'lucide-react';
import { toast } from 'sonner';
import { useShopModeration } from '@/hooks/useShopModeration';
import { useShopRailFilters } from '@/hooks/useShopRailFilters';
import { getArtisanShopById, updateArtisanShop } from '@/services/artisanShops.actions';
import { getApprovedProductsCount } from '@/services/products.actions';
import type { ArtisanShop, UpdateArtisanShopPayload } from '@/types/artisanShop.types';
import { StudioShopRail } from '@/components/studio/StudioShopRail';
import { StoreReviewWizard } from '@/components/studio/StoreReviewWizard';
import { ModerationActionBar, type ModerationDecision } from '@/components/moderation/ModerationActionBar';
import { ReadinessPanel } from '@/components/studio/ReadinessPanel';
import { computeShopReadiness, isShopApproved, isShopPublished } from '@/components/studio/readiness';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

const NAVY = '#142239';

export default function StoreStudioPage() {
  const { shops, loading: loadingShops, fetchAllShops, toggleMarketplaceApproval, publishShopAdmin, updating } = useShopModeration();
  const rail = useShopRailFilters(shops);

  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [fullShop, setFullShop] = useState<ArtisanShop | null>(null);
  const [loadingShop, setLoadingShop] = useState(false);
  const [savingShop, setSavingShop] = useState(false);
  const [approvedProductsCount, setApprovedProductsCount] = useState(0);

  // Conteo real de productos aprobados de la tienda seleccionada (para el checklist).
  useEffect(() => {
    if (!fullShop?.id) { setApprovedProductsCount(0); return; }
    let cancelled = false;
    getApprovedProductsCount(fullShop.id)
      .then((n) => { if (!cancelled) setApprovedProductsCount(n); })
      .catch(() => { if (!cancelled) setApprovedProductsCount(0); });
    return () => { cancelled = true; };
  }, [fullShop?.id]);

  useEffect(() => {
    fetchAllShops();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectShop = async (id: string) => {
    setSelectedShopId(id);
    setLoadingShop(true);
    setFullShop(null);
    try {
      const s = await getArtisanShopById(id);
      setFullShop(s);
    } finally {
      setLoadingShop(false);
    }
  };

  // Deep-link desde el Inbox: /backoffice/store-studio?shopId=…
  const [searchParams] = useSearchParams();
  const deepLinkedRef = useRef(false);
  useEffect(() => {
    if (deepLinkedRef.current || shops.length === 0) return;
    const shopId = searchParams.get('shopId');
    if (!shopId) return;
    deepLinkedRef.current = true;
    selectShop(shopId);
  }, [shops, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navegación por la cola (prev/siguiente sobre la lista filtrada del rail).
  const adjacentShopId = (dir: 1 | -1): string | null => {
    if (!selectedShopId) return null;
    const list = rail.filteredShops;
    const idx = list.findIndex((s) => s.id === selectedShopId);
    if (idx === -1) return null;
    const next = list[idx + dir];
    return next ? next.id : null;
  };
  const goAdjacent = (dir: 1 | -1) => {
    const id = adjacentShopId(dir);
    if (id) selectShop(id);
  };

  const handleModerate = async (action: ModerationDecision, comment?: string) => {
    if (!selectedShopId) return;
    if (action === 'approve') await toggleMarketplaceApproval(selectedShopId, true);
    else if (action === 'reject') await toggleMarketplaceApproval(selectedShopId, false, comment);
    const nextId = adjacentShopId(1);
    await fetchAllShops();
    if (nextId) selectShop(nextId);
    else { setSelectedShopId(null); setFullShop(null); }
  };

  // Edición desde el Studio: persiste vía PATCH /artisan-shops/:id sin tocar moderación.
  const handleSaveShop = async (payload: UpdateArtisanShopPayload): Promise<boolean> => {
    if (!selectedShopId) return false;
    setSavingShop(true);
    try {
      const updated = await updateArtisanShop(selectedShopId, payload);
      setFullShop(updated);
      toast.success('Tienda actualizada');
      return true;
    } catch {
      toast.error('Error al guardar la tienda');
      return false;
    } finally {
      setSavingShop(false);
    }
  };

  // Publicar / despublicar (gate separado de aprobar) — refresca la tienda actual.
  const handlePublish = async () => {
    if (!selectedShopId || !fullShop) return;
    const ok = await publishShopAdmin(selectedShopId, isShopPublished(fullShop) ? 'unpublish' : 'publish');
    if (ok) {
      const refreshed = await getArtisanShopById(selectedShopId);
      setFullShop(refreshed);
    }
  };

  const shopStatus = fullShop?.marketplaceApproved ? 'approved' : 'pending_moderation';

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <StudioShopRail
        title="Store Studio"
        controller={rail}
        selectedId={selectedShopId}
        onSelect={(s) => selectShop(s.id)}
        loading={loadingShops}
      />

      {/* Área principal */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#f5f0ec]">
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
          {fullShop ? (
            <>
              <Store className="h-4 w-4 text-slate-400" />
              <span className="truncate text-sm font-semibold text-slate-800">{fullShop.shopName}</span>
              {(fullShop as any).agreementName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <Handshake className="h-3 w-3" />{(fullShop as any).agreementName}
                </span>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                <Button type="button" variant="outline" size="sm" disabled={!adjacentShopId(-1)}
                  onClick={() => goAdjacent(-1)} className="h-7 gap-1 text-xs">
                  <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={!adjacentShopId(1)}
                  onClick={() => goAdjacent(1)} className="h-7 gap-1 text-xs">
                  Siguiente <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-400">Selecciona una tienda para revisar</span>
          )}
        </header>

        <div className="flex-1 overflow-hidden">
          {loadingShop ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : fullShop ? (() => {
            const readiness = computeShopReadiness(fullShop, approvedProductsCount);
            const approved = isShopApproved(fullShop);
            const published = isShopPublished(fullShop);
            const guardedModerate = (action: ModerationDecision, comment?: string) => {
              if (action === 'approve' && !readiness.ready &&
                  !window.confirm('Faltan requisitos para esta tienda. ¿Aprobar de todas formas?')) {
                return;
              }
              handleModerate(action, comment);
            };
            return (
              <div className="flex h-full min-h-0">
                {/* Centro: wizard de revisión de tienda */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <StoreReviewWizard shop={fullShop} onSave={handleSaveShop} saving={savingShop} />
                  </div>
                </div>
                {/* Derecha: panel "¿listo para aprobar?" + acciones */}
                <aside className="w-80 flex-shrink-0 border-l border-slate-200">
                  <ReadinessPanel
                    title="¿Listo para aprobar?"
                    items={readiness.items}
                    ready={readiness.ready}
                    statusRows={[
                      { label: 'Aprobada en marketplace', ok: approved },
                      { label: 'Publicada (visible)', ok: published },
                    ]}
                  >
                    <div className="space-y-2 p-3">
                      <Button
                        type="button"
                        variant={published ? 'outline' : 'default'}
                        className="w-full"
                        disabled={updating || !approved}
                        onClick={handlePublish}
                        title={!approved ? 'Primero aprueba la tienda' : undefined}
                      >
                        {published ? <><EyeOff className="mr-2 h-4 w-4" />Despublicar</> : <><Eye className="mr-2 h-4 w-4" />Publicar</>}
                      </Button>
                      <ModerationActionBar
                        status={shopStatus}
                        busy={updating}
                        actions={['approve', 'reject']}
                        onAction={guardedModerate}
                      />
                    </div>
                  </ReadinessPanel>
                </aside>
              </div>
            );
          })() : (
            <div className="flex h-full items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${NAVY}15` }}>
                  <Store className="h-8 w-8" style={{ color: NAVY }} />
                </div>
                <p className="text-sm font-semibold text-slate-700">Store Studio</p>
                <p className="max-w-xs text-xs text-slate-400">Selecciona una tienda de la barra lateral para revisar su perfil y configuración.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
