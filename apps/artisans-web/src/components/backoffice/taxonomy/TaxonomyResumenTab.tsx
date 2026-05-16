import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getTaxonomySummary, getPendingTaxonomies, type TaxonomyType } from '@/services/taxonomy.actions';
import { getAllCategories } from '@/services/categories.actions';
import { getBadges } from '@/services/badges.actions';
import { getCuratorialCategories } from '@/services/curatorial-categories.actions';

const GREEN = '#15803d';
const ORANGE = '#ec6d13';
const NAVY = '#151b2d';
const CREAM = '#f9f7f2';

type Summary = Record<TaxonomyType, { total: number; approved: number; pending: number; rejected: number }>;

const TYPE_LABELS: Record<TaxonomyType, string> = {
  crafts: 'Oficios',
  techniques: 'Técnicas',
  materials: 'Materiales',
  styles: 'Estilos',
  herramientas: 'Herramientas',
};

const TYPE_COLORS: Record<TaxonomyType, string> = {
  crafts: '#7c3aed',
  techniques: '#0369a1',
  materials: '#15803d',
  styles: '#b45309',
  herramientas: '#be185d',
};

interface ExtraCount { label: string; total: number; color: string }

export function TaxonomyResumenTab() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [extras, setExtras] = useState<ExtraCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getTaxonomySummary(),
      getPendingTaxonomies(),
      getAllCategories(),
      getBadges(),
      getCuratorialCategories(),
    ]).then(([summaryR, pendingR, catsR, badgesR, curatR]) => {
      if (summaryR.status === 'fulfilled') setSummary(summaryR.value);
      if (pendingR.status === 'fulfilled') {
        const total = Object.values(pendingR.value).reduce((acc, arr) => acc + arr.length, 0);
        setPendingTotal(total);
      }
      const extrasList: ExtraCount[] = [];
      if (catsR.status === 'fulfilled') extrasList.push({ label: 'Categorías', total: catsR.value.length, color: '#0f766e' });
      if (badgesR.status === 'fulfilled') extrasList.push({ label: 'Badges', total: badgesR.value.length, color: '#7c3aed' });
      if (curatR.status === 'fulfilled') extrasList.push({ label: 'Cat. Curatoriales', total: curatR.value.length, color: '#b45309' });
      setExtras(extrasList);
    }).finally(() => setLoading(false));
  }, []);

  const totalTerms = summary
    ? Object.values(summary).reduce((acc, v) => acc + v.total, 0)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Pending alert */}
      {pendingTotal > 0 && (
        <a
          href="/backoffice/taxonomia/moderacion"
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: 'rgba(236,109,19,0.1)',
            border: '1px solid rgba(236,109,19,0.35)',
            borderRadius: 14,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}>
            <AlertTriangle size={20} color={ORANGE} />
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, color: '#9a3412', fontSize: 15 }}>
                {pendingTotal} término{pendingTotal !== 1 ? 's' : ''} esperando moderación
              </span>
              <p style={{ margin: 0, fontSize: 13, color: '#c2410c' }}>
                Haz clic para ir al flujo de moderación →
              </p>
            </div>
          </div>
        </a>
      )}

      {/* Global KPI */}
      <div style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        border: '1px solid rgba(21,128,61,0.15)',
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontFamily: "'League Spartan', sans-serif", textTransform: 'uppercase', letterSpacing: 1 }}>Total de términos</p>
          <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: NAVY, fontFamily: "'League Spartan', sans-serif", lineHeight: 1.1 }}>
            {loading ? '…' : totalTerms.toLocaleString()}
          </p>
        </div>
        {extras.map((e) => (
          <div key={e.label}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontFamily: "'League Spartan', sans-serif", textTransform: 'uppercase', letterSpacing: 1 }}>{e.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: e.color, fontFamily: "'League Spartan', sans-serif", lineHeight: 1.1 }}>
              {loading ? '…' : e.total}
            </p>
          </div>
        ))}
      </div>

      {/* Per-type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {(Object.entries(TYPE_LABELS) as [TaxonomyType, string][]).map(([type, label]) => {
          const data = summary?.[type];
          const color = TYPE_COLORS[type];
          return (
            <div
              key={type}
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                borderRadius: 16,
                border: `1px solid ${color}22`,
                padding: '18px 20px',
                borderLeft: `4px solid ${color}`,
              }}
            >
              <p style={{ margin: '0 0 12px', fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 15, color: NAVY }}>
                {label}
              </p>
              {loading || !data ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Cargando…</p>
              ) : (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <KpiItem icon={<span style={{ fontWeight: 800, color, fontSize: 18 }}>{data.total}</span>} label="Total" />
                  <KpiItem icon={<CheckCircle2 size={16} color="#15803d" />} label={`${data.approved} aprob.`} />
                  <KpiItem icon={<Clock size={16} color={ORANGE} />} label={`${data.pending} pend.`} />
                  <KpiItem icon={<XCircle size={16} color="#dc2626" />} label={`${data.rejected} recl.`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KpiItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
