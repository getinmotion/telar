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
import type {
  CmsSection,
  CmsSectionType,
} from '@/services/cms-sections.types';

const PAGE_KEYS = [
  { key: 'tecnicas', label: 'Página /tecnicas' },
];

const SECTION_TYPES: { value: CmsSectionType; label: string }[] = [
  { value: 'hero', label: 'Hero (kicker + título + cuerpo)' },
  { value: 'quote', label: 'Cita destacada' },
  { value: 'two_column_intro', label: 'Intro a dos columnas' },
  { value: 'technique_grid', label: 'Grilla de técnicas (4 cards)' },
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
        {!['hero', 'quote', 'two_column_intro', 'technique_grid'].includes(
          section.type,
        ) && (
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
