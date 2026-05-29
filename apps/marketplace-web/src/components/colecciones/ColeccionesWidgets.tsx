/**
 * ColeccionesWidgets — widgets dinámicos para la página /colecciones.
 *
 * Cada widget trae su propia data (collections, taxonomy) y se monta a través
 * de `embedded_widget` desde el CMS. El curador decide DÓNDE aparece cada
 * uno en el flujo; el widget decide CÓMO se renderiza.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { useCollections } from '@/hooks/useCollections';
import { ContentPicks } from '@/components/cms/ContentPicks';

function nameToSlug(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Grid de colecciones publicadas en Mongo (cms_collections).
 */
export function CmsCollectionsGridWidget({
  kicker = 'Colecciones curadas',
}: {
  kicker?: string;
}) {
  const { data: cmsCollectionsRes } = useCollections({ limit: 50 });
  const cmsCollections = cmsCollectionsRes?.data ?? [];
  if (cmsCollections.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 pb-16">
      {kicker && (
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#ec6d13] font-bold mb-3">
          {kicker}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cmsCollections.map((c) => (
          <Link
            key={c._id}
            to={`/coleccion/${c.slug}`}
            className="group block overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <div
              className="aspect-[4/3] w-full bg-muted bg-cover bg-center"
              style={c.heroImageUrl ? { backgroundImage: `url(${c.heroImageUrl})` } : undefined}
            />
            <div className="space-y-2 p-5">
              {c.region && (
                <p className="text-[10px] uppercase tracking-widest text-[#ec6d13]">{c.region}</p>
              )}
              <h3 className="font-serif text-2xl">{c.title}</h3>
              {c.excerpt && (
                <p className="line-clamp-3 text-sm text-[#2c2c2c]/70">{c.excerpt}</p>
              )}
              <span className="inline-flex items-center gap-1 pt-2 text-xs font-bold uppercase tracking-widest text-[#ec6d13]">
                Ver colección <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * 3 columnas dinámicas: Por Colección (curatorialCategories), Por Territorio
 * (link al mapa), Por Técnica (chips desde taxonomy).
 *
 * El header (kicker + title) se renderiza arriba como `colecciones_archive_nav_header`
 * — este widget solo dibuja las tres columnas.
 */
export function ColeccionesArchiveColumnsWidget({
  col1Label = 'Por Colección',
  col2Label = 'Por Territorio',
  col3Label = 'Por Técnica',
  col2CtaLabel = 'Explorar el mapa',
  col2CtaHref = '/territorios',
}: {
  col1Label?: string;
  col2Label?: string;
  col3Label?: string;
  col2CtaLabel?: string;
  col2CtaHref?: string;
}) {
  const { curatorialCategories, techniques } = useTaxonomy();

  const col1 = (Array.isArray(curatorialCategories) ? curatorialCategories : []).slice(0, 5);
  const col3 = (Array.isArray(techniques) ? techniques : []).slice(0, 6);

  return (
    <section className="max-w-[1400px] mx-auto px-6 pb-20 md:pb-24 border-b border-[#2c2c2c]/10">
      <div className="grid lg:grid-cols-3 gap-12 md:gap-20">
        {/* Column 1: collections */}
        <div className="space-y-6 md:space-y-8">
          <h4 className="text-[11px] uppercase tracking-[0.25em] font-extrabold border-b border-[#2c2c2c]/10 pb-4 mb-2">
            {col1Label}
          </h4>
          <ul className="space-y-4">
            {col1.map((cat) => {
              const slug = nameToSlug(cat.name);
              return (
                <li key={cat.id}>
                  <Link
                    to={`/coleccion/${slug}`}
                    className="text-xl font-serif hover:italic hover:text-[#ec6d13] transition-all flex items-center justify-between group"
                  >
                    {cat.name}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Column 2: territory */}
        <div className="space-y-6 md:space-y-8">
          <h4 className="text-[11px] uppercase tracking-[0.25em] font-extrabold border-b border-[#2c2c2c]/10 pb-4 mb-2">
            {col2Label}
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                to={col2CtaHref}
                className="text-xl font-serif hover:italic hover:text-[#ec6d13] transition-all flex items-center justify-between group"
              >
                {col2CtaLabel}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: techniques */}
        <div className="space-y-6 md:space-y-8">
          <h4 className="text-[11px] uppercase tracking-[0.25em] font-extrabold border-b border-[#2c2c2c]/10 pb-4 mb-2">
            {col3Label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {col3.map((t) => {
              const slug = nameToSlug(t.name);
              return (
                <Link
                  key={t.id}
                  to={`/tecnica/${slug}`}
                  className="px-4 py-2 bg-[#2c2c2c]/[0.03] border border-[#2c2c2c]/5 rounded-full text-[10px] uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] hover:bg-white transition-all"
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Wrapper de ContentPicks para que pueda montarse como embedded_widget.
 */
export function ContentPicksWidget({
  pageKey = 'colecciones',
}: {
  pageKey?: string;
}) {
  return (
    <section className="max-w-[1400px] mx-auto px-6 pb-12">
      <ContentPicks pageKey={pageKey} />
    </section>
  );
}
