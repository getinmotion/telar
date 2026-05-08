/**
 * CollectionBlocksRenderer — pinta los bloques de una colección CMS.
 */
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { ExploreProductCard } from '@/components/ExploreProductCard';
import { getProductsByIds } from '@/services/products-new.actions';
import type { CollectionBlock } from '@/services/collections.actions';

interface Props {
  blocks: CollectionBlock[];
}

export function CollectionBlocksRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="space-y-16">
      {blocks.map((block, i) => (
        <BlockSwitch key={i} block={block} />
      ))}
    </div>
  );
}

function BlockSwitch({ block }: { block: CollectionBlock }) {
  switch (block.type) {
    case 'text':
      return <TextBlock {...(block.payload as any)} />;
    case 'image':
      return <ImageBlock {...(block.payload as any)} />;
    case 'gallery':
      return <GalleryBlock {...(block.payload as any)} />;
    case 'product_grid':
      return <ProductGridBlock {...(block.payload as any)} />;
    case 'manifest':
      return <ManifestBlock {...(block.payload as any)} />;
    case 'quote':
      return <QuoteBlock {...(block.payload as any)} />;
    default:
      return null;
  }
}

function TextBlock({ kicker, title, body }: { kicker?: string; title?: string; body?: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4">
      {kicker && (
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{kicker}</p>
      )}
      {title && <h2 className="mb-4 text-3xl font-semibold">{title}</h2>}
      {body && (
        <div className="prose prose-neutral max-w-none">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      )}
    </section>
  );
}

function ImageBlock({
  url,
  alt,
  caption,
  fullWidth,
}: {
  url: string;
  alt?: string;
  caption?: string;
  fullWidth?: boolean;
}) {
  if (!url) return null;
  return (
    <figure className={fullWidth ? 'w-full' : 'mx-auto max-w-4xl px-4'}>
      <img src={url} alt={alt ?? ''} className="w-full rounded-lg object-cover" loading="lazy" />
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

function GalleryBlock({
  images,
  columns,
}: {
  images: { url: string; alt?: string }[];
  columns?: number;
}) {
  const cols = columns ?? 3;
  const colsClass =
    cols === 4 ? 'md:grid-cols-4' : cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
  if (!images || images.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className={`grid grid-cols-2 gap-3 ${colsClass}`}>
        {images.map((img, i) =>
          img.url ? (
            <img
              key={i}
              src={img.url}
              alt={img.alt ?? ''}
              loading="lazy"
              className="aspect-square w-full rounded-md object-cover"
            />
          ) : null,
        )}
      </div>
    </section>
  );
}

function QuoteBlock({ body, attribution }: { body: string; attribution?: string }) {
  if (!body) return null;
  return (
    <section className="mx-auto max-w-3xl px-4">
      <blockquote className="border-l-4 border-primary pl-6 text-xl italic">
        “{body}”
        {attribution && (
          <footer className="mt-3 text-sm not-italic text-muted-foreground">— {attribution}</footer>
        )}
      </blockquote>
    </section>
  );
}

function ManifestBlock({
  kicker,
  sections,
}: {
  kicker?: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <section className="mx-auto max-w-4xl px-4">
      {kicker && (
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">{kicker}</p>
      )}
      <div className="space-y-6">
        {(sections ?? []).map((s, i) => (
          <div key={i}>
            {s.title && <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>}
            {s.body && (
              <div className="prose prose-neutral max-w-none">
                <ReactMarkdown>{s.body}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductGridBlock({
  kicker,
  title,
  productIds,
  columns,
}: {
  kicker?: string;
  title?: string;
  productIds: string[];
  columns?: number;
}) {
  const cols = columns ?? 3;
  const colsClass =
    cols === 4 ? 'lg:grid-cols-4' : cols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';

  const { data: products, isLoading } = useQuery({
    queryKey: ['collection-products', productIds],
    queryFn: () => getProductsByIds(productIds),
    enabled: Array.isArray(productIds) && productIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (!productIds || productIds.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4">
      {kicker && (
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{kicker}</p>
      )}
      {title && <h2 className="mb-6 text-2xl font-semibold">{title}</h2>}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {productIds.slice(0, 6).map((id) => (
            <div key={id} className="aspect-[3/4] animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${colsClass}`}>
          {(products ?? []).map((p) => (
            <ExploreProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
