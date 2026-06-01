import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAllTaxonomyItems } from '@/services/taxonomy.actions';
import { getTaxonomyAliases } from '@/services/curation.actions';
import { SANS, SERIF, glassPrimary, lc } from '@/components/dashboard/dashboardStyles';

const SCAFFOLD_DIMENSIONS = [
  {
    icon: '🗺',
    title: 'Distribución regional de oficios',
    desc: 'Qué oficios dominan en cada región — Boyacá, La Guajira, Nariño, etc.',
    needs: 'Campo region en el join artesano↔oficio',
  },
  {
    icon: '🧶',
    title: 'Técnicas por tradición cultural',
    desc: 'Agrupar técnicas por origen cultural: Wayuu, Andino, Pacífico, Amazónico…',
    needs: 'Campo culturalOrigin en entidad technique',
  },
  {
    icon: '🌿',
    title: 'Materiales locales vs importados',
    desc: 'Qué proporción de materiales son de origen local vs industriales.',
    needs: 'Campo sourceRegion o importado en entidad material',
  },
  {
    icon: '👥',
    title: 'Artesanos por oficio y región',
    desc: 'Mapa de concentración de artesanos: qué oficio predomina en cada territorio.',
    needs: 'Join artisan+taxonomy con dimensión geográfica',
  },
];

interface MaterialStats {
  organic:     { yes: number; no: number };
  sustainable: { yes: number; no: number };
}

