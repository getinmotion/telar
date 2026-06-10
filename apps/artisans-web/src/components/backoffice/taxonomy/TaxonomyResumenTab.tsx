import React, { useEffect, useState } from 'react';
import { getTaxonomySummary, getPendingTaxonomies, getAllTaxonomyItems, type TaxonomyType } from '@/services/taxonomy.actions';
import { getAllCategories } from '@/services/categories.actions';
import { getBadges } from '@/services/badges.actions';
import { getCuratorialCategories } from '@/services/curatorial-categories.actions';
import { GRAY_100, GRAY_200, GRAY_400, GRAY_700, GRAY_900 } from '@/components/dashboard/dashboardStyles';

type Summary = Record<TaxonomyType, { total: number; approved: number; pending: number; rejected: number }>;

interface TypeConfig {
  type: TaxonomyType;
  label: string;
  color: string;
  navTarget: string;
  usageLabel: string;
}

const TYPES: TypeConfig[] = [
  { type: 'crafts',       label: 'Oficios',      color: 'hsl(var(--domain-business))', navTarget: 'oficios',      usageLabel: 'en uso' },
  { type: 'techniques',   label: 'Técnicas',     color: 'hsl(var(--status-info))', navTarget: 'tecnicas',     usageLabel: 'en uso' },
  { type: 'materials',    label: 'Materiales',   color: 'hsl(var(--domain-moderation))', navTarget: 'materiales',   usageLabel: 'en uso' },
  { type: 'styles',       label: 'Estilos',      color: 'hsl(var(--status-warning-dark))', navTarget: 'estilos',      usageLabel: 'artesanos' },
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
    { label: 'Total términos', value: totalTerms,   sub: 'en 5 tipos',              color: GRAY_900 },
    { label: 'Aprobados',      value: totalApproved, sub: totalTerms > 0 ? `${Math.round(totalApproved / totalTerms * 100)}% del total` : '—', color: 'hsl(var(--domain-moderation))' },
    { label: 'Pendientes',     value: totalPending,  sub: 'requieren acción',         color: 'hsl(var(--status-warning))' },
    { label: 'En uso',         value: totalInUse,   sub: 'vinculados a productos',   color: 'hsl(var(--domain-business))' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} style={{
            background: 'white', border: `1px solid ${GRAY_200}`,
            borderRadius: 14, padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800, color: GRAY_400,
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
            <div style={{ fontSize: 11, color: GRAY_400, marginTop: 4, fontStyle: 'italic' }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Type cards */}
      <div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: GRAY_700,
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
                  background: 'white', border: `1px solid ${GRAY_200}`,
                  borderRadius: 14, padding: '16px 18px',
                  cursor: onNavigate ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#c4b5fd';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px hsl(var(--domain-business) / 0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = GRAY_200;
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
                    <span style={{ fontSize: 10, color: GRAY_400 }}>ir →</span>
                  )}
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, color: GRAY_900,
                  fontFamily: "'League Spartan', system-ui, sans-serif",
                }}>
                  {loading ? '…' : (data?.total ?? '—')}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'hsl(var(--domain-moderation))', fontWeight: 600 }}>✓ {data?.approved ?? 0}</span>
                  <span style={{ fontSize: 11, color: 'hsl(var(--status-warning))', fontWeight: 600 }}>⏳ {data?.pending ?? 0}</span>
                  <span style={{ fontSize: 11, color: 'hsl(var(--status-error))', fontWeight: 600 }}>✗ {data?.rejected ?? 0}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: cfg.color, fontWeight: 700 }}>
                    {inUse} {cfg.usageLabel}
                  </span>
                </div>
                <div style={{ height: 5, background: GRAY_100, borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
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
