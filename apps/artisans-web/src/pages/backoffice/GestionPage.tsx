import React, { useState } from 'react';
import { BarChart3, Share2, HeartPulse, Package, Store, AlertTriangle, Inbox } from 'lucide-react';
import { TaxonomyGrafoTab } from '@/components/backoffice/taxonomy/TaxonomyGrafoTab';
import { GestionClientesRiesgoTab } from '@/components/backoffice/gestion/GestionClientesRiesgoTab';
import { GestionBacklogTab } from '@/components/backoffice/gestion/GestionBacklogTab';
import { GestionTaxonomiaTab } from '@/components/backoffice/gestion/GestionTaxonomiaTab';
import { GestionProductosTab } from '@/components/backoffice/gestion/GestionProductosTab';
import { GestionTiendasTab } from '@/components/backoffice/gestion/GestionTiendasTab';
import { cn } from '@/lib/utils';

/**
 * Gestión — capa de ANÁLISIS (nunca modera).
 *
 * Analítica dividida por los 3 dominios del back office:
 *  · Productos  — KPIs del catálogo (endpoint /products-new/analytics).
 *  · Tiendas    — KPIs de tiendas (fetch de /artisan-shops vía useAdminShops).
 *  · Taxonomías — salud, mapa de relaciones, impacto y cultura (reubicados
 *                 desde Taxonomy Studio, que ahora solo modera + administra términos).
 */

const NAVY = '#142239';
const ORANGE = '#ec6d13';

type TabKey =
  | 'clientes-riesgo'
  | 'backlog'
  | 'prod-salud'
  | 'tiendas-overview'
  | 'tax-health' | 'tax-grafo';

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; group: string }[] = [
  { key: 'clientes-riesgo', label: 'Clientes en riesgo', icon: AlertTriangle, group: 'Hoy' },
  { key: 'backlog', label: 'Backlog de moderación', icon: Inbox, group: 'Hoy' },
  { key: 'prod-salud', label: 'Salud y detección', icon: Package, group: 'Productos' },
  { key: 'tiendas-overview', label: 'Resumen', icon: Store, group: 'Tiendas' },
  { key: 'tax-health', label: 'Salud y detección', icon: HeartPulse, group: 'Taxonomías' },
  { key: 'tax-grafo', label: 'Mapa de relaciones', icon: Share2, group: 'Taxonomías' },
];

// Orden de grupos preservando la primera aparición en TABS.
const GROUP_ORDER = [...new Set(TABS.map((t) => t.group))];

export default function GestionPage() {
  const [tab, setTab] = useState<TabKey>('clientes-riesgo');

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f0ec]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header */}
      <header className="flex flex-shrink-0 items-center gap-2.5 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: NAVY }}>
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Gestión</p>
          <p className="text-[11px] text-slate-400">Analítica y salud — no modera</p>
        </div>
      </header>

      {/* Tab bar — agrupada por dominio */}
      <div className="flex flex-shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
        {GROUP_ORDER.map((group, gi) => (
          <React.Fragment key={group}>
            {gi > 0 && <span className="mx-1 h-5 w-px flex-shrink-0 bg-slate-200" />}
            <span className="px-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{group}</span>
            {TABS.filter((t) => t.group === group).map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button key={key} type="button" onClick={() => setTab(key)}
                  className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors',
                    active ? 'text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700')}
                  style={active ? { background: NAVY } : undefined}>
                  <Icon className="h-3.5 w-3.5" style={active ? { color: ORANGE } : undefined} />
                  {label}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'clientes-riesgo' && <GestionClientesRiesgoTab />}
        {tab === 'backlog' && <GestionBacklogTab />}
        {tab === 'prod-salud' && <GestionProductosTab />}
        {tab === 'tiendas-overview' && <GestionTiendasTab />}
        {tab === 'tax-health' && <GestionTaxonomiaTab />}
        {tab === 'tax-grafo' && <TaxonomyGrafoTab />}
      </div>
    </div>
  );
}
