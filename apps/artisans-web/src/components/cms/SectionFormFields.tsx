/**
 * SectionFormFields — Shared form sub-components for the CMS section editor.
 *
 * All form components, design tokens, and metadata are exported here so they
 * can be used by CmsAdminPage and any future CMS editor pages.
 */

import { useEffect, useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploadField } from '@/components/cms/ImageUploadField';
import { SANS } from '@/components/dashboard/dashboardStyles';

// ─── Design tokens ────────────────────────────────────────────────────────────
export const ORANGE     = '#ec6d13';
export const ORANGE_MID = '#c45a0a';

// ─── Section type metadata ────────────────────────────────────────────────────
export const SECTION_TYPE_META: Record<string, { icon: string; label: string; description: string }> = {
  hero:                { icon: 'panorama',          label: 'Hero',               description: 'Kicker + título + cuerpo principal' },
  hero_split:          { icon: 'splitscreen',        label: 'Hero Split',         description: 'Título + subtítulo a la izquierda + imagen a la derecha' },
  quote:               { icon: 'format_quote',       label: 'Cita',               description: 'Cita destacada con atribución' },
  two_column_intro:    { icon: 'view_column',        label: 'Dos columnas',        description: 'Intro dividida en 2 columnas' },
  technique_grid:      { icon: 'grid_view',          label: 'Grilla técnicas',     description: 'Grid de 4 cards de técnica' },
  featured_aside_card: { icon: 'featured_play_list', label: 'Card lateral',        description: 'Card del Archivo Digital' },
  metrics_stat:        { icon: 'bar_chart',          label: 'Métrica',            description: 'Número destacado con caption' },
  muestra_intro:       { icon: 'article',            label: 'Intro muestra',       description: 'Kicker + título + cuerpo de muestra' },
  archive_label:       { icon: 'label',              label: 'Etiqueta',           description: 'Label centrado de archivo' },
  editorial_footer:    { icon: 'bottom_navigation',  label: 'Footer editorial',    description: 'Footer con links y copyright' },
  home_value_props:    { icon: 'view_carousel',      label: 'Value props',         description: '3 cards de propuesta de valor' },
  home_section_header: { icon: 'space_dashboard',    label: 'Header de sección',   description: 'Cabecera de sección del home' },
  home_block:          { icon: 'view_stream',        label: 'Block',              description: 'Bloque con variante visual' },
  home_hero_carousel:  { icon: 'auto_stories',       label: 'Hero carousel',       description: 'Carousel principal del home' },
  content_pick:        { icon: 'link',               label: 'Content pick',        description: 'Banner/card apuntando a contenido' },
  embedded_widget:     { icon: 'widgets',            label: 'Widget',             description: 'Widget embebido (categ., productos…)' },
};

