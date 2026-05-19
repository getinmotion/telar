/**
 * CmsAdminPage — Admin editor for the marketplace public-page CMS.
 *
 * Layout: page-key selector → ordered list of sections with edit / publish /
 * delete / move-up / move-down. "Add section" opens a small dialog that
 * picks a section type and renders a hand-written form per type.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCmsAdmin } from '@/hooks/useCmsAdmin';
import type {
  CmsSection,
  CmsSectionType,
} from '@/services/cms-sections.types';
import { SANS, SERIF, lc } from '@/components/dashboard/dashboardStyles';
import {
  ORANGE,
  ORANGE_MID,
  FieldText,
  FieldArea,
  HeroForm,
  QuoteForm,
  TwoColumnIntroForm,
  TechniqueGridForm,
  FeaturedAsideCardForm,
  MetricsStatForm,
  MuestraIntroForm,
  ArchiveLabelForm,
  EditorialFooterForm,
  HomeValuePropsForm,
  HomeSectionHeaderForm,
  EmbeddedWidgetForm,
  ContentPickForm,
  HomeBlockForm,
  HomeHeroCarouselForm,
  RawJsonForm,
} from '@/components/cms/SectionFormFields';

// ─── Design tokens (local only) ───────────────────────────────────────────────
const ORANGE_DARK = '#9c3f00';

const glass = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(236,109,19,0.12)',
  borderRadius: 24,
  boxShadow: '0 4px 20px rgba(236,109,19,0.04)',
} as const;

// ─── Data ─────────────────────────────────────────────────────────────────────
const PAGE_KEYS = [
  { key: 'tecnicas',    label: 'Página /tecnicas'              },
  { key: 'home',        label: 'Página / (homepage)'           },
  { key: 'colecciones', label: 'Página /colecciones (índice)'  },
];

const SECTION_TYPES: { value: CmsSectionType; label: string }[] = [
  { value: 'hero',                 label: 'Hero (kicker + título + cuerpo)'                      },
  { value: 'quote',                label: 'Cita destacada'                                        },
  { value: 'two_column_intro',     label: 'Intro a dos columnas'                                  },
  { value: 'technique_grid',       label: 'Grilla de técnicas (4 cards)'                          },
  { value: 'featured_aside_card',  label: 'Card lateral destacada (Archivo Digital)'              },
  { value: 'metrics_stat',         label: 'Métrica destacada (caja naranja)'                      },
  { value: 'muestra_intro',        label: 'Intro de muestra (kicker + título + cuerpo)'           },
  { value: 'archive_label',        label: 'Etiqueta de archivo (label centrado)'                  },
  { value: 'editorial_footer',     label: 'Footer editorial (Legado Viviente)'                    },
  { value: 'home_value_props',     label: 'Home — Value Props (3 cards)'                          },
  { value: 'home_section_header',  label: 'Home — Section Header'                                 },
  { value: 'home_block',           label: 'Home — Block (variant: light/dark/cream/bordered)'     },
  { value: 'home_hero_carousel',   label: 'Home — Hero Carousel (slides editables)'               },
  { value: 'content_pick',         label: 'Content Pick (banner/card que apunta a blog/colección)'},
  { value: 'embedded_widget',      label: 'Embedded Widget (categorías, productos, taller…)'      },
];

function emptyPayloadFor(type: CmsSectionType): Record<string, any> {
  switch (type) {
    case 'hero':
      return { kicker: '', title: '', subtitle: '', body: '', totalCountLabel: '' };
    case 'quote':
      return { kicker: '', body: '', attribution: '' };
    case 'two_column_intro':
      return {
        kicker: '', title: '', body: '',
        columns: [
          { kicker: '', title: '', body: '' },
          { kicker: '', title: '', body: '' },
        ],
      };
    case 'technique_grid':
      return {
        kicker: '', title: '',
        cards: [
          { title: '', body: '', slug: '', imageKey: '' },
          { title: '', body: '', slug: '', imageKey: '' },
          { title: '', body: '', slug: '', imageKey: '' },
          { title: '', body: '', slug: '', imageKey: '' },
        ],
      };
    case 'featured_aside_card':
      return { title: '', body: '', ctaLabel: '', ctaHref: '' };
    case 'metrics_stat':
      return { kicker: '', value: '', caption: '' };
    case 'muestra_intro':
      return { kicker: '', title: '', body: '' };
    case 'archive_label':
      return { kicker: '' };
    case 'editorial_footer':
      return {
        kicker: '', title: '', body: '',
        links: [{ label: '', href: '' }, { label: '', href: '' }, { label: '', href: '' }],
        asideTitle: '', asideBody: '', asideCtaLabel: '', copyright: '', edition: '',
      };
    case 'home_value_props':
      return {
        cards: [
          { title: '', body: '', imageUrl: '' },
          { title: '', body: '', imageUrl: '' },
          { title: '', body: '', imageUrl: '' },
        ],
      };
    case 'home_section_header':
      return { slot: '', kicker: '', title: '', subtitle: '', ctaLabel: '', ctaHref: '', imageUrl: '', imageAlt: '' };
    case 'home_block':
      return { slot: '', kicker: '', title: '', body: '', ctaLabel: '', ctaHref: '', imageUrl: '', variant: 'light' };
    case 'home_hero_carousel':
      return {
        description: '', tagline: '', primaryCtaLabel: '', primaryCtaHref: '',
        secondaryCtaLabel: '', secondaryCtaHref: '', autoplaySeconds: 6,
        slides: [{ title: '', subtitle: '', imageUrl: '', imageAlt: '', origin: '', quote: '' }],
      };
    case 'content_pick':
      return { slot: '', targetType: 'collection', slug: '', label: '', ctaLabel: '', variant: 'banner', overrideTitle: '', overrideExcerpt: '', overrideImageUrl: '' };
    case 'embedded_widget':
      return { widget: 'categories_grid', kicker: '', title: '', subtitle: '', ctaLabel: '', ctaHref: '' };
    default:
      return {};
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CmsAdminPage() {
  const [pageKey, setPageKey] = useState('tecnicas');
  const {
    sections, loading, saving,
    fetchSections, createSection, updateSection, deleteSection, reorderSections,
  } = useCmsAdmin();

  useEffect(() => { fetchSections(pageKey); }, [pageKey, fetchSections]);

  const ordered = useMemo(
    () => [...sections].sort((a, b) => a.position - b.position),
    [sections],
  );

  const move = async (id: string, dir: -1 | 1) => {
    const idx = ordered.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    const next = ordered.slice();
    [next[idx], next[swap]] = [next[swap], next[idx]];
    await reorderSections(pageKey, next.map((s) => s.id));
  };

  const currentPageLabel = PAGE_KEYS.find(p => p.key === pageKey)?.label ?? pageKey;

  return (
    <div style={{
      backgroundColor: '#f9f7f2',
      backgroundImage: `
        radial-gradient(circle at top left,  rgba(236,109,19,0.10) 0%, transparent 40%),
        radial-gradient(circle at bottom right, rgba(253,186,116,0.12) 0%, transparent 44%),
        radial-gradient(circle at top right, rgba(255,244,223,0.8) 0%, transparent 36%)
      `,
      backgroundAttachment: 'fixed',
      fontFamily: SANS,
      minHeight: '100vh',
    }}>

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 px-8 py-4" style={{
        background: 'rgba(249,247,242,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(84,67,62,0.08)',
      }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Left: title + breadcrumb */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(236,109,19,0.14) 0%, rgba(156,63,0,0.1) 100%)`,
              border: '1px solid rgba(236,109,19,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: ORANGE }}>database</span>
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>
                CMS
              </p>
              <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(84,67,62,0.5)', marginTop: 1, letterSpacing: '0.05em' }}>
                Contenido editorial
              </p>
            </div>
          </div>

          {/* Right: page selector + add button */}
          <div className="flex items-center gap-3">
            {/* Page selector styled */}
            <div className="relative">
              <Select value={pageKey} onValueChange={setPageKey}>
                <SelectTrigger
                  className="h-8 gap-2 border-0 shadow-none bg-transparent"
                  style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: ORANGE_MID, letterSpacing: '0.05em' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: ORANGE }}>pages</span>
                  <SelectValue />
                  <ChevronDown style={{ width: 12, height: 12, color: ORANGE }} />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_KEYS.map((p) => (
                    <SelectItem key={p.key} value={p.key} style={{ fontFamily: SANS, fontSize: 12 }}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div style={{ width: 1, height: 20, background: 'rgba(84,67,62,0.12)' }} />

            <NewSectionButton
              onCreate={async (type) => {
                const created = await createSection({ pageKey, type, payload: emptyPayloadFor(type), published: false });
                return !!created;
              }}
              disabled={saving}
            />
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-4">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: ORANGE, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ ...lc(0.45), fontSize: 10 }}>{currentPageLabel}</span>
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(236,109,19,0.1)' }} />
          {!loading && (
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'rgba(84,67,62,0.4)', letterSpacing: '0.1em' }}>
              {ordered.length} {ordered.length === 1 ? 'SECCIÓN' : 'SECCIONES'}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ ...glass, padding: 48, textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'rgba(236,109,19,0.3)', display: 'block', marginBottom: 12 }}>hourglass_empty</span>
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.5)' }}>Cargando secciones…</p>
          </div>
        ) : ordered.length === 0 ? (
          <div style={{ ...glass, padding: 48, textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'rgba(236,109,19,0.25)', display: 'block', marginBottom: 16 }}>article</span>
            <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', marginBottom: 6 }}>Sin secciones aún</p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.5)' }}>
              Crea la primera con el botón "Nueva sección".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ordered.map((section, idx) => (
              <SectionCard
                key={section.id}
                section={section}
                isFirst={idx === 0}
                isLast={idx === ordered.length - 1}
                saving={saving}
                onMoveUp={() => move(section.id, -1)}
                onMoveDown={() => move(section.id, 1)}
                onTogglePublish={() => updateSection(section.id, { published: !section.published })}
                onSavePayload={(payload) => updateSection(section.id, { payload })}
                onDelete={async () => { await deleteSection(section.id); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Nueva sección ────────────────────────────────────────────────────────────
function NewSectionButton({
  onCreate,
  disabled,
}: {
  onCreate: (type: CmsSectionType) => Promise<boolean>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CmsSectionType>('hero');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20,
            background: ORANGE, color: 'white', border: 'none', cursor: 'pointer',
            fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Plus style={{ width: 13, height: 13 }} />
          Nueva sección
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: SERIF }}>Crear sección</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest">Tipo de sección</Label>
          <Select value={type} onValueChange={(v) => setType(v as CmsSectionType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            style={{ background: ORANGE, borderColor: ORANGE }}
            onClick={async () => {
              const ok = await onCreate(type);
              if (ok) setOpen(false);
            }}
          >
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  section: CmsSection;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublish: () => void;
  onSavePayload: (payload: Record<string, any>) => Promise<unknown>;
  onDelete: () => void;
}

function SectionCard({
  section, isFirst, isLast, saving,
  onMoveUp, onMoveDown, onTogglePublish, onSavePayload, onDelete,
}: SectionCardProps) {
  const [draft, setDraft] = useState<Record<string, any>>(section.payload);
  const [dirty, setDirty] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDraft(section.payload);
    setDirty(false);
  }, [section.id, section.updatedAt, section.payload]);

  const setField = (key: string, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const setNested = (path: (string | number)[], value: any) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      let cur: any = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = value;
      return next;
    });
    setDirty(true);
  };

  return (
    <div style={{ ...glass, overflow: 'hidden' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 cursor-pointer select-none"
        style={{ padding: '14px 20px', borderBottom: expanded ? '1px solid rgba(236,109,19,0.08)' : 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Position */}
          <span style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 800, color: 'rgba(84,67,62,0.35)',
            letterSpacing: '0.1em', width: 20, flexShrink: 0,
          }}>
            #{section.position + 1}
          </span>

          {/* Type chip */}
          <span style={{
            fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: ORANGE_MID,
            background: 'rgba(236,109,19,0.08)', border: '1px solid rgba(236,109,19,0.2)',
            borderRadius: 8, padding: '2px 8px', flexShrink: 0,
          }}>
            {section.type}
          </span>

          {/* Summary */}
          <span style={{
            fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {summaryForSection(section)}
          </span>

          {/* Dirty indicator */}
          {dirty && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: ORANGE, flexShrink: 0,
            }} title="Cambios sin guardar" />
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {/* Published badge */}
          <span style={{
            fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '2px 8px', borderRadius: 8,
            background: section.published ? 'rgba(21,128,61,0.08)' : 'rgba(84,67,62,0.06)',
            color: section.published ? '#15803d' : 'rgba(84,67,62,0.5)',
            border: `1px solid ${section.published ? 'rgba(21,128,61,0.2)' : 'rgba(84,67,62,0.12)'}`,
          }}>
            {section.published ? 'Publicada' : 'Borrador'}
          </span>

          {/* Move up/down */}
          <IconBtn onClick={onMoveUp} disabled={isFirst || saving} title="Subir">
            <ArrowUp style={{ width: 13, height: 13 }} />
          </IconBtn>
          <IconBtn onClick={onMoveDown} disabled={isLast || saving} title="Bajar">
            <ArrowDown style={{ width: 13, height: 13 }} />
          </IconBtn>

          {/* Publish toggle */}
          <IconBtn onClick={onTogglePublish} title={section.published ? 'Despublicar' : 'Publicar'}>
            {section.published
              ? <EyeOff style={{ width: 13, height: 13 }} />
              : <Eye style={{ width: 13, height: 13 }} />}
          </IconBtn>

          {/* Delete */}
          <IconBtn onClick={onDelete} title="Eliminar" danger>
            <Trash2 style={{ width: 13, height: 13 }} />
          </IconBtn>

          {/* Expand chevron */}
          <IconBtn onClick={() => setExpanded(e => !e)} title={expanded ? 'Contraer' : 'Expandir'}>
            <ChevronDown style={{ width: 13, height: 13, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </IconBtn>
        </div>
      </div>

      {/* Body (form fields) */}
      {expanded && (
        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.5)' }}>
          <div className="space-y-4">
            {section.type === 'hero'               && <HeroForm draft={draft} setField={setField} />}
            {section.type === 'quote'              && <QuoteForm draft={draft} setField={setField} />}
            {section.type === 'two_column_intro'   && <TwoColumnIntroForm draft={draft} setField={setField} setNested={setNested} />}
            {section.type === 'technique_grid'     && <TechniqueGridForm draft={draft} setField={setField} setNested={setNested} />}
            {section.type === 'featured_aside_card'&& <FeaturedAsideCardForm draft={draft} setField={setField} />}
            {section.type === 'metrics_stat'       && <MetricsStatForm draft={draft} setField={setField} />}
            {section.type === 'muestra_intro'      && <MuestraIntroForm draft={draft} setField={setField} />}
            {section.type === 'archive_label'      && <ArchiveLabelForm draft={draft} setField={setField} />}
            {section.type === 'editorial_footer'   && <EditorialFooterForm draft={draft} setField={setField} setNested={setNested} />}
            {section.type === 'home_value_props'   && <HomeValuePropsForm draft={draft} setNested={setNested} />}
            {section.type === 'home_section_header'&& <HomeSectionHeaderForm draft={draft} setField={setField} />}
            {section.type === 'home_block'         && <HomeBlockForm draft={draft} setField={setField} />}
            {section.type === 'home_hero_carousel' && <HomeHeroCarouselForm draft={draft} setField={setField} setNested={setNested} setDraft={setDraft} />}
            {section.type === 'content_pick'       && <ContentPickForm draft={draft} setField={setField} />}
            {section.type === 'embedded_widget'    && <EmbeddedWidgetForm draft={draft} setField={setField} />}
            {!['hero','quote','two_column_intro','technique_grid','featured_aside_card','metrics_stat',
               'muestra_intro','archive_label','editorial_footer','home_value_props','home_section_header',
               'home_block','home_hero_carousel','content_pick','embedded_widget'].includes(section.type) && (
              <RawJsonForm draft={draft} onChange={(v) => { setDraft(v); setDirty(true); }} />
            )}

            {/* Footer bar */}
            <div className="flex items-center justify-between pt-3"
              style={{ borderTop: '1px solid rgba(236,109,19,0.08)', marginTop: 8 }}>
              <div className="flex items-center gap-2">
                <Switch
                  checked={section.published}
                  onCheckedChange={onTogglePublish}
                  id={`pub-${section.id}`}
                />
                <label htmlFor={`pub-${section.id}`} style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(84,67,62,0.6)', cursor: 'pointer' }}>
                  Publicada
                </label>
              </div>
              <button
                disabled={!dirty || saving}
                onClick={async () => { await onSavePayload(draft); setDirty(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20,
                  background: dirty ? ORANGE : 'rgba(84,67,62,0.06)',
                  color: dirty ? 'white' : 'rgba(84,67,62,0.35)',
                  border: 'none', cursor: dirty ? 'pointer' : 'not-allowed',
                  fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  transition: 'all 0.15s',
                }}
              >
                <Save style={{ width: 12, height: 12 }} />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Icon button helper ───────────────────────────────────────────────────────
function IconBtn({ onClick, disabled, title, danger, children }: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 8, border: 'none',
        background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'rgba(84,67,62,0.2)' : danger ? '#dc2626' : 'rgba(84,67,62,0.5)',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = danger ? 'rgba(220,38,38,0.06)' : 'rgba(84,67,62,0.06)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

// ─── Summary helper ───────────────────────────────────────────────────────────
function summaryForSection(s: CmsSection): string {
  const p = s.payload ?? {};
  return p.title || p.kicker || p.body?.slice?.(0, 60) || `Sección ${s.id.slice(0, 6)}`;
}

