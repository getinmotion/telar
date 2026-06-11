import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTaxonomyItems, type TaxonomyItemWithCount } from '@/services/taxonomy.actions';
import { SANS, SERIF, glassPrimary } from '@/components/dashboard/dashboardStyles';

<<<<<<< HEAD
const CRAFT_COLOR  = '#7c3aed';
=======
const CRAFT_COLOR  = 'hsl(var(--domain-business))';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
const TECH_COLOR   = '#38bdf8';
const CRAFT_RADIUS = 18;
const TECH_MIN_R   = 12;
const TECH_MAX_R   = 22;
const VERT_SPACING = 68;
const PAD_TOP      = 36;

interface CraftNode { id: string; name: string; y: number }
interface TechNode  { id: string; name: string; craftIds: string[]; productCount: number; y: number; radius: number }

function buildLayout(
  crafts: TaxonomyItemWithCount[],
  techniques: TaxonomyItemWithCount[],
  craftFilter: string,
  showOrphans: boolean,
  svgWidth: number,
): { craftNodes: CraftNode[]; techNodes: TechNode[]; height: number; craftX: number; techX: number } {
  const craftX = Math.round(svgWidth * 0.26);
  const techX  = Math.round(svgWidth * 0.74);

  const visible    = craftFilter === 'all' ? crafts : crafts.filter((c) => c.id === craftFilter);
  const craftIdSet = new Set(visible.map((c) => c.id));

  const craftNodes: CraftNode[] = visible.map((c, i) => ({
    id: c.id, name: c.name,
    y: PAD_TOP + i * VERT_SPACING,
  }));
  const craftYMap = new Map(craftNodes.map((n) => [n.id, n.y]));

  const maxPC = Math.max(1, ...techniques.map((t) => t.productCount ?? 0));

  const filtered = techniques.filter((t) => {
    const ids = getIds(t);
    return ids.some((id) => craftIdSet.has(id)) || (showOrphans && ids.length === 0);
  });

  const withAvgY = filtered.map((t) => {
    const ids  = getIds(t).filter((id) => craftYMap.has(id));
    const avgY = ids.length > 0
      ? ids.reduce((s, id) => s + (craftYMap.get(id) ?? 0), 0) / ids.length
      : 99999;
    return { t, avgY };
  });
  withAvgY.sort((a, b) => a.avgY - b.avgY);

  const techNodes: TechNode[] = withAvgY.map(({ t }, i) => {
    const pc     = t.productCount ?? 0;
    const radius = TECH_MIN_R + Math.round((pc / maxPC) * (TECH_MAX_R - TECH_MIN_R));
    return {
      id: t.id, name: t.name,
      craftIds: getIds(t).filter((id) => craftIdSet.has(id)),
      productCount: pc,
      y: PAD_TOP + i * VERT_SPACING,
      radius,
    };
  });

  const craftH = craftNodes.length > 0
    ? PAD_TOP + (craftNodes.length - 1) * VERT_SPACING + CRAFT_RADIUS * 2 + PAD_TOP
    : 200;
  const techH = techNodes.length > 0
    ? PAD_TOP + (techNodes.length - 1) * VERT_SPACING + TECH_MAX_R * 2 + PAD_TOP
    : 200;

  return { craftNodes, techNodes, height: Math.max(craftH, techH, 200), craftX, techX };
}

function getIds(t: TaxonomyItemWithCount): string[] {
  if (t.craftIds?.length) return t.craftIds;
  if (t.craftId) return [t.craftId];
  return [];
}

