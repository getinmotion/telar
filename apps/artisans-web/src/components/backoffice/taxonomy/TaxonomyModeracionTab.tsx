import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  getAllTaxonomyItems,
  updateTaxonomyStatus,
  type TaxonomyItemWithCount,
  type TaxonomyType,
} from '@/services/taxonomy.actions';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { SANS, SERIF, glassPrimary, glassPurple, glassGreen, lc } from '@/components/dashboard/dashboardStyles';

const TYPE_CONFIG = [
  { type: 'crafts'       as TaxonomyType, label: 'Oficio',      plural: 'Oficios',      color: '#7c3aed' },
  { type: 'techniques'   as TaxonomyType, label: 'Técnica',     plural: 'Técnicas',     color: '#0369a1' },
  { type: 'materials'    as TaxonomyType, label: 'Material',    plural: 'Materiales',   color: '#15803d' },
  { type: 'styles'       as TaxonomyType, label: 'Estilo',      plural: 'Estilos',      color: '#b45309' },
=======
import { SANS, SERIF, glassPrimary, glassPurple, glassGreen, lc, GRAY_700, PURPLE_DARK } from '@/components/dashboard/dashboardStyles';

const TYPE_CONFIG = [
  { type: 'crafts'       as TaxonomyType, label: 'Oficio',      plural: 'Oficios',      color: 'hsl(var(--domain-business))' },
  { type: 'techniques'   as TaxonomyType, label: 'Técnica',     plural: 'Técnicas',     color: 'hsl(var(--status-info))' },
  { type: 'materials'    as TaxonomyType, label: 'Material',    plural: 'Materiales',   color: 'hsl(var(--domain-moderation))' },
  { type: 'styles'       as TaxonomyType, label: 'Estilo',      plural: 'Estilos',      color: 'hsl(var(--status-warning-dark))' },
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
  { type: 'herramientas' as TaxonomyType, label: 'Herramienta', plural: 'Herramientas', color: '#be185d' },
] as const;

type PendingItem = TaxonomyItemWithCount & { _type: TaxonomyType; _label: string; _color: string };
type TypeFilter  = TaxonomyType | 'all';
type SortMode    = 'age' | 'impact';
type MergeState  = {
  itemId: string;
  type: TaxonomyType;
  query: string;
  results: TaxonomyItemWithCount[];
  selectedId: string | null;
  searching: boolean;
};

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export function TaxonomyModeracionTab() {
  const { toast } = useToast();
  const [items,      setItems]      = useState<PendingItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortMode,   setSortMode]   = useState<SortMode>('age');
  const [actingOn,   setActingOn]   = useState<Set<string>>(new Set());
  const [mergeState, setMergeState] = useState<MergeState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled(
      TYPE_CONFIG.map((cfg) => getAllTaxonomyItems(cfg.type, { status: 'pending', withProductCount: true })),
    );
    const all: PendingItem[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        r.value.forEach((item) => all.push({
          ...item,
          _type: TYPE_CONFIG[i].type,
          _label: TYPE_CONFIG[i].label,
          _color: TYPE_CONFIG[i].color,
        }));
      }
    });
    setItems(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startActing = (id: string) => setActingOn((p) => new Set(p).add(id));
  const stopActing  = (id: string) => setActingOn((p) => { const s = new Set(p); s.delete(id); return s; });

  async function handleAction(item: PendingItem, action: 'oficial' | 'emergente' | 'regional' | 'rejected') {
    startActing(item.id);
    try {
      await updateTaxonomyStatus(item._type, item.id, action === 'rejected' ? 'rejected' : 'approved');
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      const labels = {
        oficial:   `"${item.name}" aprobado como término oficial`,
        emergente: `"${item.name}" aprobado como término emergente`,
        regional:  `"${item.name}" aprobado como término regional`,
        rejected:  `"${item.name}" rechazado`,
      };
      toast({ title: action === 'rejected' ? 'Rechazado' : 'Aprobado', description: labels[action] });
    } catch {
      toast({ title: 'Error', description: 'No se pudo procesar el término.', variant: 'destructive' });
    } finally {
      stopActing(item.id);
    }
  }

  async function doMerge(item: PendingItem) {
    if (!mergeState?.selectedId) return;
    startActing(item.id);
    try {
      await updateTaxonomyStatus(item._type, item.id, 'approved', mergeState.selectedId);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setMergeState(null);
      toast({ title: 'Fusionado', description: `"${item.name}" registrado como alias.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo fusionar el término.', variant: 'destructive' });
    } finally {
      stopActing(item.id);
    }
  }

  async function searchCanonical(type: TaxonomyType, query: string) {
    if (!query.trim()) {
      setMergeState((s) => s ? { ...s, results: [], searching: false } : null);
      return;
    }
    setMergeState((s) => s ? { ...s, searching: true } : null);
    try {
      const res = await getAllTaxonomyItems(type, { search: query, status: 'approved' });
      setMergeState((s) => s ? { ...s, results: res.slice(0, 6), searching: false } : null);
    } catch {
      setMergeState((s) => s ? { ...s, searching: false } : null);
    }
  }

  const chartData = TYPE_CONFIG
    .map((cfg) => ({
      label: cfg.plural,
      count: items.filter((i) => i._type === cfg.type).length,
      color: cfg.color,
    }))
    .filter((d) => d.count > 0);

  const filtered = items
    .filter((i) => typeFilter === 'all' || i._type === typeFilter)
    .sort((a, b) =>
      sortMode === 'impact'
        ? ((b.productCount ?? 0) + (b.artisanCount ?? 0)) - ((a.productCount ?? 0) + (a.artisanCount ?? 0))
        : daysSince(b.createdAt) - daysSince(a.createdAt),
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{
        ...(items.length > 0 ? glassPurple : glassGreen),
        borderRadius: 20, padding: '20px 24px',
        display: 'flex', gap: 20, alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1 }}>
          {items.length > 0 ? (
            <>
              <div style={{
                fontFamily: SERIF, fontSize: 52, fontWeight: 700,
<<<<<<< HEAD
                color: '#7c3aed', lineHeight: 1,
                textShadow: '0 0 20px rgba(124,58,237,0.2)',
              }}>
                {loading ? '…' : items.length}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#3b0764', marginTop: 6 }}>
=======
                color: 'hsl(var(--domain-business))', lineHeight: 1,
                textShadow: '0 0 20px hsl(var(--domain-business) / 0.2)',
              }}>
                {loading ? '…' : items.length}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: PURPLE_DARK, marginTop: 6 }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                término{items.length !== 1 ? 's' : ''} esperan revisión curatorial
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(59,7,100,0.5)', marginTop: 3 }}>
                Cola de moderación inteligente
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
<<<<<<< HEAD
              <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: '#15803d' }}>
                {loading ? 'Cargando…' : 'Ontología al día'}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(21,128,61,0.65)', marginTop: 3 }}>
=======
              <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: 'hsl(var(--domain-moderation))' }}>
                {loading ? 'Cargando…' : 'Ontología al día'}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'hsl(var(--domain-moderation) / 0.65)', marginTop: 3 }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                No hay términos pendientes de revisión curatorial.
              </div>
            </>
          )}
        </div>

        {chartData.length > 0 && (
          <div style={{ width: 200, height: 72, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="28%">
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 8, fontFamily: SANS }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11, fontFamily: SANS,
<<<<<<< HEAD
                    border: '1px solid rgba(255,255,255,0.65)',
=======
                    border: '1px solid var(--glass-border)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(8px)',
                  }}
                  formatter={(v: number) => [`${v} pendiente${v !== 1 ? 's' : ''}`, '']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Filters + sort */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(['all', ...TYPE_CONFIG.map((c) => c.type)] as TypeFilter[]).map((t) => {
              const cfg   = t === 'all' ? null : TYPE_CONFIG.find((c) => c.type === t)!;
              const count = t === 'all' ? items.length : items.filter((i) => i._type === t).length;
              if (count === 0 && t !== 'all') return null;
              const active = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
<<<<<<< HEAD
                    border: `1px solid ${active ? (cfg?.color ?? '#7c3aed') + '55' : 'rgba(21,27,45,0.1)'}`,
=======
                    border: `1px solid ${active ? (cfg?.color ?? 'hsl(var(--domain-business))') + '55' : 'hsl(var(--on-surface) / 0.1)'}`,
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
                    transition: 'all 0.15s',
                    background: active
<<<<<<< HEAD
                      ? (cfg?.color ?? '#7c3aed') + '14'
                      : 'rgba(255,255,255,0.7)',
                    color: active ? (cfg?.color ?? '#7c3aed') : 'rgba(84,67,62,0.55)',
=======
                      ? (cfg?.color ?? 'hsl(var(--domain-business))') + '14'
                      : 'rgba(255,255,255,0.7)',
                    color: active ? (cfg?.color ?? 'hsl(var(--domain-business))') : 'hsl(var(--on-surface-variant) / 0.55)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                  }}
                >
                  {t === 'all' ? 'Todos' : cfg!.plural} ({count})
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
            {([['age', '⏱ Más antiguos'], ['impact', '📦 Mayor impacto']] as [SortMode, string][]).map(([mode, lbl]) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                style={{
<<<<<<< HEAD
                  border: `1px solid ${sortMode === mode ? 'rgba(124,58,237,0.2)' : 'rgba(21,27,45,0.08)'}`,
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
                  background: sortMode === mode ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.7)',
                  color: sortMode === mode ? '#7c3aed' : 'rgba(84,67,62,0.45)',
=======
                  border: `1px solid ${sortMode === mode ? 'hsl(var(--domain-business) / 0.2)' : 'hsl(var(--on-surface) / 0.08)'}`,
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
                  background: sortMode === mode ? 'hsl(var(--domain-business) / 0.07)' : 'rgba(255,255,255,0.7)',
                  color: sortMode === mode ? 'hsl(var(--domain-business))' : 'hsl(var(--on-surface-variant) / 0.45)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Item list */}
      {loading ? (
<<<<<<< HEAD
        <div style={{ textAlign: 'center', fontFamily: SANS, color: 'rgba(84,67,62,0.4)', padding: '40px 0', fontSize: 13 }}>
=======
        <div style={{ textAlign: 'center', fontFamily: SANS, color: 'hsl(var(--on-surface-variant) / 0.4)', padding: '40px 0', fontSize: 13 }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
          Cargando…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          ...glassPrimary,
          borderRadius: 20, padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
<<<<<<< HEAD
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#151b2d' }}>
            {items.length === 0 ? 'Ontología al día' : 'Sin términos en este filtro'}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.45)', marginTop: 4 }}>
=======
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: 'hsl(var(--on-surface))' }}>
            {items.length === 0 ? 'Ontología al día' : 'Sin términos en este filtro'}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: 'hsl(var(--on-surface-variant) / 0.45)', marginTop: 4 }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
            {items.length === 0
              ? 'No hay términos pendientes de revisión curatorial.'
              : 'Prueba con otro filtro de tipo.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((item) => {
            const isMerging = mergeState?.itemId === item.id;
            const isActing  = actingOn.has(item.id);
            const impact    = (item.productCount ?? 0) + (item.artisanCount ?? 0);
            const daysOld   = daysSince(item.createdAt);

            return (
              <div
                key={item.id}
                style={{
                  ...glassPrimary,
                  borderRadius: 20,
                  borderLeft: `4px solid ${item._color}`,
                  padding: '16px 18px',
                  opacity: isActing ? 0.55 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Term info + actions */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
<<<<<<< HEAD
                      <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: '#151b2d' }}>
=======
                      <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: 'hsl(var(--on-surface))' }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                        {item.name}
                      </span>
                      <span style={{
                        fontFamily: SANS,
                        fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                        background: item._color + '18', color: item._color,
                        letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
                      }}>
                        {item._label}
                      </span>
                    </div>
<<<<<<< HEAD
                    <div style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)', flexWrap: 'wrap' }}>
=======
                    <div style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: 11, color: 'hsl(var(--on-surface-variant) / 0.5)', flexWrap: 'wrap' }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                      {item.suggestedBy && (
                        <span>👤 Sugerido por artesano</span>
                      )}
                      {impact > 0 ? (
                        <span style={{
<<<<<<< HEAD
                          background: 'rgba(21,128,61,0.1)', color: '#15803d',
=======
                          background: 'hsl(var(--domain-moderation) / 0.1)', color: 'hsl(var(--domain-moderation))',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                          borderRadius: 999, padding: '2px 10px', fontWeight: 700,
                        }}>
                          📦 {impact} producto{impact !== 1 ? 's' : ''} ya usan este término
                        </span>
                      ) : (
                        <span>Sin uso todavía</span>
                      )}
                      <span>
                        {daysOld === 0 ? 'Creado hoy' : `Hace ${daysOld} día${daysOld !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <TintedBtn
                      label="✓ Oficial"
<<<<<<< HEAD
                      bg="rgba(21,128,61,0.1)" color="#15803d"
=======
                      bg="hsl(var(--domain-moderation) / 0.1)" color="hsl(var(--domain-moderation))"
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                      disabled={isActing}
                      onClick={() => handleAction(item, 'oficial')}
                    />
                    <TintedBtn
                      label="↑ Emergente"
<<<<<<< HEAD
                      bg="rgba(180,83,9,0.1)" color="#b45309"
=======
                      bg="hsl(var(--status-warning-dark) / 0.1)" color="hsl(var(--status-warning-dark))"
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                      disabled={isActing}
                      onClick={() => handleAction(item, 'emergente')}
                    />
                    <TintedBtn
                      label="◉ Regional"
<<<<<<< HEAD
                      bg="rgba(3,105,161,0.1)" color="#0369a1"
=======
                      bg="hsl(var(--status-info) / 0.1)" color="hsl(var(--status-info))"
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                      disabled={isActing}
                      onClick={() => handleAction(item, 'regional')}
                    />
                    <TintedBtn
                      label="⇄ Fusionar"
                      bg={isMerging ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)'}
                      color="#6366f1"
                      disabled={isActing}
                      onClick={() => setMergeState(
                        isMerging
                          ? null
                          : { itemId: item.id, type: item._type, query: '', results: [], selectedId: null, searching: false },
                      )}
                    />
                    <TintedBtn
                      label="✗ Rechazar"
<<<<<<< HEAD
                      bg="rgba(239,68,68,0.07)" color="#ef4444"
=======
                      bg="hsl(var(--destructive) / 0.07)" color="hsl(var(--destructive))"
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                      disabled={isActing}
                      onClick={() => handleAction(item, 'rejected')}
                    />
                  </div>
                </div>

                {/* Merge panel */}
                {isMerging && mergeState && (
                  <div style={{
                    marginTop: 12, padding: '14px 16px',
<<<<<<< HEAD
                    background: 'rgba(20,34,57,0.04)',
                    borderRadius: 14,
                    border: '1px solid rgba(20,34,57,0.06)',
                  }}>
                    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
=======
                    background: 'hsl(var(--navy) / 0.04)',
                    borderRadius: 14,
                    border: '1px solid hsl(var(--navy) / 0.06)',
                  }}>
                    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: GRAY_700, marginBottom: 8 }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                      Fusionar "{item.name}" como alias de:
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Search size={13} style={{
                        position: 'absolute', left: 10, top: '50%',
<<<<<<< HEAD
                        transform: 'translateY(-50%)', color: 'rgba(84,67,62,0.4)',
=======
                        transform: 'translateY(-50%)', color: 'hsl(var(--on-surface-variant) / 0.4)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                      }} />
                      <input
                        autoFocus
                        value={mergeState.query}
                        onChange={(e) => {
                          const q = e.target.value;
                          setMergeState((s) => s ? { ...s, query: q, selectedId: null } : null);
                          searchCanonical(item._type, q);
                        }}
                        placeholder={`Buscar ${item._label.toLowerCase()} canónico…`}
                        style={{
                          width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                          background: 'rgba(255,255,255,0.9)',
<<<<<<< HEAD
                          border: '1px solid rgba(21,27,45,0.1)',
=======
                          border: '1px solid hsl(var(--on-surface) / 0.1)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                          borderRadius: 10,
                          fontSize: 12, outline: 'none', boxSizing: 'border-box', fontFamily: SANS,
                        }}
                      />
                    </div>

                    {mergeState.searching && (
<<<<<<< HEAD
                      <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.4)', padding: '6px 2px', fontStyle: 'italic' }}>
=======
                      <div style={{ fontFamily: SANS, fontSize: 11, color: 'hsl(var(--on-surface-variant) / 0.4)', padding: '6px 2px', fontStyle: 'italic' }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                        Buscando…
                      </div>
                    )}

                    {mergeState.results.length > 0 && !mergeState.searching && (
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {mergeState.results.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setMergeState((s) => s ? { ...s, selectedId: r.id, query: r.name, results: [] } : null)}
                            style={{
                              textAlign: 'left', padding: '7px 12px', borderRadius: 8,
                              border: '1px solid',
                              cursor: 'pointer', fontSize: 12, fontFamily: SANS,
<<<<<<< HEAD
                              background: mergeState.selectedId === r.id ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.8)',
                              color: mergeState.selectedId === r.id ? '#7c3aed' : '#374151',
                              borderColor: mergeState.selectedId === r.id ? 'rgba(124,58,237,0.25)' : 'rgba(21,27,45,0.08)',
=======
                              background: mergeState.selectedId === r.id ? 'hsl(var(--domain-business) / 0.08)' : 'rgba(255,255,255,0.8)',
                              color: mergeState.selectedId === r.id ? 'hsl(var(--domain-business))' : GRAY_700,
                              borderColor: mergeState.selectedId === r.id ? 'hsl(var(--domain-business) / 0.25)' : 'hsl(var(--on-surface) / 0.08)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                            }}
                          >
                            {r.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {mergeState.selectedId && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => doMerge(item)}
                          style={{
                            background: '#6366f1', color: 'white', border: 'none',
                            borderRadius: 10, padding: '8px 18px',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
                          }}
                        >
                          Confirmar fusión
                        </button>
                        <button
                          onClick={() => setMergeState(null)}
                          style={{
<<<<<<< HEAD
                            background: 'rgba(21,27,45,0.05)', color: 'rgba(84,67,62,0.65)',
=======
                            background: 'hsl(var(--on-surface) / 0.05)', color: 'hsl(var(--on-surface-variant) / 0.65)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                            border: 'none',
                            borderRadius: 10, padding: '8px 14px',
                            fontSize: 12, cursor: 'pointer', fontFamily: SANS,
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TintedBtn({
  label, bg, color, disabled, onClick,
}: {
  label: string; bg: string; color: string; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: bg, color,
        border: 'none',
        borderRadius: 10, padding: '6px 12px',
        fontSize: 11, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: SANS,
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {label}
    </button>
  );
}
