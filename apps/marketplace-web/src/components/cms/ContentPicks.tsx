/**
 * ContentPicks — renderiza secciones tipo `content_pick` del CMS.
 *
 * Cada pick referencia un blog post o una colección por `slug`. Se hidrata
 * desde la API correspondiente y se renderiza como card / banner / inline.
 * Los `overrideX` del payload pisan los campos del doc.
 *
 * Uso:
 *   <ContentPicks pageKey="home" />            // renderiza todos los picks de home
 *   <ContentPicks pageKey="home" slot="x" />   // un solo pick específico
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useCmsSections } from '@/hooks/useCmsSections';
import {
  getBlogPostBySlug,
  type BlogPost,
} from '@/services/blog-posts.actions';
import {
  getCollectionBySlug,
  type Collection,
} from '@/services/collections.actions';

type Variant = 'card' | 'banner' | 'inline';
type Target = 'blog' | 'collection';

interface PickPayload {
  slot: string;
  targetType: Target;
  slug: string;
  label?: string;
  overrideTitle?: string;
  overrideExcerpt?: string;
  overrideImageUrl?: string;
  ctaLabel?: string;
  variant?: Variant;
}

interface ContentPicksProps {
  pageKey: string;
  /** Si se pasa, solo renderiza el pick con ese slot. */
  slot?: string;
  className?: string;
}

export function ContentPicks({ pageKey, slot, className }: ContentPicksProps) {
  const { data: sections } = useCmsSections(pageKey);
  // Dedupe por slot — si admin y seed crearon el mismo slot, gana la última posición.
  const seenSlots = new Set<string>();
  const picks = (sections ?? [])
    .filter((s) => s.type === 'content_pick' && s.published !== false)
    .filter((s) => (slot ? (s.payload as PickPayload)?.slot === slot : true))
    .filter((s) => {
      const slotName = (s.payload as PickPayload)?.slot;
      if (!slotName || seenSlots.has(slotName)) return false;
      seenSlots.add(slotName);
      return true;
    });

  if (picks.length === 0) return null;

  return (
    <div className={className ?? 'space-y-8'}>
      {picks.map((s) => (
        <ContentPickItem key={s.id} pick={s.payload as PickPayload} />
      ))}
    </div>
  );
}

/**
 * Render un solo pick. Exportado para uso desde SectionDispatcher cuando un
 * `content_pick` aparece en la lista ordenada de secciones (PageRenderer).
 */
export function ContentPickInline({ pick }: { pick: PickPayload }) {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12">
      <ContentPickItem pick={pick} />
    </section>
  );
}

function ContentPickItem({ pick }: { pick: PickPayload }) {
  const { data, isLoading } = useQuery({
    queryKey: ['content-pick', pick.targetType, pick.slug],
    queryFn: async () =>
      pick.targetType === 'blog'
        ? await getBlogPostBySlug(pick.slug)
        : await getCollectionBySlug(pick.slug),
    enabled: !!pick.slug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <div className="h-48 w-full animate-pulse rounded-md bg-muted" />;
  }
  if (!data) return null;

  const isBlog = pick.targetType === 'blog';
  const blog = isBlog ? (data as BlogPost) : null;
  const col = !isBlog ? (data as Collection) : null;

  const title = pick.overrideTitle || blog?.title || col?.title || '';
  const excerpt =
    pick.overrideExcerpt || blog?.excerpt || col?.excerpt || '';
  const imageUrl =
    pick.overrideImageUrl ||
    blog?.coverUrl ||
    col?.heroImageUrl ||
    null;
  const href = isBlog ? `/historias/${pick.slug}` : `/coleccion/${pick.slug}`;
  const ctaLabel =
    pick.ctaLabel || (isBlog ? 'Leer historia' : 'Ver colección');
  const variant = pick.variant ?? 'card';

  if (variant === 'banner') {
    return (
      <Link
        to={href}
        className="relative block w-full overflow-hidden rounded-xl bg-[#1a1a1a] text-white"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            loading="lazy"
          />
        )}
        <div className="relative z-10 px-8 py-16 md:px-12 md:py-24">
          {pick.label && (
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ec6d13]">
              {pick.label}
            </p>
          )}
          <h3 className="mb-4 max-w-2xl font-serif text-3xl md:text-5xl">
            {title}
          </h3>
          {excerpt && (
            <p className="mb-6 max-w-xl text-base opacity-90 md:text-lg">
              {excerpt}
            </p>
          )}
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            {ctaLabel} <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'inline') {
    return (
      <Link
        to={href}
        className="flex items-center gap-4 rounded-md border bg-card p-4 transition-colors hover:bg-muted"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="h-16 w-16 flex-none rounded object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          {pick.label && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ec6d13]">
              {pick.label}
            </p>
          )}
          <p className="truncate font-serif text-lg">{title}</p>
          {excerpt && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{excerpt}</p>
          )}
        </div>
        <ArrowRight className="h-4 w-4 flex-none text-muted-foreground" />
      </Link>
    );
  }

  // card
  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      {imageUrl && (
        <div
          className="aspect-[16/9] w-full bg-muted bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="space-y-2 p-5">
        {pick.label && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#ec6d13]">
            {pick.label}
          </p>
        )}
        <h3 className="font-serif text-2xl">{title}</h3>
        {excerpt && (
          <p className="line-clamp-3 text-sm text-[#2c2c2c]/70">{excerpt}</p>
        )}
        <span className="inline-flex items-center gap-1 pt-2 text-xs font-bold uppercase tracking-widest text-[#ec6d13]">
          {ctaLabel} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export default ContentPicks;
