/**
 * SectionFormFields — Shared form sub-components for the CMS section editor.
 *
 * All form components, design tokens, and metadata are exported here so they
 * can be used by CmsAdminPage and any future CMS editor pages.
 */

import { useEffect, useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// ─── Shared field components ──────────────────────────────────────────────────
export function FieldText({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest">{label}</Label>
      <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function FieldArea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest">{label}</Label>
      <Textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
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
          <div key={i} style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.1)', borderRadius: 12, padding: 16 }} className="space-y-3">
            <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ORANGE_MID, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Columna {i + 1}</p>
            <FieldText label="Kicker" value={cols[i]?.kicker ?? ''} onChange={(v) => setNested(['columns', i, 'kicker'], v)} />
            <FieldText label="Título" value={cols[i]?.title ?? ''} onChange={(v) => setNested(['columns', i, 'title'], v)} />
            <FieldArea label="Cuerpo" value={cols[i]?.body ?? ''} onChange={(v) => setNested(['columns', i, 'body'], v)} />
          </div>
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
          <div key={i} style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.1)', borderRadius: 12, padding: 16 }} className="space-y-3">
            <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ORANGE_MID, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Card {i + 1}</p>
            <FieldText label="Título" value={card.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
            <FieldArea label="Cuerpo" value={card.body ?? ''} onChange={(v) => setNested(['cards', i, 'body'], v)} />
            <FieldText label="Slug (opcional)" value={card.slug ?? ''} onChange={(v) => setNested(['cards', i, 'slug'], v)} placeholder="tallado, calado…" />
            <FieldText label="Image key (técnica)" value={card.imageKey ?? ''} onChange={(v) => setNested(['cards', i, 'imageKey'], v)} placeholder="Tallado" />
          </div>
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
        <Label className="text-xs uppercase tracking-widest mb-2 block">Links</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.1)', borderRadius: 12, padding: 12 }} className="space-y-2">
              <FieldText label={`Link ${i + 1}`} value={links[i]?.label ?? ''} onChange={(v) => setNested(['links', i, 'label'], v)} />
              <FieldText label="href" value={links[i]?.href ?? ''} onChange={(v) => setNested(['links', i, 'href'], v)} placeholder="/historias" />
            </div>
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
      <Label className="text-xs uppercase tracking-widest">Cards (3)</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.1)', borderRadius: 12, padding: 16 }} className="space-y-3">
            <FieldText label={`Título ${i + 1}`} value={cards[i]?.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
            <FieldArea label="Cuerpo" value={cards[i]?.body ?? ''} onChange={(v) => setNested(['cards', i, 'body'], v)} rows={3} />
            <ImageUploadField
              label="Imagen (opcional)"
              value={cards[i]?.imageUrl ?? ''}
              onChange={(v) => setNested(['cards', i, 'imageUrl'], v)}
              previewAspect="1/1"
            />
          </div>
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
        <Label className="text-xs uppercase tracking-widest">Widget</Label>
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
          <Label className="text-xs uppercase tracking-widest">Tipo de destino</Label>
          <Select value={draft.targetType ?? 'collection'} onValueChange={(v) => setField('targetType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="collection">Colección</SelectItem>
              <SelectItem value="blog">Blog post</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-widest">Variante visual</Label>
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
      <div style={{ borderTop: '1px solid rgba(236,109,19,0.08)', paddingTop: 12 }}>
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
        <Label className="text-xs uppercase tracking-widest">Variante</Label>
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
      <div style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.1)', borderRadius: 12, padding: 16 }} className="space-y-3">
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ORANGE_MID, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Contenido compartido (todas las slides)
        </p>
        <FieldArea label="Descripción (párrafo)" value={draft.description ?? ''} onChange={(v) => setField('description', v)} rows={2} />
        <FieldText label="Tagline (UPPERCASE)" value={draft.tagline ?? ''} onChange={(v) => setField('tagline', v)} placeholder="Hecho a mano por talleres..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldText label="CTA primario — texto" value={draft.primaryCtaLabel ?? ''} onChange={(v) => setField('primaryCtaLabel', v)} placeholder="Explorar Piezas" />
          <FieldText label="CTA primario — link" value={draft.primaryCtaHref ?? ''} onChange={(v) => setField('primaryCtaHref', v)} placeholder="/productos" />
          <FieldText label="CTA secundario — texto" value={draft.secondaryCtaLabel ?? ''} onChange={(v) => setField('secondaryCtaLabel', v)} placeholder="Conocer Talleres" />
          <FieldText label="CTA secundario — link" value={draft.secondaryCtaHref ?? ''} onChange={(v) => setField('secondaryCtaHref', v)} placeholder="/tiendas" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <Label className="text-xs uppercase tracking-widest">Autoplay (seg)</Label>
          <Input
            type="number" min={2} max={30}
            value={draft.autoplaySeconds ?? 6}
            onChange={(e) => setField('autoplaySeconds', parseInt(e.target.value, 10) || 6)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: '#151b2d' }}>Slides ({slides.length})</p>
        <button
          type="button"
          onClick={addSlide}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 16,
            background: 'rgba(236,109,19,0.08)', color: ORANGE_MID,
            border: '1px solid rgba(236,109,19,0.2)', cursor: 'pointer',
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
          }}
        >
          <Plus style={{ width: 12, height: 12 }} /> Añadir slide
        </button>
      </div>

      <div className="space-y-3">
        {slides.map((slide, i) => (
          <div key={i} style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.1)', borderRadius: 12, padding: 16 }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: ORANGE_MID }}>Slide #{i + 1}</p>
              <div className="flex items-center gap-1">
                <IconBtn disabled={i === 0} onClick={() => moveSlide(i, -1)} title="Subir"><ArrowUp style={{ width: 12, height: 12 }} /></IconBtn>
                <IconBtn disabled={i === slides.length - 1} onClick={() => moveSlide(i, 1)} title="Bajar"><ArrowDown style={{ width: 12, height: 12 }} /></IconBtn>
                <IconBtn onClick={() => removeSlide(i)} danger title="Eliminar"><Trash2 style={{ width: 12, height: 12 }} /></IconBtn>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldText label="Título" value={slide.title ?? ''} onChange={(v) => setNested(['slides', i, 'title'], v)} placeholder="HISTORIAS HECHAS" />
              <FieldText label="Subtítulo (cursiva color primario)" value={slide.subtitle ?? ''} onChange={(v) => setNested(['slides', i, 'subtitle'], v)} placeholder="A MANO" />
              <FieldText label="Origen" value={slide.origin ?? ''} onChange={(v) => setNested(['slides', i, 'origin'], v)} placeholder="Nariño, Colombia" />
              <FieldText label="Quote" value={slide.quote ?? ''} onChange={(v) => setNested(['slides', i, 'quote'], v)} placeholder="Cada puntada..." />
            </div>
            <div className="mt-3">
              <ImageUploadField
                label="Imagen del slide"
                value={slide.imageUrl ?? ''}
                onChange={(v) => setNested(['slides', i, 'imageUrl'], v)}
                altValue={slide.imageAlt ?? ''}
                onAltChange={(v) => setNested(['slides', i, 'imageAlt'], v)}
                previewAspect="4/3"
              />
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.4)' }}>
            No hay slides. Añade al menos uno.
          </p>
        )}
      </div>
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
      <Label className="text-xs uppercase tracking-widest">Payload JSON (tipo desconocido)</Label>
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
    default:                   return <RawJsonForm draft={draft} onChange={(v) => { setDraft(v); }} />;
  }
}
