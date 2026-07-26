import React, { useState } from 'react';
import {
  Store, Search, Loader2, SlidersHorizontal, MapPin, Handshake, Hammer, ArrowUpDown,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RailShop, ShopRailController } from '@/hooks/useShopRailFilters';

const NAVY = '#142239';
const ORANGE = '#ec6d13';

function HealthDot({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#c29200' : '#ef4444';
  return <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />;
}

function ShopRow<T extends RailShop>({
  shop, selected, showHealth, onClick,
}: { shop: T; selected: boolean; showHealth: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn('flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors',
        selected ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')}>
      {shop.logoUrl ? (
        <img src={shop.logoUrl} alt={shop.shopName} className="h-7 w-7 flex-shrink-0 rounded-md object-cover" />
      ) : (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <Store className="h-3.5 w-3.5 opacity-60" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium leading-tight">
          {shop.shopName}
          {shop.agreementName && <span className="ml-1.5 text-[9px] font-normal opacity-50">· {shop.agreementName}</span>}
        </p>
        <p className="truncate text-[10px] opacity-50">{shop.region ?? shop.craftType ?? '–'}</p>
      </div>
      {showHealth && shop.healthScore !== undefined && <HealthDot score={shop.healthScore} />}
    </button>
  );
}

const selectClass =
  'flex-1 cursor-pointer appearance-none rounded-md px-2 py-1 text-[11px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/30';
const selectStyle = { background: 'rgba(255,255,255,0.08)' } as const;

interface StudioShopRailProps<T extends RailShop> {
  title: string;
  controller: ShopRailController<T>;
  selectedId: string | null;
  onSelect: (shop: T) => void;
  loading: boolean;
  /** Muestra el punto de salud + la opción de orden por salud (Product Studio). */
  showHealth?: boolean;
}

/**
 * Rail lateral navy compartido por Product Studio y Store Studio.
 * Filtros e información unificados (estado, región, oficio, convenio, orden +
 * stats + contador) y colapsable a una franja estrecha.
 */
export function StudioShopRail<T extends RailShop>({
  title, controller, selectedId, onSelect, loading, showHealth = false,
}: StudioShopRailProps<T>) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    search, setSearch, statusFilter, setStatusFilter,
    regionFilter, setRegionFilter, craftFilter, setCraftFilter,
    agreementFilter, setAgreementFilter, sort, setSort,
    filteredShops, regionOptions, craftOptions, agreementOptions, stats,
  } = controller;

  if (collapsed) {
    return (
      <aside className="flex w-12 flex-shrink-0 flex-col items-center py-4" style={{ background: NAVY }}>
        <button type="button" onClick={() => setCollapsed(false)} title="Expandir"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-200 hover:bg-white/10 hover:text-white">
          <ChevronsRight className="h-4 w-4" />
        </button>
        <div className="mt-3 flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: ORANGE }}>
          <Store className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="mt-3 rotate-180 text-[10px] font-semibold tracking-wide text-blue-300" style={{ writingMode: 'vertical-rl' }}>
          {filteredShops.length} tiendas
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-72 flex-shrink-0 flex-col overflow-hidden" style={{ background: NAVY }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pb-3 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: ORANGE }}>
            <Store className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">{title}</span>
          <button type="button" onClick={() => setCollapsed(true)} title="Colapsar"
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-blue-300 hover:bg-white/10 hover:text-white">
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-blue-300" />
          <input type="text" placeholder="Buscar tienda…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md py-1.5 pl-7 pr-2 text-xs text-white placeholder-blue-400 focus:outline-none focus:ring-1 focus:ring-white/30"
            style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid flex-shrink-0 grid-cols-3 gap-1.5 px-3 pb-3">
        {([['Tiendas', stats.total, '#fff'], ['Aprob.', stats.approved, ORANGE], ['Pend.', stats.pending, '#93c5fd']] as const).map(([label, val, color]) => (
          <div key={label} className="rounded-lg px-2 py-1.5 text-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold" style={{ color }}>{val}</p>
            <p className="text-[10px] text-blue-300">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex-shrink-0 space-y-2 px-3 pb-3">
        {/* Estado */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3 w-3 flex-shrink-0 text-blue-400" />
          <div className="flex flex-1 overflow-hidden rounded-md" style={{ background: 'rgba(255,255,255,0.08)' }}>
            {(['all', 'approved', 'pending'] as const).map((val) => (
              <button key={val} type="button" onClick={() => setStatusFilter(val)}
                className="flex-1 py-1 text-[10px] font-semibold transition-colors"
                style={statusFilter === val ? { background: ORANGE, color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }}>
                {val === 'all' ? 'Todas' : val === 'approved' ? 'Aprobadas' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>
        {/* Región */}
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 flex-shrink-0 text-blue-400" />
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className={selectClass} style={selectStyle}>
            <option value="all" style={{ background: NAVY }}>Todas las regiones</option>
            {regionOptions.map((r) => <option key={r} value={r} style={{ background: NAVY }}>{r}</option>)}
          </select>
        </div>
        {/* Oficio */}
        <div className="flex items-center gap-1.5">
          <Hammer className="h-3 w-3 flex-shrink-0 text-blue-400" />
          <select value={craftFilter} onChange={(e) => setCraftFilter(e.target.value)} className={selectClass} style={selectStyle}>
            <option value="all" style={{ background: NAVY }}>Todos los oficios</option>
            {craftOptions.map((c) => <option key={c} value={c} style={{ background: NAVY }}>{c}</option>)}
          </select>
        </div>
        {/* Convenio */}
        <div className="flex items-center gap-1.5">
          <Handshake className="h-3 w-3 flex-shrink-0 text-blue-400" />
          <select value={agreementFilter} onChange={(e) => setAgreementFilter(e.target.value)} className={selectClass} style={selectStyle}>
            <option value="all" style={{ background: NAVY }}>Todos los convenios</option>
            {agreementOptions.map((a) => <option key={a} value={a} style={{ background: NAVY }}>{a}</option>)}
          </select>
        </div>
        {/* Orden */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3 w-3 flex-shrink-0 text-blue-400" />
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectClass} style={selectStyle}>
            <option value="az" style={{ background: NAVY }}>A → Z</option>
            <option value="za" style={{ background: NAVY }}>Z → A</option>
            <option value="recent" style={{ background: NAVY }}>Más recientes</option>
            {showHealth && <option value="health" style={{ background: NAVY }}>Mejor salud</option>}
          </select>
        </div>
      </div>

      {/* Contador */}
      <p className="flex-shrink-0 px-4 pb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
        {filteredShops.length} de {stats.total} tienda{stats.total !== 1 ? 's' : ''}
      </p>

      {/* Lista */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-blue-300" /></div>
        ) : filteredShops.length === 0 ? (
          <p className="py-6 text-center text-xs text-blue-400">Sin resultados</p>
        ) : (
          filteredShops.map((shop) => (
            <ShopRow key={shop.id} shop={shop} selected={selectedId === shop.id}
              showHealth={showHealth} onClick={() => onSelect(shop)} />
          ))
        )}
      </div>
    </aside>
  );
}
