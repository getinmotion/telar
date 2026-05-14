/**
 * BlogPostsAdminPage — super-admin only. Lista de blog posts + editor in-page.
 *
 * View states:
 *  - 'list'   → tabla paginada con buscador + acciones
 *  - 'edit'   → form editor (título, slug, cover, body Markdown con preview, etc.)
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
import { useBlogPostsAdmin } from '@/hooks/useBlogPostsAdmin';
import { ImageUploadField } from '@/components/cms/ImageUploadField';
import { UploadFolder } from '@/services/fileUpload.actions';
import {
  slugify,
  type BlogPost,
  type CreateBlogPostInput,
} from '@/services/blog-posts-admin.actions';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

type ViewState = { view: 'list' } | { view: 'edit'; post: BlogPost | null };

const emptyPost = (): CreateBlogPostInput => ({
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  coverUrl: '',
  coverAlt: '',
  category: '',
  authorName: '',
  readingTimeMin: undefined,
  status: 'draft',
  publishedAt: undefined,
  keywords: [],
});

export default function BlogPostsAdminPage() {
  const [state, setState] = useState<ViewState>({ view: 'list' });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);

  const { posts, total, loading, saving, fetchPosts, create, update, remove } =
    useBlogPostsAdmin();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (state.view === 'list') {
      fetchPosts({ search: debouncedSearch, limit: PAGE_SIZE, offset });
    }
  }, [state.view, debouncedSearch, offset, fetchPosts]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  if (state.view === 'edit') {
    return (
      <BlogPostEditor
        post={state.post}
        saving={saving}
        onCancel={() => setState({ view: 'list' })}
        onSubmit={async (input) => {
          if (state.post) {
            const res = await update(state.post._id, input);
            if (res) setState({ view: 'list' });
          } else {
            const res = await create(input);
            if (res) setState({ view: 'list' });
          }
        }}
        onDelete={
          state.post
            ? async () => {
                if (!state.post) return;
                const ok = await remove(state.post._id);
                if (ok) setState({ view: 'list' });
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Historias / Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra las entradas editoriales de la página /historias.
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
          <Button
            onClick={() => setState({ view: 'edit', post: null })}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo post
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {loading ? 'Cargando…' : `${total} post${total === 1 ? '' : 's'}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground">
              No hay posts. Crea el primero con el botón "Nuevo post".
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
                {posts.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      {p.excerpt && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {p.excerpt}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                    <TableCell>
                      {p.status === 'published' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Borrador</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleDateString('es-CO')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setState({ view: 'edit', post: p })}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(p._id)}
                        title="Eliminar"
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="flex items-center justify-between mt-4">
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

// ── Editor ──────────────────────────────────────────────

interface EditorProps {
  post: BlogPost | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateBlogPostInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function BlogPostEditor({
  post,
  saving,
  onCancel,
  onSubmit,
  onDelete,
}: EditorProps) {
  const [draft, setDraft] = useState<CreateBlogPostInput>(() =>
    post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          body: post.body ?? '',
          coverUrl: post.coverUrl ?? '',
          coverAlt: post.coverAlt ?? '',
          category: post.category ?? '',
          authorName: post.authorName ?? '',
          readingTimeMin: post.readingTimeMin ?? undefined,
          status: post.status,
          publishedAt: post.publishedAt ?? undefined,
          keywords: post.keywords ?? [],
        }
      : emptyPost(),
  );
  const [autoSlug, setAutoSlug] = useState(!post);
  const [showPreview, setShowPreview] = useState(false);

  const set = (k: keyof CreateBlogPostInput, v: any) =>
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
    // Clean optional empty strings
    const payload: CreateBlogPostInput = {
      ...draft,
      excerpt: draft.excerpt?.trim() || undefined,
      body: draft.body ?? '',
      coverUrl: draft.coverUrl?.trim() || undefined,
      coverAlt: draft.coverAlt?.trim() || undefined,
      category: draft.category?.trim() || undefined,
      authorName: draft.authorName?.trim() || undefined,
      keywords: (draft.keywords ?? []).map((k) => k.trim()).filter(Boolean),
    };
    await onSubmit(payload);
  };

  const wordCount = (draft.body ?? '').trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadingMin = Math.max(1, Math.round(wordCount / 200));

  return (
    <form onSubmit={handleSubmit} className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver al listado
        </Button>
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={saving}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          )}
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {post ? 'Guardar cambios' : 'Crear post'}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">
        {post ? `Editando: ${post.title}` : 'Nuevo post'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input
                  value={draft.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="El Cauca: Donde la Seda Teje..."
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
                  placeholder="cauca-seda-paz"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Excerpt (resumen 1–2 líneas)</Label>
                <Textarea
                  value={draft.excerpt ?? ''}
                  onChange={(e) => set('excerpt', e.target.value)}
                  rows={2}
                  placeholder="Aparece como subtítulo y meta description."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Contenido (Markdown)</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview((v) => !v)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Ocultar preview' : 'Ver preview'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={showPreview ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}>
                <Textarea
                  value={draft.body ?? ''}
                  onChange={(e) => set('body', e.target.value)}
                  rows={26}
                  className="font-mono text-sm"
                  placeholder={`## Sección\n\nTexto del párrafo.\n\n- Lista\n- De items\n\n> Cita destacada`}
                />
                {showPreview && (
                  <div className="prose prose-sm max-w-none border rounded-md p-4 bg-muted/30 max-h-[600px] overflow-auto">
                    <ReactMarkdown>{draft.body || '*Sin contenido aún…*'}</ReactMarkdown>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {wordCount.toLocaleString('es-CO')} palabras · ~{estimatedReadingMin} min lectura
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <CardTitle className="text-base">Cover</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploadField
                label=""
                value={draft.coverUrl ?? ''}
                onChange={(v) => set('coverUrl', v)}
                altValue={draft.coverAlt ?? ''}
                onAltChange={(v) => set('coverAlt', v)}
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
                <Label>Categoría</Label>
                <Input
                  value={draft.category ?? ''}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="Crónica del Territorio"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Autor</Label>
                <Input
                  value={draft.authorName ?? ''}
                  onChange={(e) => set('authorName', e.target.value)}
                  placeholder="Redacción Telar"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tiempo de lectura (min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={draft.readingTimeMin ?? ''}
                  onChange={(e) =>
                    set(
                      'readingTimeMin',
                      e.target.value ? parseInt(e.target.value, 10) : undefined,
                    )
                  }
                  placeholder={String(estimatedReadingMin)}
                />
              </div>
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
                  placeholder="cauca, seda, paz"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
