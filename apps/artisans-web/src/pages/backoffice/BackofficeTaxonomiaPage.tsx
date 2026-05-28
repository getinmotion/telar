import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getPendingTaxonomies, getTaxonomySummary, type TaxonomyType } from '@/services/taxonomy.actions';
import { TaxonomyHealthDashboard } from '@/components/backoffice/taxonomy/TaxonomyHealthDashboard';
import { TaxonomyGrafoTab }         from '@/components/backoffice/taxonomy/TaxonomyGrafoTab';
import { TaxonomyModeracionTab }     from '@/components/backoffice/taxonomy/TaxonomyModeracionTab';
import { TaxonomyImpactoTab }        from '@/components/backoffice/taxonomy/TaxonomyImpactoTab';
import { TaxonomyCulturaTab }        from '@/components/backoffice/taxonomy/TaxonomyCulturaTab';
import { TaxonomyCrudTab }           from '@/components/backoffice/taxonomy/TaxonomyCrudTab';
import { TaxonomyTecnicasTab }       from '@/components/backoffice/taxonomy/TaxonomyTecnicasTab';
import { TaxonomyCategoriasTab }     from '@/components/backoffice/taxonomy/TaxonomyCategoriasTab';
import { TaxonomyBadgesTab }         from '@/components/backoffice/taxonomy/TaxonomyBadgesTab';
import { TaxonomyAliasTab }          from '@/components/backoffice/taxonomy/TaxonomyAliasTab';

type TabValue =
  | 'health' | 'grafo' | 'moderacion' | 'impacto' | 'cultura'
  | 'oficios' | 'tecnicas' | 'materiales' | 'estilos' | 'herramientas'
  | 'categorias' | 'curatorial' | 'badges' | 'aliases';

const PURPLE = '#7c3aed';
const SANS   = "'Manrope', sans-serif";

interface SidebarItem {
  value: TabValue;
  label: string;
  dot: string;
  type?: TaxonomyType;
}

interface Section {
  label?: string;
  collapsible?: boolean;
  collapseKey?: 'terms' | 'clasificacion';
  items: SidebarItem[];
}

