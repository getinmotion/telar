import React, { useEffect, useMemo, useState } from 'react';
import { HealthScoreRing } from '@/components/moderation/ReviewerWorkspace/HealthScoreRing';
import {
  getAllTaxonomyItems,
  getPendingTaxonomies,
  getTaxonomySummary,
  type TaxonomyItemWithCount,
  type TaxonomyType,
} from '@/services/taxonomy.actions';
import { SANS, SERIF, glassPrimary, lc } from '@/components/dashboard/dashboardStyles';

const TYPE_CONFIG: {
  type: TaxonomyType;
  label: string;
  color: string;
  navTarget: string;
  phrase: (n: number) => string;
}[] = [
  {
    type: 'crafts',
    label: 'Oficios',
    color: '#7c3aed',
    navTarget: 'oficios',
    phrase: (n) => `${n} oficio${n !== 1 ? 's' : ''} estructuran el conocimiento artesanal de TELAR`,
  },
  {
    type: 'techniques',
    label: 'Técnicas',
    color: '#0369a1',
    navTarget: 'tecnicas',
    phrase: (n) => `${n} técnica${n !== 1 ? 's' : ''} documentan el saber hacer artesanal`,
  },
  {
    type: 'materials',
    label: 'Materiales',
    color: '#15803d',
    navTarget: 'materiales',
    phrase: (n) => `${n} material${n !== 1 ? 'es' : ''} del mundo artesanal catalogados`,
  },
  {
    type: 'styles',
    label: 'Estilos',
    color: '#b45309',
    navTarget: 'estilos',
    phrase: (n) => `${n} estilo${n !== 1 ? 's' : ''} definen la identidad visual artesanal`,
  },
  {
    type: 'herramientas',
    label: 'Herramientas',
    color: '#be185d',
    navTarget: 'herramientas',
    phrase: (n) => `${n} herramienta${n !== 1 ? 's' : ''} del oficio artesanal registradas`,
  },
];

type Summary = Record<TaxonomyType, { total: number; approved: number; pending: number; rejected: number }>;

