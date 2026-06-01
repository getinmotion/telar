import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { getAllTaxonomyItems, type TaxonomyItemWithCount, type TaxonomyType } from '@/services/taxonomy.actions';
import { SANS, SERIF, glassPrimary, lc } from '@/components/dashboard/dashboardStyles';

const TYPE_CONFIG = [
  { type: 'crafts'       as TaxonomyType, label: 'Oficios',      color: '#7c3aed' },
  { type: 'techniques'   as TaxonomyType, label: 'Técnicas',     color: '#0369a1' },
  { type: 'materials'    as TaxonomyType, label: 'Materiales',   color: '#15803d' },
  { type: 'styles'       as TaxonomyType, label: 'Estilos',      color: '#b45309' },
  { type: 'herramientas' as TaxonomyType, label: 'Herramientas', color: '#be185d' },
] as const;

const SCAFFOLD_METRICS = [
  {
    title: 'Oficios con mayor GMV',
    desc: 'Los oficios vinculados a mayor volumen de ventas — crucial para priorizar curación.',
    needs: 'Endpoint /admin-stats/taxonomy-gmv',
  },
  {
    title: 'Técnicas más buscadas',
    desc: 'Qué técnicas buscan los compradores para orientar el crecimiento taxonómico.',
    needs: 'Analytics de búsqueda con dimensión taxonómica',
  },
  {
    title: 'Materiales con mayor conversión',
    desc: 'Materiales que generan más ventas relativas a sus visitas.',
    needs: 'Endpoint /admin-stats/material-conversion',
  },
  {
    title: 'CTR por categoría curatoria',
    desc: 'Performance de las categorías curatoriales en el marketplace.',
    needs: 'Analytics de clics + endpoint /admin-stats/curatorial-ctr',
  },
];

interface CoveragePoint {
  name: string;
  'En uso': number;
  'Sin uso': number;
  color: string;
}

export function TaxonomyImpactoTab() {
  const [coverageData, setCoverageData] = useState<CoveragePoint[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled(
      TYPE_CONFIG.map((cfg) => getAllTaxonomyItems(cfg.type, { withProductCount: true })),
    ).then((results) => {
      const data: CoveragePoint[] = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const items: TaxonomyItemWithCount[] = r.value;
          const inUse = items.filter((x) => ((x.productCount ?? 0) + (x.artisanCount ?? 0)) > 0).length;
          data.push({
            name: TYPE_CONFIG[i].label,
            'En uso': inUse,
            'Sin uso': items.length - inUse,
            color: TYPE_CONFIG[i].color,
          });
        }
      });
      setCoverageData(data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#151b2d' }}>
          Impacto en Marketplace
        </h2>
        <p style={{ margin: '4px 0 0', fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.5)', maxWidth: 540 }}>
          Cómo la ontología artesanal se traduce en rendimiento comercial.
          Algunas métricas están disponibles hoy; otras requieren endpoints analíticos pendientes de implementar.
        </p>
      </div>

      {/* LIVE: Coverage chart */}
      <div style={{
        ...glassPrimary,
        borderRadius: 20, padding: '20px 24px',
        borderTop: '3px solid #15803d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#151b2d' }}>
              Cobertura activa de la ontología
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)', marginTop: 2 }}>
              Cuántos términos están efectivamente vinculados a productos o talleres
            </div>
          </div>
          <span style={{
            marginLeft: 'auto',
            fontFamily: SANS,
            fontSize: 9, fontWeight: 800,
            background: 'rgba(21,128,61,0.1)', color: '#166534',
            borderRadius: 999, padding: '4px 12px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            Datos en vivo
          </span>
        </div>

        {loading ? (
          <div style={{
            height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SANS, color: 'rgba(84,67,62,0.35)', fontSize: 13,
          }}>
            Cargando…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={coverageData} barCategoryGap="30%">
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontFamily: SANS, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: SANS }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11, fontFamily: SANS,
                  border: '1px solid rgba(255,255,255,0.65)',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(8px)',
                }}
                formatter={(value: number, name: string) => [`${value} términos`, name]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: SANS }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="En uso" stackId="a" radius={[0, 0, 0, 0]}>
                {coverageData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9} />)}
              </Bar>
              <Bar dataKey="Sin uso" stackId="a" radius={[4, 4, 0, 0]}>
                {coverageData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.15} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Scaffold metrics */}
      <div>
        <div style={{ ...lc(), marginBottom: 12 }}>Métricas comerciales — próximamente</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {SCAFFOLD_METRICS.map((m) => (
            <ScaffoldCard key={m.title} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScaffoldCard({ title, desc, needs }: { title: string; desc: string; needs: string }) {
  return (
    <div style={{
      background: 'rgba(20,34,57,0.03)',
      border: '1px solid rgba(20,34,57,0.05)',
      borderRadius: 20, padding: '16px 18px',
      opacity: 0.88,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>🔒</span>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#374151' }}>{title}</span>
      </div>
      <p style={{ margin: '0 0 12px', fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)', lineHeight: 1.5 }}>{desc}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {[70, 52, 43, 31].map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 60, height: 5, background: 'rgba(20,34,57,0.05)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${w}%`, height: '100%', background: 'rgba(20,34,57,0.1)', borderRadius: 999 }} />
            </div>
            <div style={{ width: 40, height: 5, background: 'rgba(20,34,57,0.05)', borderRadius: 999 }} />
          </div>
        ))}
      </div>
      <span style={{
        fontFamily: SANS, fontSize: 9, color: 'rgba(84,67,62,0.4)', fontWeight: 700,
        padding: '4px 10px', background: 'rgba(20,34,57,0.06)', borderRadius: 9999,
        letterSpacing: '0.06em',
      }}>
        Requiere: {needs}
      </span>
    </div>
  );
}
