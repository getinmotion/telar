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
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCmsAdmin } from '@/hooks/useCmsAdmin';
import { ImageUploadField } from '@/components/cms/ImageUploadField';
import type {
  CmsSection,
  CmsSectionType,
} from '@/services/cms-sections.types';

const PAGE_KEYS = [
  { key: 'tecnicas', label: 'Página /tecnicas' },
  { key: 'home', label: 'Página / (homepage)' },
  { key: 'colecciones', label: 'Página /colecciones (índice)' },
];

const SECTION_TYPES: { value: CmsSectionType; label: string }[] = [
  { value: 'hero', label: 'Hero (kicker + título + cuerpo)' },
  { value: 'quote', label: 'Cita destacada' },
  { value: 'two_column_intro', label: 'Intro a dos columnas' },
  { value: 'technique_grid', label: 'Grilla de técnicas (4 cards)' },
  { value: 'featured_aside_card', label: 'Card lateral destacada (Archivo Digital)' },
  { value: 'metrics_stat', label: 'Métrica destacada (caja naranja)' },
  { value: 'muestra_intro', label: 'Intro de muestra (kicker + título + cuerpo)' },
  { value: 'archive_label', label: 'Etiqueta de archivo (label centrado)' },
  { value: 'editorial_footer', label: 'Footer editorial (Legado Viviente)' },
  { value: 'home_value_props', label: 'Home — Value Props (3 cards)' },
  { value: 'home_section_header', label: 'Home — Section Header' },
  { value: 'home_block', label: 'Home — Block (variant: light/dark/cream/bordered)' },
  { value: 'home_hero_carousel', label: 'Home — Hero Carousel (slides editables)' },
];