interface Props {
  onNavigate?: (tab: string) => void;
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export function TaxonomyHealthDashboard({ onNavigate }: Props) {
  const [summary,      setSummary]      = useState<Summary | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [allItems,     setAllItems]     = useState<Partial<Record<TaxonomyType, TaxonomyItemWithCount[]>>>({});
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([getTaxonomySummary(), getPendingTaxonomies()]).then(([summaryR, pendingR]) => {
      if (summaryR.status === 'fulfilled') setSummary(summaryR.value);
      if (pendingR.status === 'fulfilled') {
        setPendingTotal(Object.values(pendingR.value).reduce((acc, arr) => acc + arr.length, 0));
      }
      setLoading(false);
    });

    Promise.allSettled(
      TYPE_CONFIG.map((t) => getAllTaxonomyItems(t.type, { withProductCount: true })),
    ).then((results) => {
      const map: Partial<Record<TaxonomyType, TaxonomyItemWithCount[]>> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[TYPE_CONFIG[i].type] = r.value;
      });
      setAllItems(map);
    });
  }, []);

  const coverage = useMemo(() => {
    const map: Partial<Record<TaxonomyType, number>> = {};
    for (const cfg of TYPE_CONFIG) {
      const items = allItems[cfg.type] ?? [];
      map[cfg.type] = items.filter((x) => ((x.productCount ?? 0) + (x.artisanCount ?? 0)) > 0).length;
    }
    return map;
  }, [allItems]);

  const recentActivity = useMemo(() => {
    const all: { name: string; type: TaxonomyType; color: string; label: string; createdAt?: string }[] = [];
    for (const cfg of TYPE_CONFIG) {
      for (const item of allItems[cfg.type] ?? []) {
        all.push({ name: item.name, type: cfg.type, color: cfg.color, label: cfg.label, createdAt: item.createdAt });
      }
    }
    return all
      .filter((x) => x.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 6);
  }, [allItems]);

  const totalTerms    = summary ? Object.values(summary).reduce((acc, v) => acc + v.total, 0) : 0;
  const totalApproved = summary ? Object.values(summary).reduce((acc, v) => acc + v.approved, 0) : 0;
  const totalPending  = summary ? Object.values(summary).reduce((acc, v) => acc + v.pending, 0) : 0;
  const totalInUse    = Object.values(coverage).reduce((acc, v) => acc + (v ?? 0), 0);
  const approvalPct   = totalTerms > 0 ? Math.round((totalApproved / totalTerms) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Hero oscuro */}
      <div style={{
        background: 'linear-gradient(135deg, #3b0764 0%, #4c1d95 60%, #1e3a5f 100%)',
        borderRadius: 24, padding: '36px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orb */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(167,139,250,0.3)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
            <span style={{ fontFamily: SERIF, fontSize: 72, fontWeight: 700, color: 'white', lineHeight: 1 }}>
              {loading ? '…' : totalTerms}
            </span>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                términos
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                estructuran la ontología artesanal activa de TELAR
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              {
                label: `${approvalPct}% curados`,
                sub: `${totalApproved} términos aprobados`,
                alert: false,
              },
              {
                label: `${totalPending} pendientes`,
                sub: totalPending > 0 ? 'requieren revisión' : 'ontología al día',
                alert: totalPending > 0,
              },
              {
                label: `${totalInUse} en uso`,
                sub: 'términos activos en productos',
                alert: false,
              },
            ].map((pill) => (
              <div key={pill.label} style={{
                background: pill.alert ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${pill.alert ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.18)'}`,
                borderRadius: 999, padding: '9px 18px',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: 'white' }}>
                  {loading ? '…' : pill.label}
                </div>
                <div style={{
                  fontFamily: SANS, fontSize: 9, fontWeight: 600,
                  color: 'rgba(255,255,255,0.45)', letterSpacing: '0.07em', marginTop: 2,
                }}>
                  {pill.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salud por dimensión */}
      <div style={{
        ...glassPrimary,
        borderRadius: 24, padding: '20px 24px',
      }}>
        <div style={{ ...lc(), marginBottom: 16 }}>Salud por dimensión</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {TYPE_CONFIG.map((cfg) => {
            const data      = summary?.[cfg.type];
            const inUse     = coverage[cfg.type] ?? 0;
            const total     = data?.total    ?? 0;
            const approved  = data?.approved ?? 0;
            const pending   = data?.pending  ?? 0;
            const rejected  = data?.rejected ?? 0;
            const score     = total > 0
              ? Math.min(100, Math.round((approved / total) * 60 + (inUse / Math.max(approved, 1)) * 40))
              : 0;
            const approvedW = total > 0 ? (approved / total) * 100 : 0;
            const pendingW  = total > 0 ? (pending  / total) * 100 : 0;
            const rejectedW = total > 0 ? (rejected / total) * 100 : 0;

            return (
              <div
                key={cfg.type}
                onClick={() => onNavigate?.(cfg.navTarget)}
                style={{
                  ...glassPrimary,
                  borderRadius: 20,
                  borderTop: `3px solid ${cfg.color}`,
                  padding: '14px 12px',
                  cursor: onNavigate ? 'pointer' : 'default',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!onNavigate) return;
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${cfg.color}22`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(21,27,45,0.02)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: SANS, fontSize: 9, fontWeight: 800,
                    color: cfg.color, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {cfg.label}
                  </span>
                  {onNavigate && (
                    <span style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(84,67,62,0.35)' }}>
                      ver →
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HealthScoreRing score={loading ? 0 : score} size="sm" />
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: '#151b2d', lineHeight: 1 }}>
                      {loading ? '…' : total}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(84,67,62,0.45)', marginTop: 2 }}>
                      {inUse} en uso activo
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.5)', lineHeight: 1.45 }}>
                  {cfg.phrase(total)}
                </div>

                <div style={{ height: 5, background: 'rgba(20,34,57,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ width: `${approvedW}%`, background: '#15803d', transition: 'width 0.6s ease' }} />
                    <div style={{ width: `${pendingW}%`,  background: '#f59e0b', transition: 'width 0.6s ease' }} />
                    <div style={{ width: `${rejectedW}%`, background: '#ef4444', transition: 'width 0.6s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: 9, color: '#15803d', fontWeight: 700 }}>✓ {approved}</span>
                  <span style={{ fontFamily: SANS, fontSize: 9, color: '#d97706', fontWeight: 700 }}>⏳ {pending}</span>
                  <span style={{ fontFamily: SANS, fontSize: 9, color: '#dc2626', fontWeight: 700 }}>✗ {rejected}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actividad reciente */}
      {recentActivity.length > 0 && (
        <div style={{ ...glassPrimary, borderRadius: 20, padding: '16px 20px' }}>
          <div style={{ ...lc(), marginBottom: 12 }}>Actividad reciente</div>
          {recentActivity.map((item, idx) => (
            <div
              key={`${item.type}-${item.name}-${idx}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 0',
                borderBottom: idx < recentActivity.length - 1
                  ? '1px solid rgba(84,67,62,0.05)'
                  : 'none',
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', flex: 1 }}>
                {item.name}
              </span>
              <span style={{
                fontFamily: SANS,
                fontSize: 9, fontWeight: 800,
                background: item.color + '18', color: item.color,
                borderRadius: 999, padding: '3px 10px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.4)',
                fontStyle: 'italic', minWidth: 60, textAlign: 'right',
              }}>
                {daysSince(item.createdAt) === 0 ? 'hoy' : `hace ${daysSince(item.createdAt)}d`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
