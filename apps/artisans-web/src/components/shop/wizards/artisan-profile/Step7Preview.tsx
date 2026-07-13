import React, { useState, useEffect } from 'react';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS, ETHNIC_RELATION_OPTIONS } from '@/types/artisanProfile';
import { getAllTechniques, getAllCrafts } from '@/services/crafts.actions';
import { getAllMaterials } from '@/services/materials.actions';
import { getAllCategories } from '@/services/categories.actions';
import { getTechniqueIcon } from './Step5Craft';
import { getCraftIcon } from '@/components/shop/new-product-wizard/components/CraftPicker';
import { WHEN_OPTIONS } from './Step2Origin';
import { UNIQUENESS_OPTIONS } from '@/constants/uniquenessOptions';

interface Props {
  data: ArtisanProfileData;
  generatedStory?: any;
  isGenerating?: boolean;
  onEditStep?: (step: number) => void;
}

// ── Resolver de IDs → nombres ─────────────────────────────────────────────────

function useResolvedNames<T extends { id: string; name: string }>(
  ids: string[] | undefined,
  knownNames: string[] | undefined,
  fetcher: () => Promise<T[]>,
): { names: { id: string; name: string }[]; loading: boolean } {
  const [names, setNames] = useState<{ id: string; name: string }[]>(() =>
    knownNames?.length ? knownNames.map((name, i) => ({ id: ids?.[i] ?? name, name })) : [],
  );
  const [loading, setLoading] = useState(!knownNames?.length && !!ids?.length);

  useEffect(() => {
    if (knownNames?.length) {
      setNames(knownNames.map((name, i) => ({ id: ids?.[i] ?? name, name })));
      setLoading(false);
      return;
    }
    if (!ids?.length) { setNames([]); setLoading(false); return; }
    setLoading(true);
    fetcher()
      .then(all => setNames(all.filter(x => ids.includes(x.id))))
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids?.join(','), knownNames?.join(',')]);

  return { names, loading };
}

// ── Material icon ─────────────────────────────────────────────────────────────

const MAT_ICONS: { keywords: string[]; icon: string }[] = [
  { keywords: ['lana', 'fibra', 'hilo', 'hilado'], icon: 'nest_wifi_router' },
  { keywords: ['algodón', 'algodon', 'tela', 'lienzo'], icon: 'dry_cleaning' },
  { keywords: ['cuero', 'piel', 'gamuza'], icon: 'pets' },
  { keywords: ['madera', 'cedro', 'pino', 'bambú', 'bambu'], icon: 'forest' },
  { keywords: ['arcilla', 'barro', 'porcelana', 'greda'], icon: 'water_drop' },
  { keywords: ['vidrio', 'cristal'], icon: 'light_mode' },
  { keywords: ['metal', 'hierro', 'cobre', 'plata', 'oro'], icon: 'hardware' },
  { keywords: ['palma', 'mimbre', 'fique', 'esparto', 'paja'], icon: 'grass' },
  { keywords: ['pintura', 'pigmento', 'tinte'], icon: 'colorize' },
  { keywords: ['piedra', 'mármol', 'granito'], icon: 'landscape' },
  { keywords: ['tagua', 'semilla', 'coco', 'plumas'], icon: 'eco' },
  { keywords: ['papel', 'cartón'], icon: 'description' },
];

function matIcon(name: string): string {
  const l = name.toLowerCase();
  for (const { keywords, icon } of MAT_ICONS) {
    if (keywords.some(k => l.includes(k))) return icon;
  }
  return 'category';
}

// ── Primitivos de UI ──────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(226,213,207,0.3)',
  boxShadow: '0 1px 8px -2px rgba(0,0,0,0.04)',
  borderRadius: '0.875rem',
  overflow: 'hidden',
};

const CardHeader: React.FC<{
  icon: string;
  label: string;
  step: number;
  color?: string;
  onEdit?: (n: number) => void;
}> = ({ icon, label, step, color = '#ec6d13', onEdit }) => (
  <div
    className="flex items-center justify-between px-4 py-2.5"
    style={{ background: `${color}09`, borderBottom: `1px solid ${color}18` }}
  >
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[15px]" style={{ color }}>{icon}</span>
      <span className="font-['Manrope'] text-[9px] font-[900] uppercase tracking-widest" style={{ color: `${color}cc` }}>
        {label}
      </span>
    </div>
    {onEdit && (
      <button
        onClick={() => onEdit(step)}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:opacity-80"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}
      >
        <span className="material-symbols-outlined text-[11px]" style={{ color }}>edit</span>
        <span className="font-['Manrope'] text-[8px] font-[800] uppercase tracking-widest" style={{ color }}>Editar</span>
      </button>
    )}
  </div>
);

