/**
 * CollectionsAdminPage — super-admin only. Lista de colecciones + editor in-page.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollectionsAdmin } from '@/hooks/useCollectionsAdmin';
import { ImageUploadField } from '@/components/cms/ImageUploadField';
import { BlocksEditor } from '@/components/cms/BlocksEditor';
import { UploadFolder } from '@/services/fileUpload.actions';
import {
  slugify,
  type CollectionAdmin,
  type CreateCollectionInput,
  type CollectionLayoutVariant,
} from '@/services/collections-admin.actions';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

type ViewState = { view: 'list' } | { view: 'edit'; collection: CollectionAdmin | null };

const emptyCollection = (): CreateCollectionInput => ({
  title: '',
  slug: '',
  excerpt: '',
  heroImageUrl: '',
  heroImageAlt: '',
  region: '',
  layoutVariant: 'wide',
  blocks: [],
  status: 'draft',
  publishedAt: undefined,
  keywords: [],
});

export default function CollectionsAdminPage() {
  const [state, setState] = useState<ViewState>({ view: 'list' });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);

  const {
    collections,
    total,
    loading,
    saving,
    fetchCollections,
    create,
    update,
    remove,
  } = useCollectionsAdmin();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (state.view === 'list') {
      fetchCollections({ search: debouncedSearch, limit: PAGE_SIZE, offset });
    }
  }, [state.view, debouncedSearch, offset, fetchCollections]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  if (state.view === 'edit') {
    return (
      <CollectionEditor
        collection={state.collection}
        saving={saving}
        onCancel={() => setState({ view: 'list' })}
        onSubmit={async (input) => {
          if (state.collection) {
            const res = await update(state.collection._id, input);
            if (res) setState({ view: 'list' });
          } else {
            const res = await create(input);
            if (res) setState({ view: 'list' });
          }
        }}
        onDelete={
          state.collection
            ? async () => {
                if (!state.collection) return;
                const ok = await remove(state.collection._id);
                if (ok) setState({ view: 'list' });
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colecciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra las colecciones editoriales (/colecciones y /coleccion/:slug).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar título / slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOffset(0);
              }}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setState({ view: 'edit', collection: null })} className="gap-2">
            <Plus className="h-4 w-4" /> Nueva colección
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {loading ? 'Cargando…' : `${total} colección${total === 1 ? '' : 'es'}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : collections.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground">
              No hay colecciones. Crea la primera con el botón "Nueva colección".
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-[200px]">Slug</TableHead>
                  <TableHead className="w-[110px]">Estado</TableHead>
                  <TableHead className="w-[140px]">Publicado</TableHead>
                  <TableHead className="w-[140px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <div className="font-medium">{c.title}</div>
                      {c.excerpt && (
                        <div className="line-clamp-1 text-xs text-muted-foreground">{c.excerpt}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{c.slug}</TableCell>
                    <TableCell>
                      {c.status === 'published' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Borrador</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.publishedAt ? new Date(c.publishedAt).toLocaleDateString('es-CO') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setState({ view: 'edit', collection: c })}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(c._id)}
                        title="Eliminar"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Página {Math.floor(offset / PAGE_SIZE) + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0 || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              ← Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface EditorProps {
  collection: CollectionAdmin | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateCollectionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function CollectionEditor({ collection, saving, onCancel, onSubmit, onDelete }: EditorProps) {
  const [draft, setDraft] = useState<CreateCollectionInput>(() =>
    collection
      ? {
          title: collection.title,
          slug: collection.slug,
          excerpt: collection.excerpt ?? '',
          heroImageUrl: collection.heroImageUrl ?? '',
          heroImageAlt: collection.heroImageAlt ?? '',
          region: collection.region ?? '',
          layoutVariant: collection.layoutVariant,
          blocks: collection.blocks ?? [],
          status: collection.status,
          publishedAt: collection.publishedAt ?? undefined,
          keywords: collection.keywords ?? [],
        }
      : emptyCollection(),
  );
  const [autoSlug, setAutoSlug] = useState(!collection);

  const set = (k: keyof CreateCollectionInput, v: any) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  const onTitleChange = (title: string) => {
    setDraft((prev) => ({
      ...prev,
      title,
      slug: autoSlug ? slugify(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    if (!draft.slug.trim()) {
      toast.error('El slug es obligatorio');
      return;
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug)) {
      toast.error('El slug debe ser kebab-case (minúsculas y guiones)');
      return;
    }
    const payload: CreateCollectionInput = {
      ...draft,
      excerpt: draft.excerpt?.toString().trim() || null,
      heroImageUrl: draft.heroImageUrl?.toString().trim() || null,
      heroImageAlt: draft.heroImageAlt?.toString().trim() || null,
      region: draft.region?.toString().trim() || null,
      keywords: (draft.keywords ?? []).map((k) => k.trim()).filter(Boolean),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver al listado
        </Button>
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={saving} className="gap-2">
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          )}
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {collection ? 'Guardar cambios' : 'Crear colección'}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">
        {collection ? `Editando: ${collection.title}` : 'Nueva colección'}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input
                  value={draft.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center justify-between">
                  <span>Slug *</span>
                  <label className="flex items-center gap-2 text-xs font-normal">
                    <Switch checked={autoSlug} onCheckedChange={setAutoSlug} />
                    Auto desde título
                  </label>
                </Label>
                <Input
                  value={draft.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    set('slug', e.target.value);
                  }}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Excerpt (subtítulo del hero)</Label>
                <Textarea
                  value={draft.excerpt ?? ''}
                  onChange={(e) => set('excerpt', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Región</Label>
                  <Input
                    value={draft.region ?? ''}
                    onChange={(e) => set('region', e.target.value)}
                    placeholder="Tolima · Huila"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Layout</Label>
                  <Select
                    value={draft.layoutVariant ?? 'wide'}
                    onValueChange={(v) => set('layoutVariant', v as CollectionLayoutVariant)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="centered">Centered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bloques</CardTitle>
            </CardHeader>
            <CardContent>
              <BlocksEditor
                value={draft.blocks ?? []}
                onChange={(blocks) => set('blocks', blocks)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select
                  value={draft.status ?? 'draft'}
                  onValueChange={(v) => set('status', v as 'draft' | 'published')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha de publicación</Label>
                <Input
                  type="datetime-local"
                  value={
                    draft.publishedAt
                      ? new Date(draft.publishedAt).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    set(
                      'publishedAt',
                      e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Hero</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploadField
                label=""
                value={draft.heroImageUrl ?? ''}
                onChange={(v) => set('heroImageUrl', v)}
                altValue={draft.heroImageAlt ?? ''}
                onAltChange={(v) => set('heroImageAlt', v)}
                folder={UploadFolder.CMS}
                previewAspect="16/9"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Keywords (separadas por coma)</Label>
                <Input
                  value={(draft.keywords ?? []).join(', ')}
                  onChange={(e) =>
                    set(
                      'keywords',
                      e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
