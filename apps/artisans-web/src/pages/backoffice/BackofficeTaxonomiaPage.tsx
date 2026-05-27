import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingTaxonomies, getTaxonomySummary, type TaxonomyType } from '@/services/taxonomy.actions';
import { TaxonomyResumenTab } from '@/components/backoffice/taxonomy/TaxonomyResumenTab';
import { TaxonomyCrudTab } from '@/components/backoffice/taxonomy/TaxonomyCrudTab';
import { TaxonomyTecnicasTab } from '@/components/backoffice/taxonomy/TaxonomyTecnicasTab';
import { TaxonomyCategoriasTab } from '@/components/backoffice/taxonomy/TaxonomyCategoriasTab';
import { TaxonomyBadgesTab } from '@/components/backoffice/taxonomy/TaxonomyBadgesTab';
import { TaxonomyAliasTab } from '@/components/backoffice/taxonomy/TaxonomyAliasTab';

type TabValue =
  | 'resumen'
  | 'oficios'
  | 'tecnicas'
  | 'materiales'
  | 'estilos'
  | 'herramientas'
  | 'categorias'
  | 'curatorial'
  | 'badges'
  | 'aliases';

const PURPLE = '#7c3aed';

interface SidebarItem {
  value: TabValue;
  label: string;
  dot: string;
  type?: TaxonomyType;
}

const SECTIONS: { label?: string; items: SidebarItem[] }[] = [
  {
    items: [{ value: 'resumen', label: 'Resumen', dot: PURPLE }],
  },
  {
    label: 'Términos',
    items: [
      { value: 'oficios',      label: 'Oficios',      dot: PURPLE,    type: 'crafts'       },
      { value: 'tecnicas',     label: 'Técnicas',     dot: '#0369a1', type: 'techniques'   },
      { value: 'materiales',   label: 'Materiales',   dot: '#15803d', type: 'materials'    },
      { value: 'estilos',      label: 'Estilos',      dot: '#b45309', type: 'styles'       },
      { value: 'herramientas', label: 'Herramientas', dot: '#be185d', type: 'herramientas' },
    ],
  },
  {
    label: 'Clasificación',
    items: [
      { value: 'categorias', label: 'Categorías',        dot: '#0f766e' },
      { value: 'curatorial', label: 'Cat. Curatoriales',  dot: '#6366f1' },
      { value: 'badges',     label: 'Badges',             dot: PURPLE    },
      { value: 'aliases',    label: 'Aliases',            dot: '#6b7280' },
    ],
  },
];

export default function BackofficeTaxonomiaPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('resumen');
  const [pendingCount, setPendingCount] = useState(0);
  const [counts, setCounts] = useState<Partial<Record<string, number>>>({});

  useEffect(() => {
    getPendingTaxonomies()
      .then((data) => {
        const total = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
        setPendingCount(total);
      })
      .catch(() => {});

    getTaxonomySummary()
      .then((summary) => {
        const map: Record<string, number> = {};
        for (const [type, data] of Object.entries(summary)) {
          map[type] = data.total;
        }
        setCounts(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f6f1',
      fontFamily: "'League Spartan', system-ui, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'rgba(124,58,237,0.1)',
            border: '1.5px solid rgba(124,58,237,0.25)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🏷
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>Gestión de Taxonomías</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Administra oficios, técnicas, materiales y más</div>
          </div>
        </div>
        {pendingCount > 0 && (
          <Link to="/backoffice/taxonomia/moderacion" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
              color: '#b45309', borderRadius: 20, padding: '5px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              ⚠ {pendingCount} término{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} →
            </div>
          </Link>
        )}
      </div>

      {/* Body: sidebar + main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 220, flexShrink: 0,
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '16px 12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {SECTIONS.map((section, si) => (
            <React.Fragment key={si}>
              {si > 0 && (
                <div style={{ height: 1, background: '#f3f4f6', margin: '8px 2px' }} />
              )}
              {section.label && (
                <div style={{
                  fontSize: 9, fontWeight: 800, color: '#9ca3af',
                  letterSpacing: 1.2, textTransform: 'uppercase',
                  padding: '0 6px', marginBottom: 4, marginTop: 4,
                }}>
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = activeTab === item.value;
                const count = item.type ? counts[item.type] : undefined;
                return (
                  <div
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: 9, cursor: 'pointer',
                      border: isActive ? '1.5px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                      background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                      boxShadow: isActive ? '0 2px 8px rgba(124,58,237,0.1)' : 'none',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: item.dot, flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? PURPLE : '#374151',
                      }}>
                        {item.label}
                      </span>
                    </div>
                    {count !== undefined ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        background: isActive ? PURPLE : '#f3f4f6',
                        color: isActive ? 'white' : '#6b7280',
                        borderRadius: 20, padding: '1px 7px',
                        minWidth: 28, textAlign: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {count}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#d1d5db' }}>—</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          {pendingCount > 0 && (
            <Link to="/backoffice/taxonomia/moderacion" style={{ textDecoration: 'none', marginTop: 'auto' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 8, padding: '8px 10px', marginTop: 12, cursor: 'pointer',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', flex: 1 }}>Pendientes</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</span>
              </div>
            </Link>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {activeTab === 'resumen'      && <TaxonomyResumenTab onNavigate={(tab) => setActiveTab(tab as TabValue)} />}
          {activeTab === 'oficios'      && <TaxonomyCrudTab type="crafts" label="Oficios" />}
          {activeTab === 'tecnicas'     && <TaxonomyTecnicasTab />}
          {activeTab === 'materiales'   && <TaxonomyCrudTab type="materials" label="Materiales" />}
          {activeTab === 'estilos'      && <TaxonomyCrudTab type="styles" label="Estilos" />}
          {activeTab === 'herramientas' && <TaxonomyCrudTab type="herramientas" label="Herramientas" />}
          {activeTab === 'categorias'   && <TaxonomyCategoriasTab />}
          {activeTab === 'curatorial'   && <TaxonomyCrudTab type="curatorial" label="Categorías Curatoriales" />}
          {activeTab === 'badges'       && <TaxonomyBadgesTab />}
          {activeTab === 'aliases'      && <TaxonomyAliasTab />}
        </div>
      </div>
    </div>
  );
}