export function TaxonomyGrafoTab() {
  const [crafts,      setCrafts]      = useState<TaxonomyItemWithCount[]>([]);
  const [techniques,  setTechniques]  = useState<TaxonomyItemWithCount[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [craftFilter, setCraftFilter] = useState<string>('all');
  const [showOrphans, setShowOrphans] = useState(false);
  const [hoveredId,   setHoveredId]   = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth,    setSvgWidth]    = useState(800);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setSvgWidth(Math.max(400, Math.floor(w)));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllTaxonomyItems('crafts',     { status: 'approved' }),
      getAllTaxonomyItems('techniques', { status: 'approved', withProductCount: true }),
    ])
      .then(([c, t]) => { setCrafts(c); setTechniques(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { craftNodes, techNodes, height, craftX, techX } = buildLayout(
    crafts, techniques, craftFilter, showOrphans, svgWidth,
  );

  const getConnected = useCallback((id: string): Set<string> => {
    const s = new Set<string>([id]);
    const tech = techNodes.find((n) => n.id === id);
    if (tech) tech.craftIds.forEach((cid) => s.add(cid));
    const craft = craftNodes.find((n) => n.id === id);
    if (craft) techNodes.filter((t) => t.craftIds.includes(id)).forEach((t) => s.add(t.id));
    return s;
  }, [craftNodes, techNodes]);

  const connected = hoveredId ? getConnected(hoveredId) : null;
  const isDim     = (id: string) => connected !== null && !connected.has(id);

  const orphanCount = techniques.filter((t) => getIds(t).length === 0).length;

  const hoverInfo = (() => {
    if (!hoveredId) return null;
    const craft = craftNodes.find((n) => n.id === hoveredId);
    if (craft) {
      const techs = techNodes.filter((t) => t.craftIds.includes(hoveredId));
      return `${craft.name} → ${techs.length} técnica${techs.length !== 1 ? 's' : ''}${techs.length ? ': ' + techs.slice(0, 4).map((t) => t.name).join(', ') + (techs.length > 4 ? '…' : '') : ''}`;
    }
    const tech = techNodes.find((n) => n.id === hoveredId);
    if (tech) {
      const cs = craftNodes.filter((c) => tech.craftIds.includes(c.id));
      return `${tech.name} — ${tech.productCount} producto${tech.productCount !== 1 ? 's' : ''}${cs.length ? ' · ' + cs.map((c) => c.name).join(', ') : ''}`;
    }
    return null;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header + controls */}
      <div style={{ ...glassPrimary, borderRadius: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
<<<<<<< HEAD
            <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#151b2d' }}>
              Mapa de relaciones
            </h2>
            <p style={{ margin: '4px 0 0', fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.5)' }}>
=======
            <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: 'hsl(var(--on-surface))' }}>
              Mapa de relaciones
            </h2>
            <p style={{ margin: '4px 0 0', fontFamily: SANS, fontSize: 12, color: 'hsl(var(--on-surface-variant) / 0.5)' }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
              {loading
                ? 'Cargando…'
                : `${craftNodes.length} oficio${craftNodes.length !== 1 ? 's' : ''} → ${techNodes.length} técnica${techNodes.length !== 1 ? 's' : ''} conectadas`
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Select value={craftFilter} onValueChange={setCraftFilter}>
              <SelectTrigger style={{ width: 200, background: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: SANS }}>
                <SelectValue placeholder="Todos los oficios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los oficios</SelectItem>
                {crafts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {orphanCount > 0 && (
              <button
                onClick={() => setShowOrphans((v) => !v)}
                style={{
<<<<<<< HEAD
                  border: `1px solid ${showOrphans ? 'rgba(124,58,237,0.25)' : 'rgba(21,27,45,0.1)'}`,
                  borderRadius: 20, padding: '5px 14px',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
                  background: showOrphans ? 'rgba(124,58,237,0.07)' : 'transparent',
                  color: showOrphans ? '#7c3aed' : 'rgba(84,67,62,0.45)',
=======
                  border: `1px solid ${showOrphans ? 'hsl(var(--domain-business) / 0.25)' : 'hsl(var(--on-surface) / 0.1)'}`,
                  borderRadius: 20, padding: '5px 14px',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
                  background: showOrphans ? 'hsl(var(--domain-business) / 0.07)' : 'transparent',
                  color: showOrphans ? 'hsl(var(--domain-business))' : 'hsl(var(--on-surface-variant) / 0.45)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                  transition: 'all 0.15s',
                }}
              >
                {showOrphans ? '✓ ' : ''}Técnicas sin oficio ({orphanCount})
              </button>
            )}
          </div>
        </div>

<<<<<<< HEAD
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)', alignItems: 'center' }}>
=======
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontFamily: SANS, fontSize: 11, color: 'hsl(var(--on-surface-variant) / 0.45)', alignItems: 'center' }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill={CRAFT_COLOR} /></svg>
            Oficio
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill={TECH_COLOR} /></svg>
            Técnica — tamaño = uso
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        style={{
          background: '#0f172a',
<<<<<<< HEAD
          border: '1px solid rgba(124,58,237,0.15)',
=======
          border: '1px solid hsl(var(--domain-business) / 0.15)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
          borderRadius: 20, overflow: 'auto', maxHeight: 580,
        }}
      >
        {loading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 200, fontFamily: SANS, color: 'rgba(255,255,255,0.35)', fontSize: 13,
          }}>
            Cargando relaciones…
          </div>
        ) : craftNodes.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 200, fontFamily: SANS, color: 'rgba(255,255,255,0.35)', fontSize: 13,
          }}>
            No hay oficios aprobados para mostrar
          </div>
        ) : (
          <svg width={svgWidth} height={height} style={{ display: 'block', fontFamily: SANS }}>
            <defs>
              <filter id="glow-craft" x="-50%" y="-50%" width="200%" height="200%">
<<<<<<< HEAD
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#7c3aed" floodOpacity="0.7" />
=======
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="hsl(var(--domain-business))" floodOpacity="0.7" />
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
              </filter>
              <filter id="glow-tech" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Column headers */}
            <text x={craftX} y={16} textAnchor="middle" fontSize={9} fontWeight={800} fill="rgba(255,255,255,0.35)" letterSpacing={1.5}>
              OFICIOS
            </text>
            <text x={techX} y={16} textAnchor="middle" fontSize={9} fontWeight={800} fill="rgba(255,255,255,0.35)" letterSpacing={1.5}>
              TÉCNICAS
            </text>

            {/* Connection paths */}
            {techNodes.map((tech) =>
              tech.craftIds.map((craftId) => {
                const cn = craftNodes.find((c) => c.id === craftId);
                if (!cn) return null;
                const mx = (craftX + techX) / 2;
                const opacity = isDim(tech.id)
                  ? 0.03
                  : hoveredId
                    ? 0.7
                    : 0.15 + Math.min(0.35, tech.productCount / 60);
                return (
                  <path
                    key={`${craftId}-${tech.id}`}
                    d={`M ${craftX + CRAFT_RADIUS} ${cn.y} C ${mx} ${cn.y} ${mx} ${tech.y} ${techX - tech.radius} ${tech.y}`}
                    fill="none"
                    stroke="rgba(167,139,250,1)"
                    strokeWidth={1.5}
                    opacity={opacity}
                    style={{ transition: 'opacity 0.18s' }}
                  />
                );
              })
            )}

            {/* Craft nodes */}
            {craftNodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${craftX}, ${node.y})`}
                style={{ cursor: 'pointer' }}
                opacity={isDim(node.id) ? 0.15 : 1}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <circle
                  r={CRAFT_RADIUS}
                  fill={CRAFT_COLOR}
                  fillOpacity={hoveredId === node.id ? 1 : 0.85}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={2}
                  filter={hoveredId === node.id ? 'url(#glow-craft)' : undefined}
                  style={{ transition: 'filter 0.15s' }}
                />
                <text
                  x={CRAFT_RADIUS + 9}
                  dy="0.35em"
                  fontSize={11}
                  fontWeight={hoveredId === node.id ? 700 : 500}
                  fill={hoveredId === node.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)'}
                  style={{ userSelect: 'none', pointerEvents: 'none', transition: 'fill 0.15s' }}
                >
                  {node.name.length > 24 ? node.name.slice(0, 23) + '…' : node.name}
                </text>
              </g>
            ))}

            {/* Technique nodes */}
            {techNodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${techX}, ${node.y})`}
                style={{ cursor: 'pointer' }}
                opacity={isDim(node.id) ? 0.15 : 1}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <circle
                  r={node.radius}
                  fill={TECH_COLOR}
                  fillOpacity={hoveredId === node.id ? 1 : 0.78}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={1.5}
                  filter={hoveredId === node.id ? 'url(#glow-tech)' : undefined}
                  style={{ transition: 'filter 0.15s' }}
                />
                {node.productCount > 0 && (
                  <text
                    dy="0.35em"
                    textAnchor="middle"
                    fontSize={8}
                    fontWeight={800}
                    fill="rgba(15,23,42,0.85)"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {node.productCount}
                  </text>
                )}
                <text
                  x={-(node.radius + 9)}
                  dy="0.35em"
                  fontSize={11}
                  fontWeight={node.productCount > 0 ? 700 : 400}
                  fill={hoveredId === node.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.68)'}
                  textAnchor="end"
                  style={{ userSelect: 'none', pointerEvents: 'none', transition: 'fill 0.15s' }}
                >
                  {node.name.length > 24 ? node.name.slice(0, 23) + '…' : node.name}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>

      {/* Hover info strip */}
      <div style={{ minHeight: 20 }}>
        {hoverInfo && (
          <div style={{
            fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.85)',
            fontStyle: 'italic',
            padding: '8px 14px',
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 12, display: 'inline-block',
          }}>
            {hoverInfo}
          </div>
        )}
      </div>
    </div>
  );
}