export function TaxonomyCulturaTab() {
  const [materialStats,   setMaterialStats]   = useState<MaterialStats | null>(null);
  const [aliasCount,      setAliasCount]      = useState<number | null>(null);
  const [canonicalCount,  setCanonicalCount]  = useState<number | null>(null);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getAllTaxonomyItems('materials'),
      getTaxonomyAliases(),
    ]).then(([matR, aliasR]) => {
      if (matR.status === 'fulfilled') {
        const items = matR.value;
        setMaterialStats({
          organic:     { yes: items.filter((x) => x.isOrganic).length,     no: items.filter((x) => !x.isOrganic).length     },
          sustainable: { yes: items.filter((x) => x.isSustainable).length, no: items.filter((x) => !x.isSustainable).length },
        });
      }
      if (aliasR.status === 'fulfilled') {
        setAliasCount(aliasR.value.length);
        const uniqueCanonicals = new Set(aliasR.value.map((a) => a.canonicalId).filter(Boolean));
        setCanonicalCount(uniqueCanonicals.size);
      }
    }).finally(() => setLoading(false));
  }, []);

  const organicData = materialStats ? [
    { name: 'Orgánicos',    value: materialStats.organic.yes, color: '#15803d' },
    { name: 'No orgánicos', value: materialStats.organic.no,  color: 'rgba(20,34,57,0.08)' },
  ] : [];

  const sustainableData = materialStats ? [
    { name: 'Sostenibles',    value: materialStats.sustainable.yes, color: '#0369a1' },
    { name: 'No sostenibles', value: materialStats.sustainable.no,  color: 'rgba(20,34,57,0.08)' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#151b2d' }}>
          Cultura y Territorio
        </h2>
        <p style={{ margin: '4px 0 0', fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.5)', maxWidth: 560 }}>
          TELAR está construyendo la ontología artesanal digital más importante de Latinoamérica.
          Esta dimensión cultural se activa progresivamente a medida que la API territorial crece.
        </p>
      </div>

      {/* LIVE: Material dimensions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

        {/* Organic donut */}
        <div style={{ ...glassPrimary, borderRadius: 20, padding: '16px 18px', borderTop: '3px solid #15803d' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#151b2d' }}>Materiales orgánicos</span>
            <span style={{
              fontFamily: SANS, fontSize: 8, fontWeight: 800,
              background: 'rgba(21,128,61,0.1)', color: '#166534',
              borderRadius: 999, padding: '3px 8px',
              letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
            }}>
              En vivo
            </span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)', marginBottom: 12, lineHeight: 1.4 }}>
            Proporción de materiales con certificación orgánica en el catálogo
          </div>
          {loading ? (
            <div style={{ height: 160, background: 'rgba(20,34,57,0.04)', borderRadius: 10 }} />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={organicData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {organicData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 11, fontFamily: SANS,
                    border: '1px solid rgba(255,255,255,0.65)',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.92)',
                  }}
                  formatter={(v: number) => [`${v} materiales`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: SANS }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {materialStats && (
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#15803d', textAlign: 'center', marginTop: 4 }}>
              {materialStats.organic.yes} de {materialStats.organic.yes + materialStats.organic.no} son orgánicos
            </div>
          )}
        </div>

        {/* Sustainable donut */}
        <div style={{ ...glassPrimary, borderRadius: 20, padding: '16px 18px', borderTop: '3px solid #0369a1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#151b2d' }}>Materiales sostenibles</span>
            <span style={{
              fontFamily: SANS, fontSize: 8, fontWeight: 800,
              background: 'rgba(21,128,61,0.1)', color: '#166534',
              borderRadius: 999, padding: '3px 8px',
              letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
            }}>
              En vivo
            </span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)', marginBottom: 12, lineHeight: 1.4 }}>
            Materiales con prácticas sostenibles de extracción y producción
          </div>
          {loading ? (
            <div style={{ height: 160, background: 'rgba(20,34,57,0.04)', borderRadius: 10 }} />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={sustainableData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {sustainableData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 11, fontFamily: SANS,
                    border: '1px solid rgba(255,255,255,0.65)',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.92)',
                  }}
                  formatter={(v: number) => [`${v} materiales`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: SANS }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {materialStats && (
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#0369a1', textAlign: 'center', marginTop: 4 }}>
              {materialStats.sustainable.yes} de {materialStats.sustainable.yes + materialStats.sustainable.no} son sostenibles
            </div>
          )}
        </div>

        {/* Alias diversity */}
        <div style={{ ...glassPrimary, borderRadius: 20, padding: '16px 18px', borderTop: '3px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#151b2d' }}>Diversidad terminológica</span>
            <span style={{
              fontFamily: SANS, fontSize: 8, fontWeight: 800,
              background: 'rgba(21,128,61,0.1)', color: '#166534',
              borderRadius: 999, padding: '3px 8px',
              letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
            }}>
              En vivo
            </span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)', marginBottom: 16, lineHeight: 1.4 }}>
            Los aliases capturan cómo distintas comunidades nombran el mismo concepto artesanal
          </div>
          {loading ? (
            <div style={{ height: 160, background: 'rgba(20,34,57,0.04)', borderRadius: 10 }} />
          ) : aliasCount !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 700, color: '#7c3aed', lineHeight: 1 }}>
                  {aliasCount}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.45)', marginTop: 4 }}>
                  aliases registrados
                </div>
              </div>
              {canonicalCount !== null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: '#151b2d', lineHeight: 1 }}>
                    {canonicalCount}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.45)', marginTop: 4 }}>
                    términos canónicos con equivalencias
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.4)',
              textAlign: 'center', padding: '24px 0', fontStyle: 'italic',
            }}>
              Carga desde /taxonomy-aliases
            </div>
          )}
        </div>
      </div>

      {/* Scaffold dimensions */}
      <div>
        <div style={{ ...lc(), marginBottom: 12 }}>Inteligencia territorial — próximamente</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {SCAFFOLD_DIMENSIONS.map((d) => (
            <div key={d.title} style={{
              background: 'rgba(20,34,57,0.03)',
              border: '1px solid rgba(20,34,57,0.05)',
              borderRadius: 20, padding: '16px 18px',
              opacity: 0.88,
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{d.icon}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                {d.title}
              </div>
              <p style={{ margin: '0 0 12px', fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)', lineHeight: 1.5 }}>
                {d.desc}
              </p>
              <div style={{
                height: 50, background: 'rgba(20,34,57,0.04)', borderRadius: 10,
                border: '1px solid rgba(20,34,57,0.05)', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, opacity: 0.2 }}>{d.icon}</span>
              </div>
              <span style={{
                fontFamily: SANS, fontSize: 9, color: 'rgba(84,67,62,0.4)', fontWeight: 700,
                padding: '4px 10px', background: 'rgba(20,34,57,0.06)', borderRadius: 9999,
                letterSpacing: '0.06em',
              }}>
                Requiere: {d.needs}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