const Chip: React.FC<{ icon?: string; label: string; color?: string }> = ({ icon, label, color = '#54433e' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-['Manrope'] text-[10px] font-[700]"
    style={{ background: `${color}0a`, border: `1px solid ${color}1a`, color }}
  >
    {icon && <span className="material-symbols-outlined" style={{ fontSize: 12, color }}>{icon}</span>}
    {label}
  </span>
);

const Row: React.FC<{ icon: string; label: string; value?: string | null; color?: string }> = ({
  icon, label, value, color = '#54433e',
}) => {
  if (!value?.trim()) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0" style={{ color: `${color}60` }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest mb-0.5" style={{ color: `${color}45` }}>{label}</p>
        <p
          className="font-['Manrope'] text-[12px] font-[500] text-[#151b2d] leading-snug"
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const Spinner: React.FC = () => (
  <span className="material-symbols-outlined text-[13px] text-[#54433e]/30 animate-spin">progress_activity</span>
);

// ── Barra de calidad ──────────────────────────────────────────────────────────

const QualityBar: React.FC<{ data: ArtisanProfileData; hasTechs: boolean; hasMats: boolean }> = ({ data, hasTechs, hasMats }) => {
  const checks = [
    { label: 'Nombre',      done: !!data.artisanName?.trim() },
    { label: 'Foto',        done: !!data.artisanPhoto },
    { label: 'Taller',      done: !!data.artisticName?.trim() },
    { label: 'Oficio',      done: !!(data.craftIds?.length || data.craftId) },
    { label: 'Técnicas',    done: hasTechs },
    { label: 'Origen',      done: !!data.learnedFrom },
    { label: 'Historia',    done: !!data.learnedFromDetail?.trim() },
    { label: 'Materiales',  done: hasMats },
    { label: 'Singularidad',done: !!data.uniqueness?.trim() },
    { label: 'Foto taller', done: !!(data.workshopPhoto || data.workshopPhotos?.length) },
  ];
  const done = checks.filter(c => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  const col = done === checks.length ? '#166534' : '#ec6d13';

  return (
    <div className="rounded-xl p-3.5" style={{ background: `${col}07`, border: `1px solid ${col}1e` }}>
      <div className="flex items-center gap-3 mb-2">
        <span
          className="material-symbols-outlined text-[16px]"
          style={{ color: col, fontVariationSettings: "'FILL' 1" }}
        >
          {done === checks.length ? 'verified' : 'edit_note'}
        </span>
        <p className="flex-1 font-['Manrope'] text-[10px] font-[800] text-[#151b2d]">
          {done === checks.length ? 'Perfil completo — listo para publicar' : `${pct}% completo — ${checks.length - done} campo(s) pendiente(s)`}
        </p>
        <span className="font-['Manrope'] text-[13px] font-[900]" style={{ color: col }}>{done}/{checks.length}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: col }} />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c, i) => (
          <span key={i} className="flex items-center gap-0.5 font-['Manrope'] text-[9px] font-[600]" style={{ color: c.done ? '#166534' : 'rgba(84,67,62,0.35)' }}>
            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: c.done ? "'FILL' 1" : "'FILL' 0" }}>
              {c.done ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const Step7Preview: React.FC<Props> = ({ data, isGenerating, onEditStep }) => {
  const craftIds = data.craftIds ?? (data.craftId ? [data.craftId] : []);
  const { names: crafts,     loading: loadingCrafts }  = useResolvedNames(craftIds, undefined, getAllCrafts);
  const { names: techniques, loading: loadingTechs }   = useResolvedNames(
    data.techniqueIds,
    data.techniqueIds?.length ? undefined : (data.techniques?.length ? data.techniques : undefined),
    getAllTechniques,
  );
  const { names: materials,  loading: loadingMats }    = useResolvedNames(
    data.materialIds,
    data.materialIds?.length ? undefined : (data.materials?.length ? data.materials : undefined),
    getAllMaterials,
  );
  const { names: categories, loading: loadingCats }    = useResolvedNames(
    data.categoryIds,
    undefined,
    async () => {
      const all = await getAllCategories();
      return all.map(c => ({ id: c.id, name: c.name }));
    },
  );

  const learnedFromLabel = LEARNED_FROM_OPTIONS.find(o => o.value === data.learnedFrom)?.label;
  const ethnicLabel      = ETHNIC_RELATION_OPTIONS.find(o => o.value === data.ethnicRelation)?.label;
  const whenLabel        = WHEN_OPTIONS.find(o => o.age === data.startAge)?.label;
  const territory        = [data.municipality, data.department, data.country].filter(Boolean).join(', ');

  // Galería del taller: foto principal + fotos adicionales
  const allWorkshopPhotos = [
    data.workshopPhoto,
    ...(data.workshopPhotos ?? []),
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-3">

      {/* Generando narrativa */}
      {isGenerating && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(236,109,19,0.05)', border: '1px solid rgba(236,109,19,0.18)' }}>
          <div className="w-3 h-3 border-2 border-[#ec6d13]/25 border-t-[#ec6d13] rounded-full animate-spin shrink-0" />
          <p className="font-['Manrope'] text-[11px] text-[#ec6d13] font-[600]">Generando narrativa con IA…</p>
        </div>
      )}

      {/* Barra de calidad */}
      <QualityBar data={data} hasTechs={techniques.length > 0} hasMats={materials.length > 0} />

      {/* ── Card 1: Identidad Artesanal ───────────────────────────────────── */}
      <div style={card}>
        <CardHeader icon="person" label="Identidad Artesanal" step={1} color="#ec6d13" onEdit={onEditStep} />
        <div className="p-4 flex flex-col gap-3">

          {/* Foto + nombre del artesano */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: 'rgba(84,67,62,0.06)', border: '1px solid rgba(226,213,207,0.4)' }}
            >
              {data.artisanPhoto
                ? <img src={data.artisanPhoto} alt="" className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-[26px] text-[#54433e]/15">account_circle</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-0.5">Nombre del artesano</p>
              <p className="font-['Noto_Serif'] text-[17px] font-[700] text-[#151b2d] leading-tight truncate">
                {data.artisanName?.trim() || <span className="font-['Manrope'] text-[13px] italic font-[400] text-[#54433e]/25">Sin nombre</span>}
              </p>
            </div>
          </div>

          {/* Nombre del taller + contexto de uso */}
          {data.artisticName?.trim() && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(236,109,19,0.15)' }}>
              <div className="px-3 py-2.5" style={{ background: 'rgba(236,109,19,0.05)' }}>
                <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#ec6d13]/60 mb-0.5">Nombre del taller</p>
                <p className="font-['Manrope'] text-[14px] font-[700] text-[#ec6d13]">{data.artisticName}</p>
              </div>
              <div className="px-3 py-2 border-t border-[#ec6d13]/10">
                <p className="font-['Manrope'] text-[8px] font-[800] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Este nombre se usará en</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { icon: 'link', label: 'URL de la tienda' },
                    { icon: 'storefront', label: 'Marketplace de Telar' },
                    { icon: 'language', label: 'Tienda online' },
                    { icon: 'sell', label: 'Canales de venta' },
                  ].map(({ icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-['Manrope'] text-[9px] font-[700]"
                      style={{ background: 'rgba(236,109,19,0.07)', border: '1px solid rgba(236,109,19,0.15)', color: '#ec6d13' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{icon}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Categorías del taller */}
          <div>
            <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Categorías del taller</p>
            {loadingCats
              ? <div className="flex items-center gap-1.5"><Spinner /><span className="font-['Manrope'] text-[10px] text-[#54433e]/35">Cargando…</span></div>
              : categories.length > 0
                ? <div className="flex flex-wrap gap-1.5">{categories.map(c => <Chip key={c.id} icon="category" label={c.name} color="#54433e" />)}</div>
                : <p className="font-['Manrope'] text-[11px] italic text-[#54433e]/25">Sin categorías</p>
            }
          </div>

          {/* Oficios */}
          <div>
            <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Oficios</p>
            {loadingCrafts
              ? <div className="flex items-center gap-1.5"><Spinner /><span className="font-['Manrope'] text-[10px] text-[#54433e]/35">Cargando…</span></div>
              : crafts.length > 0
                ? <div className="flex flex-wrap gap-1.5">{crafts.map(c => <Chip key={c.id} icon={getCraftIcon(c.name)} label={c.name} color="#54433e" />)}</div>
                : <p className="font-['Manrope'] text-[11px] italic text-[#54433e]/25">Sin oficio</p>
            }
          </div>

          {/* Técnicas */}
          <div>
            <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Técnicas</p>
            {loadingTechs
              ? <div className="flex items-center gap-1.5"><Spinner /><span className="font-['Manrope'] text-[10px] text-[#54433e]/35">Cargando…</span></div>
              : techniques.length > 0
                ? <div className="flex flex-wrap gap-1.5">{techniques.map(t => <Chip key={t.id} icon={getTechniqueIcon(t.name)} label={t.name} color="#ec6d13" />)}</div>
                : <p className="font-['Manrope'] text-[11px] italic text-[#54433e]/25">Sin técnicas</p>
            }
          </div>

        </div>
      </div>

      {/* ── Card 2: Historia y Trayectoria ────────────────────────────────── */}
      <div style={card}>
        <CardHeader icon="history_edu" label="Historia y Trayectoria" step={2} color="#7c3aed" onEdit={onEditStep} />
        <div className="p-4 flex flex-col gap-3">

          {/* Presentación breve */}
          {data.shortBio?.trim() && (
            <Row icon="format_quote" label="Presentación breve" value={data.shortBio} color="#7c3aed" />
          )}

          {/* Origen del oficio */}
          {learnedFromLabel && (
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0" style={{ color: 'rgba(124,58,237,0.6)' }}>school</span>
              <div className="flex-1 min-w-0">
                <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(124,58,237,0.45)' }}>Origen del oficio</p>
                <p className="font-['Manrope'] text-[12px] font-[600] text-[#151b2d]">{learnedFromLabel}</p>
              </div>
            </div>
          )}

          {/* ¿Cuándo empezó este camino? */}
          {(whenLabel || data.startAge > 0) && (
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0" style={{ color: 'rgba(124,58,237,0.6)' }}>calendar_today</span>
              <div className="flex-1 min-w-0">
                <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(124,58,237,0.45)' }}>¿Cuándo empezó este camino para ti?</p>
                <p className="font-['Manrope'] text-[12px] font-[600] text-[#151b2d]">
                  {whenLabel ?? `A los ${data.startAge} años`}
                </p>
              </div>
            </div>
          )}

          {/* Cuéntanos cómo comenzó este camino */}
          {data.learnedFromDetail?.trim() && (
            <Row icon="auto_stories" label="Cuéntanos cómo comenzó este camino" value={data.learnedFromDetail} color="#7c3aed" />
          )}

          {/* Territorio de origen */}
          {(territory || data.communityVillage || data.ethnicRelation) && (
            <div className="flex items-start gap-2.5 pt-2 border-t border-[#e2d5cf]/25">
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0" style={{ color: 'rgba(124,58,237,0.6)' }}>map</span>
              <div className="flex-1 min-w-0">
                <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest mb-1" style={{ color: 'rgba(124,58,237,0.45)' }}>Territorio de origen</p>
                {territory && (
                  <p className="font-['Manrope'] text-[12px] text-[#54433e]/70 mb-1">{territory}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {data.communityVillage && (
                    <Chip icon="location_on" label={data.communityVillage} color="#7c3aed" />
                  )}
                  {data.ethnicRelation && data.ethnicRelation !== 'ninguna' && (
                    <Chip label={ethnicLabel ?? data.ethnicRelation} color="#7c3aed" />
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Card 3: Arte, Estilo y Creación ───────────────────────────────── */}
      <div style={card}>
        <CardHeader icon="palette" label="Arte, Estilo y Creación" step={3} color="#0369a1" onEdit={onEditStep} />
        <div className="p-4 flex flex-col gap-3">

          {/* Materiales */}
          <div>
            <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Materiales</p>
            {loadingMats
              ? <div className="flex items-center gap-1.5"><Spinner /><span className="font-['Manrope'] text-[10px] text-[#54433e]/35">Cargando…</span></div>
              : materials.length > 0
                ? <div className="flex flex-wrap gap-1.5">{materials.map(m => <Chip key={m.id} icon={matIcon(m.name)} label={m.name} color="#166534" />)}</div>
                : <p className="font-['Manrope'] text-[11px] italic text-[#54433e]/25">Sin materiales</p>
            }
          </div>

          {/* Tiempo promedio de elaboración */}
          {data.averageTime?.trim() && (
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[14px] shrink-0" style={{ color: 'rgba(3,105,161,0.5)' }}>schedule</span>
              <div className="flex-1 min-w-0">
                <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(3,105,161,0.45)' }}>Tiempo promedio de elaboración</p>
                <p className="font-['Manrope'] text-[12px] font-[600] text-[#151b2d]">{data.averageTime}</p>
              </div>
            </div>
          )}

          {/* ¿Qué hace especial tu trabajo? */}
          {(data.uniquenessKeys?.length || data.uniqueness?.trim()) ? (
            <div>
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">
                ¿Qué hace especial tu trabajo?
              </p>
              {data.uniquenessKeys && data.uniquenessKeys.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {data.uniquenessKeys.map((k) => {
                    const opt = UNIQUENESS_OPTIONS.find((o) => o.key === k);
                    return opt ? (
                      <span
                        key={k}
                        className="inline-flex items-center px-2.5 py-1 rounded-full font-['Manrope'] text-[10px] font-[700]"
                        style={{ background: 'rgba(3,105,161,0.08)', color: '#0369a1', border: '1px solid rgba(3,105,161,0.2)' }}
                      >
                        {opt.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {data.uniqueness?.trim() && (
                <p className="font-['Manrope'] text-[12px] text-[#54433e]/70 leading-relaxed italic">
                  {data.uniqueness}
                </p>
              )}
            </div>
          ) : null}

          {/* Estilo artesanal */}
          {(data.craftStyle?.length > 0) && (
            <div>
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Estilo artesanal</p>
              <div className="flex flex-wrap gap-1.5">
                {data.craftStyle.map(s => <Chip key={s} icon="style" label={s} color="#0369a1" />)}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Card 4: Tu Taller y Tu Progreso ───────────────────────────────── */}
      <div style={card}>
        <CardHeader icon="storefront" label="Tu Taller y Tu Progreso" step={4} color="#b45309" onEdit={onEditStep} />
        <div className="p-4 flex flex-col gap-3">

          {/* Registro visual del taller — galería */}
          {allWorkshopPhotos.length > 0 && (
            <div>
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Registro visual del taller</p>
              {allWorkshopPhotos.length === 1 ? (
                <div
                  className="w-full h-32 rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(226,213,207,0.3)' }}
                >
                  <img src={allWorkshopPhotos[0]} alt="Taller" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Foto principal ocupa 2 columnas */}
                  <div
                    className="col-span-2 rounded-xl overflow-hidden"
                    style={{ height: 96, border: '1px solid rgba(226,213,207,0.3)' }}
                  >
                    <img src={allWorkshopPhotos[0]} alt="Taller" className="w-full h-full object-cover" />
                  </div>
                  {/* Fotos adicionales apiladas */}
                  <div className="flex flex-col gap-1.5">
                    {allWorkshopPhotos.slice(1, 3).map((photo, i) => (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden flex-1"
                        style={{ height: i === allWorkshopPhotos.slice(1).length - 1 && allWorkshopPhotos.length > 3 ? undefined : undefined, border: '1px solid rgba(226,213,207,0.3)', minHeight: 42 }}
                      >
                        <img src={photo} alt={`Taller ${i + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {allWorkshopPhotos.length > 3 && (
                      <div
                        className="rounded-xl overflow-hidden flex-1 flex items-center justify-center"
                        style={{ minHeight: 42, background: 'rgba(84,67,62,0.07)', border: '1px solid rgba(226,213,207,0.3)' }}
                      >
                        <span className="font-['Manrope'] text-[10px] font-[800] text-[#54433e]/50">+{allWorkshopPhotos.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Descripción del taller */}
          {data.workshopDescription?.trim() && (
            <Row icon="home_work" label="Descripción del taller" value={data.workshopDescription} color="#b45309" />
          )}

          {/* Proceso de creación */}
          {data.creationProcess?.trim() && (
            <Row icon="manufacturing" label="Proceso de creación" value={data.creationProcess} color="#b45309" />
          )}

          {/* Herramientas del taller */}
          {(data.workshopTools?.length ?? 0) > 0 && (
            <div>
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/35 mb-1.5">Herramientas del taller</p>
              <div className="flex flex-wrap gap-1.5">
                {data.workshopTools.map(t => <Chip key={t} icon="handyman" label={t} color="#b45309" />)}
              </div>
            </div>
          )}

          {/* Sin datos */}
          {allWorkshopPhotos.length === 0 && !data.workshopDescription?.trim() && !data.creationProcess?.trim() && (
            <p className="font-['Manrope'] text-[12px] italic text-[#54433e]/25 text-center py-4">
              Sin información del taller
            </p>
          )}

        </div>
      </div>

    </div>
  );
};