function emptyPayloadFor(type: CmsSectionType): Record<string, any> {
  switch (type) {
    case 'hero':
      return { kicker: '', title: '', subtitle: '', body: '', totalCountLabel: '' };
    case 'quote':
      return { kicker: '', body: '', attribution: '' };
    case 'two_column_intro':
      return {
        kicker: '',
        title: '',
        body: '',
        columns: [
          { kicker: '', title: '', body: '' },
          { kicker: '', title: '', body: '' },
        ],
      };
    case 'technique_grid':
      return {
        kicker: '',
        title: '',
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
        kicker: '',
        title: '',
        body: '',
        links: [
          { label: '', href: '' },
          { label: '', href: '' },
          { label: '', href: '' },
        ],
        asideTitle: '',
        asideBody: '',
        asideCtaLabel: '',
        copyright: '',
        edition: '',
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
      return {
        slot: '',
        kicker: '',
        title: '',
        subtitle: '',
        ctaLabel: '',
        ctaHref: '',
      };
    case 'home_block':
      return {
        slot: '',
        kicker: '',
        title: '',
        body: '',
        ctaLabel: '',
        ctaHref: '',
        imageUrl: '',
        variant: 'light',
      };
    case 'home_hero_carousel':
      return {
        description: '',
        tagline: '',
        primaryCtaLabel: '',
        primaryCtaHref: '',
        secondaryCtaLabel: '',
        secondaryCtaHref: '',
        autoplaySeconds: 6,
        slides: [
          { title: '', subtitle: '', imageUrl: '', imageAlt: '', origin: '', quote: '' },
        ],
      };
    default:
      return {};
  }
}

export default function CmsAdminPage() {
  const [pageKey, setPageKey] = useState('tecnicas');
  const {
    sections,
    loading,
    saving,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  } = useCmsAdmin();

  useEffect(() => {
    fetchSections(pageKey);
  }, [pageKey, fetchSections]);

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

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">CMS — Contenido Editorial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edita las secciones curadas que se muestran en las páginas públicas
            del marketplace. Los cambios se publican al instante.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Label className="text-xs uppercase tracking-widest">Página</Label>
          <Select value={pageKey} onValueChange={setPageKey}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_KEYS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NewSectionButton
            onCreate={async (type) => {
              const created = await createSection({
                pageKey,
                type,
                payload: emptyPayloadFor(type),
                published: false,
              });
              return !!created;
            }}
            disabled={saving}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Cargando…</div>
      ) : ordered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No hay secciones aún. Crea la primera con el botón “Nueva sección”.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordered.map((section, idx) => (
            <SectionCard
              key={section.id}
              section={section}
              isFirst={idx === 0}
              isLast={idx === ordered.length - 1}
              saving={saving}
              onMoveUp={() => move(section.id, -1)}
              onMoveDown={() => move(section.id, 1)}
              onTogglePublish={() =>
                updateSection(section.id, { published: !section.published })
              }
              onSavePayload={(payload) =>
                updateSection(section.id, { payload })
              }
              onDelete={async () => {
                await deleteSection(section.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
        <Button disabled={disabled} className="gap-2">
          <Plus className="w-4 h-4" /> Nueva sección
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear sección</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Tipo de sección</Label>
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
  section,
  isFirst,
  isLast,
  saving,
  onMoveUp,
  onMoveDown,
  onTogglePublish,
  onSavePayload,
  onDelete,
}: SectionCardProps) {
  const [draft, setDraft] = useState<Record<string, any>>(section.payload);
  const [dirty, setDirty] = useState(false);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline">{section.type}</Badge>
          <CardTitle className="text-base">
            #{section.position + 1} · {summaryForSection(section)}
          </CardTitle>
          {section.published ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Publicada
            </Badge>
          ) : (
            <Badge variant="secondary">Borrador</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={isFirst || saving}
            onClick={onMoveUp}
            title="Subir"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLast || saving}
            onClick={onMoveDown}
            title="Bajar"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePublish}
            title={section.published ? 'Despublicar' : 'Publicar'}
          >
            {section.published ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="Eliminar"
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {section.type === 'hero' && (
          <HeroForm draft={draft} setField={setField} />
        )}
        {section.type === 'quote' && (
          <QuoteForm draft={draft} setField={setField} />
        )}
        {section.type === 'two_column_intro' && (
          <TwoColumnIntroForm draft={draft} setField={setField} setNested={setNested} />
        )}
        {section.type === 'technique_grid' && (
          <TechniqueGridForm draft={draft} setField={setField} setNested={setNested} />
        )}
        {section.type === 'featured_aside_card' && (
          <FeaturedAsideCardForm draft={draft} setField={setField} />
        )}
        {section.type === 'metrics_stat' && (
          <MetricsStatForm draft={draft} setField={setField} />
        )}
        {section.type === 'muestra_intro' && (
          <MuestraIntroForm draft={draft} setField={setField} />
        )}
        {section.type === 'archive_label' && (
          <ArchiveLabelForm draft={draft} setField={setField} />
        )}
        {section.type === 'editorial_footer' && (
          <EditorialFooterForm draft={draft} setField={setField} setNested={setNested} />
        )}
        {section.type === 'home_value_props' && (
          <HomeValuePropsForm draft={draft} setNested={setNested} />
        )}
        {section.type === 'home_section_header' && (
          <HomeSectionHeaderForm draft={draft} setField={setField} />
        )}
        {section.type === 'home_block' && (
          <HomeBlockForm draft={draft} setField={setField} />
        )}
        {section.type === 'home_hero_carousel' && (
          <HomeHeroCarouselForm
            draft={draft}
            setField={setField}
            setNested={setNested}
            setDraft={setDraft}
          />
        )}
        {![
          'hero',
          'quote',
          'two_column_intro',
          'technique_grid',
          'featured_aside_card',
          'metrics_stat',
          'muestra_intro',
          'archive_label',
          'editorial_footer',
          'home_value_props',
          'home_section_header',
          'home_block',
          'home_hero_carousel',
        ].includes(section.type) && (
          <RawJsonForm draft={draft} onChange={(v) => { setDraft(v); setDirty(true); }} />
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={section.published}
              onCheckedChange={onTogglePublish}
              id={`pub-${section.id}`}
            />
            <Label htmlFor={`pub-${section.id}`} className="text-xs">
              Publicada
            </Label>
          </div>
          <Button
            disabled={!dirty || saving}
            onClick={async () => {
              await onSavePayload(draft);
              setDirty(false);
            }}
            className="gap-2"
          >
            <Save className="w-4 h-4" /> Guardar cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function summaryForSection(s: CmsSection): string {
  const p = s.payload ?? {};
  return (
    p.title || p.kicker || p.body?.slice?.(0, 60) || `Sección ${s.id.slice(0, 6)}`
  );
}

function FieldText({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest">{label}</Label>
      <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function FieldArea({
  label, value, onChange, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest">{label}</Label>
      <Textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function HeroForm({ draft, setField }: any) {
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

function QuoteForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldArea label="Cita" value={draft.body} onChange={(v) => setField('body', v)} rows={4} />
      <FieldText label="Atribución" value={draft.attribution} onChange={(v) => setField('attribution', v)} />
    </div>
  );
}

function TwoColumnIntroForm({ draft, setField, setNested }: any) {
  const cols = draft.columns ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <Card key={i} className="bg-muted/30">
            <CardContent className="pt-6 space-y-3">
              <Label className="text-xs uppercase tracking-widest">Columna {i + 1}</Label>
              <FieldText label="Kicker" value={cols[i]?.kicker ?? ''} onChange={(v) => setNested(['columns', i, 'kicker'], v)} />
              <FieldText label="Título" value={cols[i]?.title ?? ''} onChange={(v) => setNested(['columns', i, 'title'], v)} />
              <FieldArea label="Cuerpo" value={cols[i]?.body ?? ''} onChange={(v) => setNested(['columns', i, 'body'], v)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TechniqueGridForm({ draft, setField, setNested }: any) {
  const cards = draft.cards ?? [];
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card: any, i: number) => (
          <Card key={i} className="bg-muted/30">
            <CardContent className="pt-6 space-y-3">
              <Label className="text-xs uppercase tracking-widest">Card {i + 1}</Label>
              <FieldText label="Título" value={card.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
              <FieldArea label="Cuerpo" value={card.body ?? ''} onChange={(v) => setNested(['cards', i, 'body'], v)} />
              <FieldText label="Slug (opcional)" value={card.slug ?? ''} onChange={(v) => setNested(['cards', i, 'slug'], v)} placeholder="tallado, calado…" />
              <FieldText label="Image key (técnica)" value={card.imageKey ?? ''} onChange={(v) => setNested(['cards', i, 'imageKey'], v)} placeholder="Tallado" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FeaturedAsideCardForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
      <FieldText label="Texto del CTA" value={draft.ctaLabel} onChange={(v) => setField('ctaLabel', v)} placeholder="Ver Catálogo" />
      <FieldText label="Link del CTA (opcional)" value={draft.ctaHref} onChange={(v) => setField('ctaHref', v)} placeholder="/catalogo" />
    </div>
  );
}

function MetricsStatForm({ draft, setField }: any) {
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

function MuestraIntroForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Kicker" value={draft.kicker} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title} onChange={(v) => setField('title', v)} />
      <FieldArea label="Cuerpo" value={draft.body} onChange={(v) => setField('body', v)} rows={3} />
    </div>
  );
}

function ArchiveLabelForm({ draft, setField }: any) {
  return (
    <FieldText label="Etiqueta (kicker centrado)" value={draft.kicker} onChange={(v) => setField('kicker', v)} placeholder="Exploración del Archivo" />
  );
}

function EditorialFooterForm({ draft, setField, setNested }: any) {
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
            <Card key={i} className="bg-muted/30">
              <CardContent className="pt-4 space-y-2">
                <FieldText label={`Link ${i + 1}`} value={links[i]?.label ?? ''} onChange={(v) => setNested(['links', i, 'label'], v)} />
                <FieldText label="href" value={links[i]?.href ?? ''} onChange={(v) => setNested(['links', i, 'href'], v)} placeholder="/historias" />
              </CardContent>
            </Card>
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

function HomeValuePropsForm({ draft, setNested }: any) {
  const cards = draft.cards ?? [];
  return (
    <div className="space-y-4">
      <Label className="text-xs uppercase tracking-widest">Cards (3)</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="bg-muted/30">
            <CardContent className="pt-6 space-y-3">
              <FieldText label={`Título ${i + 1}`} value={cards[i]?.title ?? ''} onChange={(v) => setNested(['cards', i, 'title'], v)} />
              <FieldArea label="Cuerpo" value={cards[i]?.body ?? ''} onChange={(v) => setNested(['cards', i, 'body'], v)} rows={3} />
              <ImageUploadField
                label="Imagen (opcional)"
                value={cards[i]?.imageUrl ?? ''}
                onChange={(v) => setNested(['cards', i, 'imageUrl'], v)}
                previewAspect="1/1"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HomeSectionHeaderForm({ draft, setField }: any) {
  return (
    <div className="space-y-4">
      <FieldText label="Slot (categories | featured_products | …)" value={draft.slot ?? ''} onChange={(v) => setField('slot', v)} placeholder="featured_products" />
      <FieldText label="Kicker" value={draft.kicker ?? ''} onChange={(v) => setField('kicker', v)} />
      <FieldText label="Título" value={draft.title ?? ''} onChange={(v) => setField('title', v)} />
      <FieldText label="Subtítulo" value={draft.subtitle ?? ''} onChange={(v) => setField('subtitle', v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldText label="CTA texto" value={draft.ctaLabel ?? ''} onChange={(v) => setField('ctaLabel', v)} />
        <FieldText label="CTA href" value={draft.ctaHref ?? ''} onChange={(v) => setField('ctaHref', v)} />
      </div>
    </div>
  );
}

function HomeBlockForm({ draft, setField }: any) {
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

function HomeHeroCarouselForm({ draft, setField, setNested, setDraft }: any) {
  const slides: any[] = Array.isArray(draft.slides) ? draft.slides : [];

  const addSlide = () => {
    setDraft((prev: any) => ({
      ...prev,
      slides: [
        ...(prev.slides ?? []),
        { title: '', subtitle: '', imageUrl: '', imageAlt: '', origin: '', quote: '' },
      ],
    }));
  };

  const removeSlide = (i: number) => {
    setDraft((prev: any) => ({
      ...prev,
      slides: (prev.slides ?? []).filter((_: any, idx: number) => idx !== i),
    }));
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
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Contenido compartido (todas las slides)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
              type="number"
              min={2}
              max={30}
              value={draft.autoplaySeconds ?? 6}
              onChange={(e) =>
                setField('autoplaySeconds', parseInt(e.target.value, 10) || 6)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Slides ({slides.length})</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSlide} className="gap-2">
          <Plus className="w-4 h-4" /> Añadir slide
        </Button>
      </div>

      <div className="space-y-3">
        {slides.map((slide, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Slide #{i + 1}</CardTitle>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => moveSlide(i, -1)} title="Subir">
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={i === slides.length - 1} onClick={() => moveSlide(i, 1)} title="Bajar">
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSlide(i)} className="text-destructive" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>
        ))}
        {slides.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay slides. Añade al menos uno.</p>
        )}
      </div>
    </div>
  );
}

function RawJsonForm({
  draft,
  onChange,
}: {
  draft: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(draft, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(draft, null, 2));
  }, [draft]);

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest">
        Payload JSON (tipo desconocido)
      </Label>
      <Textarea
        rows={12}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setError(null);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
        className="font-mono text-xs"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
