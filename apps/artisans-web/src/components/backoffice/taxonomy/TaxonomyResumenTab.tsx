import React, { useEffect, useState } from 'react';
import { getTaxonomySummary, getPendingTaxonomies, getAllTaxonomyItems, type TaxonomyType } from '@/services/taxonomy.actions';
import { getAllCategories } from '@/services/categories.actions';
import { getBadges } from '@/services/badges.actions';
import { getCuratorialCategories } from '@/services/curatorial-categories.actions';

type Summary = Record<TaxonomyType, { total: number; approved: number; pending: number; rejected: number }>;

interface TypeConfig {
  type: TaxonomyType;
  label: string;
  color: string;
  navTarget: string;
  usageLabel: string;
}

const TYPES: TypeConfig[] = [
  { type: 'crafts',       label: 'Oficios',      color: '#7c3aed', navTarget: 'oficios',      usageLabel: 'en uso' },
  { type: 'techniques',   label: 'Técnicas',     color: '#0369a1', navTarget: 'tecnicas',     usageLabel: 'en uso' },
  { type: 'materials',    label: 'Materiales',   color: '#15803d', navTarget: 'materiales',   usageLabel: 'en uso' },
  { type: 'styles',       label: 'Estilos',      color: '#b45309', navTarget: 'estilos',      usageLabel: 'artesanos' },
  { type: 'herramientas', label: 'Herramientas', color: '#be185d', navTarget: 'herramientas', usageLabel: 'artesanos' },
];

interface Props {
  onNavigate?: (tab: string) => void;
}

export function TaxonomyResumenTab({ onNavigate }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [coverage, setCoverage] = useState<Partial<Record<TaxonomyType, number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getTaxonomySummary(),
      getPendingTaxonomies(),
      getAllCategories(),
      getBadges(),
      getCuratorialCategories(),
    ]).then(([summaryR, pendingR]) => {
      if (summaryR.status === 'fulfilled') setSummary(summaryR.value);
      if (pendingR.status === 'fulfilled') {
        const total = Object.values(pendingR.value).reduce((acc, arr) => acc + arr.length, 0);
        setPendingTotal(total);
      }
    }).finally(() => setLoading(false));

    Promise.allSettled(
      TYPES.map((t) => getAllTaxonomyItems(t.type, { withProductCount: true }))
    ).then((results) => {
      const map: Partial<Record<TaxonomyType, number>> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          map[TYPES[i].type] = r.value.filter((x) => ((x.productCount ?? 0) + (x.artisanCount ?? 0)) > 0).length;
        }
      });
      setCoverage(map);
    });
  }, []);

  const totalTerms = summary ? Object.values(summary).reduce((acc, v) => acc + v.total, 0) : 0;
  const totalApproved = summary ? Object.values(summary).reduce((acc, v) => acc + v.approved, 0) : 0;
  const totalPending = summary ? Object.values(summary).reduce((acc, v) => acc + v.pending, 0) : 0;
  const totalInUse = Object.values(coverage).reduce((acc, v) => acc + (v ?? 0), 0);

  const KPI_CARDS = [
    { label: 'Total términos', value: totalTerms,   sub: 'en 5 tipos',              color: '#111827' },
    { label: 'Aprobados',      value: totalApproved, sub: totalTerms > 0 ? `${Math.round(totalApproved / totalTerms * 100)}% del total` : '—', color: '#15803d' },
    { label: 'Pendientes',     value: totalPending,  sub: 'requieren acción',         color: '#d97706' },
    { label: 'En uso',         value: totalInUse,   sub: 'vinculados a productos',   color: '#7c3aed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} style={{
            background: 'white', border: '1px solid #e5e7eb',
            borderRadius: 14, padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800, color: '#9ca3af',
              letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
              fontFamily: "'League Spartan', system-ui, sans-serif",
            }}>
              {kpi.label}
            </div>
            <div style={{
              fontSize: 36, fontWeight: 800, color: kpi.color, lineHeight: 1,
              fontFamily: "'League Spartan', system-ui, sans-serif",
            }}>
              {loading ? '…' : kpi.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Type cards */}
      <div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#374151',
          marginBottom: 12,
          fontFamily: "'League Spartan', system-ui, sans-serif",
        }}>
          Por tipo — haz clic para ir directo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {TYPES.map((cfg) => {
            const data = summary?.[cfg.type];
            const inUse = coverage[cfg.type] ?? 0;
            const approvalPct = data && data.total > 0 ? Math.round(data.approved / data.total * 100) : 0;
            return (
              <div
                key={cfg.type}
                onClick={() => onNavigate?.(cfg.navTarget)}
                style={{
                  background: 'white', border: '1px solid #e5e7eb',
                  borderRadius: 14, padding: '16px 18px',
                  cursor: onNavigate ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#c4b5fd';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(124,58,237,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: cfg.color,
                    fontFamily: "'League Spartan', system-ui, sans-serif",
                  }}>
                    {cfg.label}
                  </span>
                  {onNavigate && (
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>ir →</span>
                  )}
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, color: '#111827',
                  fontFamily: "'League Spartan', system-ui, sans-serif",
                }}>
                  {loading ? '…' : (data?.total ?? '—')}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>✓ {data?.approved ?? 0}</span>
                  <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>⏳ {data?.pending ?? 0}</span>
                  <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>✗ {data?.rejected ?? 0}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: cfg.color, fontWeight: 700 }}>
                    {inUse} {cfg.usageLabel}
                  </span>
                </div>
                <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: cfg.color,
                    width: `${approvalPct}%`,
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