// ─── Sub-card helpers (wizard glass-morphism style) ───────────────────────────
function SubCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-4 space-y-3 ${className ?? ''}`}
      style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.65)' }}
    >
      {children}
    </div>
  );
}

function SubCardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-[800] uppercase tracking-widest mb-1.5" style={{ color: ORANGE_MID }}>
      {children}
    </p>
  );
}

// ─── Icon button helper (used internally by HomeHeroCarouselForm) ─────────────
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
      className={[
        'flex items-center justify-center w-7 h-7 rounded-lg bg-transparent border-none transition-colors',
        disabled ? 'cursor-not-allowed opacity-20' : 'cursor-pointer',
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-[#54433e]/50 hover:bg-[#54433e]/[0.06]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── Shared field components ──────────────────────────────────────────────────
const fieldInput = [
  'w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5',
  'text-[13px] font-[500] text-[#151b2d] placeholder:text-[#151b2d]/30',
  'focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10',
  'hover:border-[#e2d5cf]/70 transition-all',
].join(' ');

const fieldLabel = "font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-1.5";

export function FieldText({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldInput}
        style={{ background: 'rgba(247,244,239,0.4)' }}
      />
    </div>
  );
}

export function FieldArea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={[fieldInput, 'resize-none leading-relaxed'].join(' ')}
        style={{ background: 'rgba(247,244,239,0.4)' }}
      />
    </div>
  );
}

// ─── Form sub-components ──────────────────────────────────────────────────────
export function HeroForm({ draft, setField }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldText label="Subtítulo" value={draft.subtitle} onChange={(v) => setField('subtitle', v)} />
      <FieldText label="Etiqueta del contador" value={draft.totalCountLabel} onChange={(v) => setField('totalCountLabel', v)} placeholder="Técnicas Documentadas" />
      <div className="md:col-span-2">
        <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={4} />
      </div>
    </div>
  );
}

export function HeroSplitForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Kicker (opcional)" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Geografía Humana" />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} placeholder="Título grande del hero" />
      <FieldText label="Subtítulo (itálica)" value={draft.subtitle} onChange={(v) => setField('subtitle', v)} placeholder="Subtítulo en serif itálica" />
      <FieldArea label="Cuerpo (opcional)" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />

      <ImageUploadField
        label="Imagen del hero"
        value={draft.imageUrl ?? ''}
        onChange={(v) => setField('imageUrl', v)}
        altValue={draft.imageAlt ?? ''}
        onAltChange={(v) => setField('imageAlt', v)}
      />

      <FieldText label="Lado de la imagen (right / left)" value={draft.imageSide} onChange={(v) => setField('imageSide', v)} placeholder="right" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldText label="CTA label (opcional)" value={draft.ctaLabel} onChange={(v) => setField('ctaLabel', v)} placeholder="Explorar" />
        <FieldText label="CTA href" value={draft.ctaHref} onChange={(v) => setField('ctaHref', v)} placeholder="/productos" />
      </div>
    </div>
  );
}

export function QuoteForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldArea label="Cita" value={draft.body} onChange={(v) => setField('body', v)} rows={4} />
      <FieldText label="Atribución" value={draft.attribution} onChange={(v) => setField('attribution', v)} />
    </div>
  );
}

export function TwoColumnIntroForm({ draft, setField, setNested }: any) {
  const cols = draft.columns ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <SubCard key={i}>
            <SubCardLabel>Columna {i + 1}</SubCardLabel>
            <FieldText label="Kicker" value={cols[i]?.kicker ?? ''} onChange={(v) => setNested(['columns', i, 'kicker'], v)} />
            <FieldText label="Título" value={cols[i]?.title ?? ''} onChange={(v) => setNested(['columns', i, 'title'], v)} />
            <FieldArea label="Cuerpo" value={cols[i]?.body ?? ''} onChange={(v) => setNested(['columns', i, 'body'], v)} />
          </SubCard>
        ))}
      </div>
    </div>
  );
}

export function TechniqueGridForm({ draft, setField, setNested }: any) {
  const cards = draft.cards ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card: any, i: number) => (
          <SubCard key={i}>
            <SubCardLabel>Card {i + 1}</SubCardLabel>
            <FieldText label="Título" value={card.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
            <FieldArea label="Cuerpo" value={card.body ?? ''} onChange={(v) => setNested(['cards', i, 'body'], v)} />
            <FieldText label="Slug (opcional)" value={card.slug ?? ''} onChange={(v) => setNested(['cards', i, 'slug'], v)} placeholder="tallado, calado…" />
            <FieldText label="Image key (técnica)" value={card.imageKey ?? ''} onChange={(v) => setNested(['cards', i, 'imageKey'], v)} placeholder="Tallado" />
          </SubCard>
        ))}
      </div>
    </div>
  );
}

export function FeaturedAsideCardForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
      <FieldText label="Texto del CTA" value={draft.ctaLabel} onChange={(v) => setField('ctaLabel', v)} placeholder="Ver Catálogo" />
      <FieldText label="Link del CTA (opcional)" value={draft.ctaHref} onChange={(v) => setField('ctaHref', v)} placeholder="/catalogo" />
    </div>
  );
}

export function MetricsStatForm({ draft, setField }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Métricas 2024" />
      <FieldText label="Valor" value={draft.value} onChange={(v) => setField('value', v)} placeholder="24" />
      <div className="md:col-span-3">
        <FieldArea label="Caption" value={draft.caption} onChange={(v) => setField('caption', v)} rows={2} />
      </div>
    </div>
  );
}

export function MuestraIntroForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
    </div>
  );
}

export function ArchiveLabelForm({ draft, setField }: any) {
  return (
    <FieldText label="Etiqueta (kicker centrado)" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Exploración del Archivo" />
  );
}

export function EditorialFooterForm({ draft, setField, setNested }: any) {
  const links = draft.links ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
      <div>
        <label className={fieldLabel}>Links</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <SubCard key={i} className="!p-3 !space-y-2">
              <FieldText label={`Link ${i + 1}`} value={links[i]?.label ?? ''} onChange={(v) => setNested(['links', i, 'label'], v)} />
              <FieldText label="href" value={links[i]?.href ?? ''} onChange={(v) => setNested(['links', i, 'href'], v)} placeholder="/historias" />
            </SubCard>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldText label="Aside — Título" value={draft.asideTitle} onChange={(v) => setField('asideTitle', v)} />
        <FieldText label="Aside — CTA" value={draft.asideCtaLabel} onChange={(v) => setField('asideCtaLabel', v)} />
        <div className="md:col-span-2">
          <FieldArea label="Aside — Cuerpo" value={draft.asideBody} onChange={(v) => setField('asideBody', v)} rows={3} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldText label="Copyright" value={draft.copyright} onChange={(v) => setField('copyright', v)} placeholder="TELAR © 2025 · Colombia" />
        <FieldText label="Edición" value={draft.edition} onChange={(v) => setField('edition', v)} placeholder="Edición 01: El gesto primordial" />
      </div>
    </div>
  );
}

export function HomeValuePropsForm({ draft, setNested }: any) {
  const cards = draft.cards ?? [];
  return (
    <div className="space-y-4">
      <label className={fieldLabel}>Cards (3)</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SubCard key={i}>
            <SubCardLabel>Card {i + 1}</SubCardLabel>
            <FieldText label="Título" value={cards[i]?.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
            <FieldArea label="Cuerpo" value={cards[i]?.body ?? ''} onChange={(v) => setNested(['cards', i, 'body'], v)} rows={3} />
            <ImageUploadField
              label="Imagen (opcional)"
              value={cards[i]?.imageUrl ?? ''}
              onChange={(v) => setNested(['cards', i, 'imageUrl'], v)}
              previewAspect="1/1"
            />
          </SubCard>
        ))}
      </div>
    </div>
  );
}

export function HomeSectionHeaderForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Slot (categories | featured_products | colecciones_header | …)" value={draft.slot ?? ''} onChange={(v) => setField('slot', v)} placeholder="featured_products" />
      <FieldText label="Kicker" value={draft.kicker ?? ''} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title ?? ''} onChange={(v) => setField('title', v)} />
      <FieldText label="Subtítulo" value={draft.subtitle ?? ''} onChange={(v) => setField('subtitle', v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldText label="CTA texto" value={draft.ctaLabel ?? ''} onChange={(v) => setField('ctaLabel', v)} />
        <FieldText label="CTA href" value={draft.ctaHref ?? ''} onChange={(v) => setField('ctaHref', v)} />
      </div>
      <ImageUploadField
        label="Imagen del hero (opcional, slot 'colecciones_header')"
        value={draft.imageUrl ?? ''}
        onChange={(v) => setField('imageUrl', v)}
        altValue={draft.imageAlt ?? ''}
        onAltChange={(v) => setField('imageAlt', v)}
      />
    </div>
  );
}

export function EmbeddedWidgetForm({ draft, setField }: any) {
  const widget = draft.widget ?? 'categories_grid';
  const supportsHeader = widget === 'categories_grid' || widget === 'featured_products';
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className={fieldLabel}>Widget</label>
        <Select value={widget} onValueChange={(v) => setField('widget', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="categories_grid">Grid de categorías (8 cards)</SelectItem>
            <SelectItem value="featured_products">Productos destacados (3 cards)</SelectItem>
            <SelectItem value="huella_digital">Huella digital (texto + imagen)</SelectItem>
            <SelectItem value="featured_shop">Taller del mes</SelectItem>
            <SelectItem value="regalos_con_historia">Regalos con historia</SelectItem>
            <SelectItem value="colecciones_overview">Overview de colecciones (3 cards)</SelectItem>
            <SelectItem value="aliados">Aliados</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Cápsula hardcoded con su propia data. El payload solo puede pasar copy de header.
        </p>
      </div>
      {supportsHeader && (
        <>
          <FieldText label="Kicker (opcional)" value={draft.kicker ?? ''} onChange={(v) => setField('kicker', v)} />
          <FieldText label="Título (opcional)" value={draft.title ?? ''} onChange={(v) => setField('title', v)} />
          <FieldText label="Subtítulo (opcional)" value={draft.subtitle ?? ''} onChange={(v) => setField('subtitle', v)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldText label="CTA texto" value={draft.ctaLabel ?? ''} onChange={(v) => setField('ctaLabel', v)} />
            <FieldText label="CTA href" value={draft.ctaHref ?? ''} onChange={(v) => setField('ctaHref', v)} />
          </div>
        </>
      )}
    </div>
  );
}

export function ContentPickForm({ draft, setField }: any) {
  const isBlog = draft.targetType === 'blog';
  return (
    <div className="space-y-4">
      <FieldText
        label="Slot (identificador único — ej. home_pick_1, colecciones_pick_featured)"
        value={draft.slot ?? ''}
        onChange={(v) => setField('slot', v)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={fieldLabel}>Tipo de destino</label>
          <Select value={draft.targetType ?? 'collection'} onValueChange={(v) => setField('targetType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="collection">Colección</SelectItem>
              <SelectItem value="blog">Blog post</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className={fieldLabel}>Variante visual</label>
          <Select value={draft.variant ?? 'banner'} onValueChange={(v) => setField('variant', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner (full-width oscuro)</SelectItem>
              <SelectItem value="card">Card (con cover arriba)</SelectItem>
              <SelectItem value="inline">Inline (lista compacta)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <FieldText
        label={isBlog ? 'Slug del blog post' : 'Slug de la colección'}
        value={draft.slug ?? ''}
        onChange={(v) => setField('slug', v)}
        placeholder={isBlog ? 'cauca-seda-paz' : 'dia-de-la-madre'}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldText label="Label / pill (ej. Editorial)" value={draft.label ?? ''} onChange={(v) => setField('label', v)} />
        <FieldText label={`CTA texto (default: ${isBlog ? 'Leer historia' : 'Ver colección'})`} value={draft.ctaLabel ?? ''} onChange={(v) => setField('ctaLabel', v)} />
      </div>
      <div className="border-t border-[#ec6d13]/[0.08] pt-3">
        <p className="text-xs text-muted-foreground mb-3">
          Overrides opcionales — pisan los datos del doc referenciado.
        </p>
        <FieldText label="Override título" value={draft.overrideTitle ?? ''} onChange={(v) => setField('overrideTitle', v)} />
        <FieldArea label="Override excerpt" value={draft.overrideExcerpt ?? ''} onChange={(v) => setField('overrideExcerpt', v)} rows={2} />
        <ImageUploadField
          label="Override imagen"
          value={draft.overrideImageUrl ?? ''}
          onChange={(v) => setField('overrideImageUrl', v)}
        />
      </div>
    </div>
  );
}

export function HomeBlockForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Slot (marketplace_diferente | comercio_justo | …)" value={draft.slot ?? ''} onChange={(v) => setField('slot', v)} />
      <div className="space-y-1.5">
        <label className={fieldLabel}>Variante</label>
        <Select value={draft.variant ?? 'light'} onValueChange={(v) => setField('variant', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Oscuro (fondo negro)</SelectItem>
            <SelectItem value="cream">Crema (con imagen)</SelectItem>
            <SelectItem value="bordered">Bordeado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FieldText label="Kicker" value={draft.kicker ?? ''} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title ?? ''} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body ?? ''} onChange={(v) => setField('body', v)} rows={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldText label="CTA texto" value={draft.ctaLabel ?? ''} onChange={(v) => setField('ctaLabel', v)} />
        <FieldText label="CTA href" value={draft.ctaHref ?? ''} onChange={(v) => setField('ctaHref', v)} />
      </div>
      <ImageUploadField
        label="Imagen (opcional, se muestra en variant cream/bordered)"
        value={draft.imageUrl ?? ''}
        onChange={(v) => setField('imageUrl', v)}
      />
    </div>
  );
}

export function HomeHeroCarouselForm({ draft, setField, setNested, setDraft }: any) {
  const slides: any[] = Array.isArray(draft.slides) ? draft.slides : [];

  const addSlide = () => {
    setDraft((prev: any) => ({
      ...prev,
      slides: [...(prev.slides ?? []), { title: '', subtitle: '', imageUrl: '', imageAlt: '', origin: '', quote: '' }],
    }));
  };

  const removeSlide = (i: number) => {
    setDraft((prev: any) => ({ ...prev, slides: (prev.slides ?? []).filter((_: any, idx: number) => idx !== i) }));
  };

  const moveSlide = (i: number, dir: -1 | 1) => {
    setDraft((prev: any) => {
      const arr = [...(prev.slides ?? [])];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...prev, slides: arr };
    });
  };

  return (
    <div className="space-y-6">
      <SubCard>
        <SubCardLabel>Contenido compartido (todas las slides)</SubCardLabel>
        <FieldArea label="Descripción (párrafo)" value={draft.description ?? ''} onChange={(v) => setField('description', v)} rows={2} />
        <FieldText label="Tagline (UPPERCASE)" value={draft.tagline ?? ''} onChange={(v) => setField('tagline', v)} placeholder="Hecho a mano por talleres..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldText label="CTA primario — texto" value={draft.primaryCtaLabel ?? ''} onChange={(v) => setField('primaryCtaLabel', v)} placeholder="Explorar Piezas" />
          <FieldText label="CTA primario — link" value={draft.primaryCtaHref ?? ''} onChange={(v) => setField('primaryCtaHref', v)} placeholder="/productos" />
          <FieldText label="CTA secundario — texto" value={draft.secondaryCtaLabel ?? ''} onChange={(v) => setField('secondaryCtaLabel', v)} placeholder="Conocer Talleres" />
          <FieldText label="CTA secundario — link" value={draft.secondaryCtaHref ?? ''} onChange={(v) => setField('secondaryCtaHref', v)} placeholder="/tiendas" />
        </div>
        <div className="max-w-xs">
          <label className={fieldLabel}>Autoplay (seg)</label>
          <input
            type="number" min={2} max={30}
            value={draft.autoplaySeconds ?? 6}
            onChange={(e) => setField('autoplaySeconds', parseInt(e.target.value, 10) || 6)}
            className={fieldInput}
            style={{ background: 'rgba(247,244,239,0.4)' }}
          />
        </div>
      </SubCard>

      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-[#151b2d]">Slides ({slides.length})</p>
        <button
          type="button"
          onClick={addSlide}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border bg-[#ec6d13]/[0.08] text-[#c45a0a] border-[#ec6d13]/20 hover:bg-[#ec6d13]/[0.15] transition-colors"
        >
          <Plus className="w-3 h-3" /> Añadir slide
        </button>
      </div>

      <div className="space-y-3">
        {slides.map((slide, i) => (
          <SubCard key={i}>
            <div className="flex items-center justify-between">
              <SubCardLabel>Slide #{i + 1}</SubCardLabel>
              <div className="flex items-center gap-1">
                <IconBtn disabled={i === 0} onClick={() => moveSlide(i, -1)} title="Subir"><ArrowUp className="w-3 h-3" /></IconBtn>
                <IconBtn disabled={i === slides.length - 1} onClick={() => moveSlide(i, 1)} title="Bajar"><ArrowDown className="w-3 h-3" /></IconBtn>
                <IconBtn onClick={() => removeSlide(i)} danger title="Eliminar"><Trash2 className="w-3 h-3" /></IconBtn>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldText label="Título" value={slide.title ?? ''} onChange={(v) => setNested(['slides', i, 'title'], v)} placeholder="HISTORIAS HECHAS" />
              <FieldText label="Subtítulo (cursiva color primario)" value={slide.subtitle ?? ''} onChange={(v) => setNested(['slides', i, 'subtitle'], v)} placeholder="A MANO" />
              <FieldText label="Origen" value={slide.origin ?? ''} onChange={(v) => setNested(['slides', i, 'origin'], v)} placeholder="Nariño, Colombia" />
              <FieldText label="Quote" value={slide.quote ?? ''} onChange={(v) => setNested(['slides', i, 'quote'], v)} placeholder="Cada puntada..." />
            </div>
            <ImageUploadField
              label="Imagen del slide"
              value={slide.imageUrl ?? ''}
              onChange={(v) => setNested(['slides', i, 'imageUrl'], v)}
              altValue={slide.imageAlt ?? ''}
              onAltChange={(v) => setNested(['slides', i, 'imageAlt'], v)}
              previewAspect="4/3"
            />
          </SubCard>
        ))}
        {slides.length === 0 && (
          <p className="text-[12px] text-[#54433e]/40">
            No hay slides. Añade al menos uno.
          </p>
        )}
      </div>
    </div>
  );
}

export function TerritoriosHeroForm({ draft, setField, setNested }: any) {
  const stats = draft.stats ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Geografía Humana" />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} placeholder="El mapa de nuestros hilos" />
      <FieldArea label="Cuerpo / cita" value={draft.body} onChange={(v) => setField('body', v)} rows={4} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SubCard key={i}>
            <SubCardLabel>Stat {i + 1}</SubCardLabel>
            <FieldText label="Valor" value={stats[i]?.value ?? ''} onChange={(v) => setNested(['stats', i, 'value'], v)} placeholder="+120" />
            <FieldText label="Label" value={stats[i]?.label ?? ''} onChange={(v) => setNested(['stats', i, 'label'], v)} placeholder="Talleres" />
          </SubCard>
        ))}
      </div>
    </div>
  );
}

export function TerritoriosDarkQuoteForm({ draft, setField, setNested }: any) {
  const leftStats = draft.leftStats ?? [];
  return (
    <div className="space-y-4">
      <FieldArea label="Cita principal" value={draft.quote} onChange={(v) => setField('quote', v)} rows={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <SubCard key={i}>
            <SubCardLabel>Stat {i + 1}</SubCardLabel>
            <FieldText label="Valor" value={leftStats[i]?.value ?? ''} onChange={(v) => setNested(['leftStats', i, 'value'], v)} placeholder="+120" />
            <FieldText label="Caption" value={leftStats[i]?.caption ?? ''} onChange={(v) => setNested(['leftStats', i, 'caption'], v)} placeholder="Talleres en el Pacífico" />
            <FieldText label="Color (hex)" value={leftStats[i]?.color ?? ''} onChange={(v) => setNested(['leftStats', i, 'color'], v)} placeholder="#ec6d13" />
          </SubCard>
        ))}
      </div>
      <FieldText label="Título panel derecho" value={draft.rightTitle} onChange={(v) => setField('rightTitle', v)} placeholder="El rastro de la fibra" />
      <FieldArea label="Cuerpo panel derecho" value={draft.rightBody} onChange={(v) => setField('rightBody', v)} rows={3} />
    </div>
  );
}

export function AboutHeroForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="URL imagen de fondo" value={draft.bgImageUrl} onChange={(v) => setField('bgImageUrl', v)} placeholder="https://..." />
      <FieldText label="Alt imagen de fondo" value={draft.bgImageAlt} onChange={(v) => setField('bgImageAlt', v)} />
      <FieldText label="Object position (CSS)" value={draft.bgObjectPosition} onChange={(v) => setField('bgObjectPosition', v)} placeholder="center 30%" />
      <FieldText label="Título línea 1" value={draft.titleLineTop} onChange={(v) => setField('titleLineTop', v)} placeholder="TELAR ES EL" />
      <FieldText label="Título línea 2 (itálica/naranja)" value={draft.titleLineItalic} onChange={(v) => setField('titleLineItalic', v)} placeholder="PUENTE DIGITAL" />
      <FieldText label="Título línea 3 (opcional)" value={draft.titleLineBottom} onChange={(v) => setField('titleLineBottom', v)} placeholder="DE LA ARTESANÍA" />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={4} />
    </div>
  );
}

export function AboutTwoColForm({ draft, setField, setDraft }: any) {
  const paragraphs: string[] = Array.isArray(draft.paragraphs) ? draft.paragraphs : [];
  const bullets: string[] = Array.isArray(draft.bullets) ? draft.bullets : [];
  const setArr = (key: 'paragraphs' | 'bullets', i: number, value: string) => {
    setDraft((prev: any) => {
      const next = { ...prev, [key]: [...(prev[key] ?? [])] };
      next[key][i] = value;
      return next;
    });
  };
  const addItem = (key: 'paragraphs' | 'bullets') =>
    setDraft((prev: any) => ({ ...prev, [key]: [...(prev[key] ?? []), ''] }));
  const removeItem = (key: 'paragraphs' | 'bullets', i: number) =>
    setDraft((prev: any) => ({ ...prev, [key]: (prev[key] ?? []).filter((_: any, idx: number) => idx !== i) }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldText label="Lado de la imagen (left / right)" value={draft.imageSide} onChange={(v) => setField('imageSide', v)} placeholder="right" />
        <FieldText label="Icono (Heart / TrendingUp / Sparkles)" value={draft.iconName} onChange={(v) => setField('iconName', v)} />
      </div>
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Nuestro propósito" />
      <FieldText label="Título línea 1" value={draft.titleLineTop} onChange={(v) => setField('titleLineTop', v)} />
      <FieldText label="Título línea 2 (itálica)" value={draft.titleLineItalic} onChange={(v) => setField('titleLineItalic', v)} />
      <FieldArea label="Intro (opcional, sale antes de bullets)" value={draft.intro} onChange={(v) => setField('intro', v)} rows={2} />

      <div>
        <label className="text-xs uppercase tracking-widest font-bold">Párrafos</label>
        {paragraphs.map((para, i) => (
          <div key={i} className="flex gap-2 items-start mt-2">
            <Textarea rows={2} value={para} onChange={(e) => setArr('paragraphs', i, e.target.value)} className="flex-1" />
            <button type="button" className="text-xs text-destructive" onClick={() => removeItem('paragraphs', i)}>×</button>
          </div>
        ))}
        <button type="button" className="text-xs mt-2 underline" onClick={() => addItem('paragraphs')}>+ párrafo</button>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest font-bold">Bullets (opcional)</label>
        {bullets.map((b, i) => (
          <div key={i} className="flex gap-2 items-start mt-2">
            <input value={b} onChange={(e) => setArr('bullets', i, e.target.value)} className="flex-1 px-3 py-2 border rounded-md text-sm" />
            <button type="button" className="text-xs text-destructive" onClick={() => removeItem('bullets', i)}>×</button>
          </div>
        ))}
        <button type="button" className="text-xs mt-2 underline" onClick={() => addItem('bullets')}>+ bullet</button>
      </div>

      <FieldArea label="Outro (opcional, sale después de bullets)" value={draft.outro} onChange={(v) => setField('outro', v)} rows={2} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
        <FieldText label="URL imagen" value={draft.imageUrl} onChange={(v) => setField('imageUrl', v)} />
        <FieldText label="Alt imagen" value={draft.imageAlt} onChange={(v) => setField('imageAlt', v)} />
        <FieldText label="Stat valor (overlay)" value={draft.statValue} onChange={(v) => setField('statValue', v)} placeholder="1.500+" />
        <FieldText label="Stat label (overlay)" value={draft.statLabel} onChange={(v) => setField('statLabel', v)} placeholder="Artesanos conectados" />
        <FieldText label="Overlay kicker (alt)" value={draft.overlayKicker} onChange={(v) => setField('overlayKicker', v)} />
        <FieldText label="Overlay título itálica (alt)" value={draft.overlayTitle} onChange={(v) => setField('overlayTitle', v)} />
      </div>
    </div>
  );
}

export function AboutWideBlockForm({ draft, setField, setDraft }: any) {
  const paragraphs: string[] = Array.isArray(draft.paragraphs) ? draft.paragraphs : [];
  return (
    <div className="space-y-4">
      <FieldText label="Icono (TrendingUp / Heart / Sparkles)" value={draft.iconName} onChange={(v) => setField('iconName', v)} />
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título línea 1" value={draft.titleLineTop} onChange={(v) => setField('titleLineTop', v)} />
      <FieldText label="Título línea 2 (itálica)" value={draft.titleLineItalic} onChange={(v) => setField('titleLineItalic', v)} />
      <div>
        <label className="text-xs uppercase tracking-widest font-bold">Párrafos</label>
        {paragraphs.map((para, i) => (
          <div key={i} className="flex gap-2 items-start mt-2">
            <Textarea rows={3} value={para} onChange={(e) => setDraft((prev: any) => {
              const next = { ...prev, paragraphs: [...(prev.paragraphs ?? [])] };
              next.paragraphs[i] = e.target.value;
              return next;
            })} className="flex-1" />
            <button type="button" className="text-xs text-destructive" onClick={() => setDraft((prev: any) => ({ ...prev, paragraphs: (prev.paragraphs ?? []).filter((_: any, idx: number) => idx !== i) }))}>×</button>
          </div>
        ))}
        <button type="button" className="text-xs mt-2 underline" onClick={() => setDraft((prev: any) => ({ ...prev, paragraphs: [...(prev.paragraphs ?? []), ''] }))}>+ párrafo</button>
      </div>
    </div>
  );
}

export function AboutCtaForm({ draft, setField, setNested }: any) {
  const ctas = draft.ctas ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Título línea 1" value={draft.titleLineTop} onChange={(v) => setField('titleLineTop', v)} />
      <FieldText label="Título línea 2 (itálica)" value={draft.titleLineItalic} onChange={(v) => setField('titleLineItalic', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <SubCard key={i}>
            <SubCardLabel>CTA {i + 1}</SubCardLabel>
            <FieldText label="Label" value={ctas[i]?.label ?? ''} onChange={(v) => setNested(['ctas', i, 'label'], v)} />
            <FieldText label="Href" value={ctas[i]?.href ?? ''} onChange={(v) => setNested(['ctas', i, 'href'], v)} placeholder="/productos" />
            <FieldText label="Variant (secondary / outline)" value={ctas[i]?.variant ?? ''} onChange={(v) => setNested(['ctas', i, 'variant'], v)} placeholder="secondary" />
          </SubCard>
        ))}
      </div>
    </div>
  );
}

export function HistoriasHeroForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="El Telar Digital" />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} placeholder="Historias hechas a mano" />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldText label="CTA label" value={draft.ctaLabel} onChange={(v) => setField('ctaLabel', v)} placeholder="Explorar historias" />
        <FieldText label="CTA href" value={draft.ctaHref} onChange={(v) => setField('ctaHref', v)} placeholder="#featured" />
      </div>
    </div>
  );
}

export function HistoriasStoryTypesGridForm({ draft, setField, setNested }: any) {
  const cards = draft.cards ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SubCard key={i}>
            <SubCardLabel>Card {i + 1}</SubCardLabel>
            <FieldText label="Título" value={cards[i]?.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
            <FieldText label="Subtítulo" value={cards[i]?.subtitle ?? ''} onChange={(v) => setNested(['cards', i, 'subtitle'], v)} />
            <FieldText label="Href" value={cards[i]?.href ?? ''} onChange={(v) => setNested(['cards', i, 'href'], v)} placeholder="/tiendas" />
          </SubCard>
        ))}
      </div>
    </div>
  );
}

export function HistoriasCapsuleQuoteForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldArea label="Cita" value={draft.body} onChange={(v) => setField('body', v)} rows={5} placeholder='"El oficio artesanal..."' />
    </div>
  );
}

export function HistoriasFinalCtaForm({ draft, setField, setNested, setDraft }: any) {
  const ctas: any[] = Array.isArray(draft.ctas) ? draft.ctas : [];
  const addCta = () =>
    setDraft((prev: any) => ({ ...prev, ctas: [...(prev.ctas ?? []), { label: '', href: '', variant: 'outline' }] }));
  const removeCta = (i: number) =>
    setDraft((prev: any) => ({ ...prev, ctas: (prev.ctas ?? []).filter((_: any, idx: number) => idx !== i) }));

  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Continúa el viaje" />
      <FieldText label="Título línea 1" value={draft.titleLineTop} onChange={(v) => setField('titleLineTop', v)} />
      <FieldText label="Título línea 2" value={draft.titleLineBottom} onChange={(v) => setField('titleLineBottom', v)} />
      <div>
        <label className="text-xs uppercase tracking-widest font-bold">CTAs</label>
        <div className="space-y-3 mt-2">
          {ctas.map((cta, i) => (
            <SubCard key={i}>
              <div className="flex items-center justify-between">
                <SubCardLabel>CTA {i + 1}</SubCardLabel>
                <button type="button" className="text-xs text-destructive" onClick={() => removeCta(i)}>× quitar</button>
              </div>
              <FieldText label="Label" value={cta.label ?? ''} onChange={(v) => setNested(['ctas', i, 'label'], v)} />
              <FieldText label="Href" value={cta.href ?? ''} onChange={(v) => setNested(['ctas', i, 'href'], v)} />
              <FieldText label="Variant (primary / outline)" value={cta.variant ?? ''} onChange={(v) => setNested(['ctas', i, 'variant'], v)} />
            </SubCard>
          ))}
        </div>
        <button type="button" className="text-xs mt-3 underline" onClick={addCta}>+ agregar CTA</button>
      </div>
    </div>
  );
}

export function ColeccionesSeasonalGridForm({ draft, setField, setNested }: any) {
  const cards = draft.cards ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Slot (interno, no cambiar)" value={draft.slot} onChange={(v) => setField('slot', v)} placeholder="colecciones_seasonal" />
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Actualidad" />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} placeholder="Selecciones de temporada" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SubCard key={i}>
            <SubCardLabel>Card {i + 1}</SubCardLabel>
            <FieldText label="Título" value={cards[i]?.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
            <FieldText label="Descripción" value={cards[i]?.description ?? ''} onChange={(v) => setNested(['cards', i, 'description'], v)} />
            <FieldText label="CTA texto" value={cards[i]?.cta ?? ''} onChange={(v) => setNested(['cards', i, 'cta'], v)} placeholder="Adquirir piezas" />
            <FieldText label="Href" value={cards[i]?.href ?? ''} onChange={(v) => setNested(['cards', i, 'href'], v)} placeholder="/productos" />
            <ImageUploadField
              label="Imagen"
              value={cards[i]?.imageUrl ?? ''}
              onChange={(v) => setNested(['cards', i, 'imageUrl'], v)}
              altValue={cards[i]?.imageAlt ?? ''}
              onAltChange={(v) => setNested(['cards', i, 'imageAlt'], v)}
            />
          </SubCard>
        ))}
      </div>
    </div>
  );
}

export function ColeccionesArchiveNavHeaderForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Slot (interno, no cambiar)" value={draft.slot} onChange={(v) => setField('slot', v)} placeholder="colecciones_archive_nav" />
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="El Archivo del Saber" />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} placeholder="Navegar por la esencia" />
    </div>
  );
}

export function RawJsonForm({
  draft, onChange,
}: {
  draft: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(draft, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setText(JSON.stringify(draft, null, 2)); }, [draft]);

  return (
    <div className="space-y-2">
      <label className={fieldLabel}>Payload JSON (tipo desconocido)</label>
      <Textarea
        rows={12}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try { onChange(JSON.parse(e.target.value)); setError(null); }
          catch (err) { setError((err as Error).message); }
        }}
        className="font-mono text-xs"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── renderSectionForm helper ─────────────────────────────────────────────────
export function renderSectionForm(
  section_type: string,
  draft: Record<string, any>,
  setField: (key: string, value: any) => void,
  setNested: (path: (string | number)[], value: any) => void,
  setDraft: React.Dispatch<React.SetStateAction<Record<string, any>>>,
) {
  switch (section_type) {
    case 'hero':               return <HeroForm draft={draft} setField={setField} />;
    case 'hero_split':         return <HeroSplitForm draft={draft} setField={setField} />;
    case 'quote':              return <QuoteForm draft={draft} setField={setField} />;
    case 'two_column_intro':   return <TwoColumnIntroForm draft={draft} setField={setField} setNested={setNested} />;
    case 'technique_grid':     return <TechniqueGridForm draft={draft} setField={setField} setNested={setNested} />;
    case 'featured_aside_card':return <FeaturedAsideCardForm draft={draft} setField={setField} />;
    case 'metrics_stat':       return <MetricsStatForm draft={draft} setField={setField} />;
    case 'muestra_intro':      return <MuestraIntroForm draft={draft} setField={setField} />;
    case 'archive_label':      return <ArchiveLabelForm draft={draft} setField={setField} />;
    case 'editorial_footer':   return <EditorialFooterForm draft={draft} setField={setField} setNested={setNested} />;
    case 'home_value_props':   return <HomeValuePropsForm draft={draft} setNested={setNested} />;
    case 'home_section_header':return <HomeSectionHeaderForm draft={draft} setField={setField} />;
    case 'home_block':         return <HomeBlockForm draft={draft} setField={setField} />;
    case 'home_hero_carousel': return <HomeHeroCarouselForm draft={draft} setField={setField} setNested={setNested} setDraft={setDraft} />;
    case 'content_pick':       return <ContentPickForm draft={draft} setField={setField} />;
    case 'embedded_widget':    return <EmbeddedWidgetForm draft={draft} setField={setField} />;
    case 'territorios_hero':   return <TerritoriosHeroForm draft={draft} setField={setField} setNested={setNested} />;
    case 'territorios_dark_quote': return <TerritoriosDarkQuoteForm draft={draft} setField={setField} setNested={setNested} />;
    case 'about_hero':         return <AboutHeroForm draft={draft} setField={setField} />;
    case 'about_two_col':      return <AboutTwoColForm draft={draft} setField={setField} setDraft={setDraft} />;
    case 'about_wide_block':   return <AboutWideBlockForm draft={draft} setField={setField} setDraft={setDraft} />;
    case 'about_cta':          return <AboutCtaForm draft={draft} setField={setField} setNested={setNested} />;
    case 'historias_hero':     return <HistoriasHeroForm draft={draft} setField={setField} />;
    case 'historias_story_types_grid': return <HistoriasStoryTypesGridForm draft={draft} setField={setField} setNested={setNested} />;
    case 'historias_capsule_quote':    return <HistoriasCapsuleQuoteForm draft={draft} setField={setField} />;
    case 'historias_final_cta':        return <HistoriasFinalCtaForm draft={draft} setField={setField} setNested={setNested} setDraft={setDraft} />;
    case 'colecciones_seasonal_grid':      return <ColeccionesSeasonalGridForm draft={draft} setField={setField} setNested={setNested} />;
    case 'colecciones_archive_nav_header': return <ColeccionesArchiveNavHeaderForm draft={draft} setField={setField} />;
    default:                   return <RawJsonForm draft={draft} onChange={(v) => { setDraft(v); }} />;
  }
}