const SECTIONS: Section[] = [
  {
    label: 'Sistema de conocimiento',
    items: [
      { value: 'health',    label: 'Salud del sistema', dot: PURPLE     },
      { value: 'grafo',     label: 'Relaciones',        dot: '#0369a1'  },
    ],
  },
  {
    label: 'Moderación',
    items: [
      { value: 'moderacion', label: 'Cola inteligente', dot: '#d97706' },
    ],
  },
  {
    label: 'Términos',
    collapsible: true,
    collapseKey: 'terms',
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
    collapsible: true,
    collapseKey: 'clasificacion',
    items: [
      { value: 'categorias', label: 'Categorías',        dot: '#0f766e' },
      { value: 'curatorial', label: 'Cat. Curatoriales', dot: '#6366f1' },
      { value: 'badges',     label: 'Badges',            dot: PURPLE    },
      { value: 'aliases',    label: 'Aliases',           dot: '#6b7280' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { value: 'impacto', label: 'Impacto Marketplace',  dot: '#15803d' },
      { value: 'cultura', label: 'Cultura y Territorio', dot: '#b45309' },
    ],
  },
];

export default function BackofficeTaxonomiaPage() {
  const [activeTab,    setActiveTab]    = useState<TabValue>('health');
  const [pendingCount, setPendingCount] = useState(0);
  const [counts,       setCounts]       = useState<Partial<Record<string, number>>>({});
  const [termsOpen,    setTermsOpen]    = useState(true);
  const [clasifOpen,   setClasifOpen]   = useState(true);

  useEffect(() => {
    getPendingTaxonomies()
      .then((data) => {
        setPendingCount(Object.values(data).reduce((acc, arr) => acc + arr.length, 0));
      })
      .catch(() => {});

    getTaxonomySummary()
      .then((summary) => {
        const map: Record<string, number> = {};
        for (const [type, data] of Object.entries(summary)) map[type] = data.total;
        setCounts(map);
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

  const isOpen = (key?: 'terms' | 'clasificacion') => {
    if (!key) return true;
    return key === 'terms' ? termsOpen : clasifOpen;
  };
  const toggle = (key?: 'terms' | 'clasificacion') => {
    if (key === 'terms') setTermsOpen((v) => !v);
    else if (key === 'clasificacion') setClasifOpen((v) => !v);
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#f9f7f2',
      backgroundImage: [
        'radial-gradient(circle at top left, rgba(167,139,250,0.2) 0%, transparent 40%)',
        'radial-gradient(circle at bottom right, rgba(187,247,208,0.18) 0%, transparent 44%)',
        'radial-gradient(circle at top right, rgba(255,244,223,0.7) 0%, transparent 36%)',
      ].join(', '),
      fontFamily: SANS,
    }}>
      {/* Top bar */}
      <div style={{
        background: 'rgba(249,247,242,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(84,67,62,0.08)',
        padding: '13px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'rgba(124,58,237,0.1)',
            border: '1.5px solid rgba(124,58,237,0.2)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🏺
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#151b2d', fontFamily: SANS }}>
              Taxonomías
            </div>
            <div style={{
              fontSize: 9, color: 'rgba(84,67,62,0.45)', marginTop: 1,
              fontFamily: SANS, fontWeight: 600, letterSpacing: '0.08em',
            }}>
              El cerebro ontológico de TELAR
            </div>
          </div>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setActiveTab('moderacion')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#b45309', borderRadius: 20, padding: '5px 14px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: SANS,
              boxShadow: '0 0 12px rgba(245,158,11,0.15)',
            }}
          >
            ⚠ {pendingCount} término{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} →
          </button>
        )}
      </div>

      {/* Body: sidebar + main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 224, flexShrink: 0,
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255,255,255,0.65)',
          padding: '12px 10px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {SECTIONS.map((section, si) => {
            const open = isOpen(section.collapseKey);

            return (
              <React.Fragment key={si}>
                {si > 0 && (
                  <div style={{ height: 1, background: 'rgba(84,67,62,0.06)', margin: '6px 2px' }} />
                )}

                {section.label && (
                  <div
                    onClick={section.collapsible ? () => toggle(section.collapseKey) : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontFamily: SANS,
                      fontSize: 9, fontWeight: 800,
                      color: 'rgba(84,67,62,0.4)',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      padding: '4px 6px', marginBottom: 2,
                      cursor: section.collapsible ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <span>{section.label}</span>
                    {section.collapsible && (
                      open
                        ? <ChevronDown size={10} style={{ color: 'rgba(84,67,62,0.35)' }} />
                        : <ChevronRight size={10} style={{ color: 'rgba(84,67,62,0.35)' }} />
                    )}
                  </div>
                )}

                {open && section.items.map((item) => {
                  const isActive = activeTab === item.value;
                  const count    = item.type ? counts[item.type] : undefined;
                  const isMod    = item.value === 'moderacion';

                  return (
                    <div
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                        border: isActive
                          ? '1px solid rgba(124,58,237,0.2)'
                          : '1px solid transparent',
                        background: isActive ? 'rgba(124,58,237,0.07)' : 'transparent',
                        boxShadow: isActive ? '0 2px 8px rgba(124,58,237,0.08)' : 'none',
                        transition: 'all 0.15s',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: item.dot, flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: 13, fontWeight: isActive ? 700 : 500,
                          color: isActive ? PURPLE : 'rgba(21,27,45,0.72)',
                          fontFamily: SANS,
                        }}>
                          {item.label}
                        </span>
                      </div>

                      {isMod && pendingCount > 0 ? (
                        <span style={{
                          fontSize: 10, fontWeight: 800,
                          background: isActive ? '#f59e0b' : 'rgba(245,158,11,0.15)',
                          color: isActive ? 'white' : '#b45309',
                          borderRadius: 20, padding: '1px 7px',
                          minWidth: 22, textAlign: 'center',
                        }}>
                          {pendingCount}
                        </span>
                      ) : count !== undefined ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          background: isActive ? PURPLE : 'rgba(21,27,45,0.06)',
                          color: isActive ? 'white' : 'rgba(21,27,45,0.38)',
                          borderRadius: 20, padding: '1px 7px',
                          minWidth: 28, textAlign: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {count}
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, color: 'rgba(21,27,45,0.15)' }}>—</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {activeTab === 'health'       && <TaxonomyHealthDashboard onNavigate={(tab) => setActiveTab(tab as TabValue)} />}
          {activeTab === 'grafo'        && <TaxonomyGrafoTab />}
          {activeTab === 'moderacion'   && <TaxonomyModeracionTab />}
          {activeTab === 'impacto'      && <TaxonomyImpactoTab />}
          {activeTab === 'cultura'      && <TaxonomyCulturaTab />}
          {activeTab === 'oficios'      && <TaxonomyCrudTab type="crafts"       label="Oficios"                />}
          {activeTab === 'tecnicas'     && <TaxonomyTecnicasTab />}
          {activeTab === 'materiales'   && <TaxonomyCrudTab type="materials"    label="Materiales"             />}
          {activeTab === 'estilos'      && <TaxonomyCrudTab type="styles"       label="Estilos"                />}
          {activeTab === 'herramientas' && <TaxonomyCrudTab type="herramientas" label="Herramientas"           />}
          {activeTab === 'categorias'   && <TaxonomyCategoriasTab />}
          {activeTab === 'curatorial'   && <TaxonomyCrudTab type="curatorial"   label="Categorías Curatoriales"/>}
          {activeTab === 'badges'       && <TaxonomyBadgesTab />}
          {activeTab === 'aliases'      && <TaxonomyAliasTab />}
        </div>
      </div>
    </div>
  );
}
