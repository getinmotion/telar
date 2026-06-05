/**
 * Historias — Editorial Stories Archive
 * Route: /historias
 *
 * Listado público de blog posts. Datos del CMS propio (Mongo) vía
 * /blog-posts. FALLBACK con historias quemadas cuando el endpoint está vacío.
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import { cn } from "@/lib/utils";
import { FALLBACK_BLOG_POSTS } from "@/datafallback/fallbackBlogPosts";
import type { BlogPost } from "@/services/blog-posts.actions";
import { useCmsSections } from "@/hooks/useCmsSections";
import { CmsSectionRenderer } from "@/components/cms/CmsSectionRenderer";
import type { CmsSection } from "@/services/cms-sections.actions";

const PER_PAGE = 12;

/* ── Fallback editorial — solo si CMS no responde ─────────────────── */
const FALLBACK_HISTORIAS_SECTIONS: CmsSection[] = [
  {
    id: "fallback-hist-hero",
    pageKey: "historias",
    position: 0,
    type: "historias_hero",
    published: true,
    payload: {
      kicker: "El Telar Digital",
      title: "Historias hechas a mano",
      body: "Detrás de cada pieza hay una historia humana. Crónicas de origen, saberes ancestrales y los rostros que dan vida a la artesanía colombiana.",
      ctaLabel: "Explorar historias",
      ctaHref: "#featured",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-hist-story-types",
    pageKey: "historias",
    position: 10,
    type: "historias_story_types_grid",
    published: true,
    payload: {
      kicker: "Navegar el archivo",
      title: "Explorar por relato",
      cards: [
        { title: "Artesanos",   subtitle: "Vida y Oficio",          href: "/tiendas"     },
        { title: "Territorios", subtitle: "Contexto Cultural",      href: "/territorios" },
        { title: "Técnicas",    subtitle: "Proceso y Conocimiento", href: "/tecnicas"    },
        { title: "Piezas",      subtitle: "Origen de Objetos",      href: "/productos"   },
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-hist-products-header",
    pageKey: "historias",
    position: 20,
    type: "home_section_header",
    published: true,
    payload: {
      slot: "historias_products",
      kicker: "Del Relato al Objeto",
      title: "Piezas que nacen de esta historia",
      italicTitle: true,
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-hist-capsule",
    pageKey: "historias",
    position: 30,
    type: "historias_capsule_quote",
    published: true,
    payload: {
      body: '"El oficio artesanal no es nostalgia: es memoria viva que se reinventa con cada puntada, cada quema, cada trenzado."',
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-hist-discover-header",
    pageKey: "historias",
    position: 40,
    type: "home_section_header",
    published: true,
    payload: {
      slot: "historias_discover",
      kicker: "Seguir leyendo",
      title: "Relatos por descubrir",
      italicTitle: true,
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-hist-final-cta",
    pageKey: "historias",
    position: 50,
    type: "historias_final_cta",
    published: true,
    payload: {
      kicker: "Continúa el viaje",
      titleLineTop: "Cada pieza tiene una historia.",
      titleLineBottom: "Cada historia, un territorio.",
      ctas: [
        { label: "Explorar piezas",  href: "/productos",   variant: "primary" },
        { label: "Ver territorios",  href: "/territorios", variant: "outline" },
        { label: "Conocer talleres", href: "/tiendas",     variant: "outline" },
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
];

const Historias = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBlogPosts({ page, perPage: PER_PAGE });
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const { data: cmsSections } = useCmsSections("historias");
  const sections =
    cmsSections && cmsSections.length > 0 ? cmsSections : FALLBACK_HISTORIAS_SECTIONS;
  const heroSection = sections.find((s) => s.type === "historias_hero");
  const storyTypesSection = sections.find((s) => s.type === "historias_story_types_grid");
  const productsHeaderSection = sections.find(
    (s) => s.type === "home_section_header" && s.payload?.slot === "historias_products",
  );
  const capsuleSection = sections.find((s) => s.type === "historias_capsule_quote");
  const discoverHeaderSection = sections.find(
    (s) => s.type === "home_section_header" && s.payload?.slot === "historias_discover",
  );
  const finalCtaSection = sections.find((s) => s.type === "historias_final_cta");

  useEffect(() => {
    getProductsNew({ page: 1, limit: 8 })
      .then((res) => {
        const d = Array.isArray(res) ? res : res.data ?? [];
        setProducts(d as ProductNewCore[]);
      })
      .catch(() => {});
  }, []);

  // Use API data when available; cold-start / outage falls back to baked-in posts.
  const articles: BlogPost[] = useMemo(() => {
    const apiData = Array.isArray(data?.data) ? data!.data : [];
    if (apiData.length > 0) return apiData;
    return FALLBACK_BLOG_POSTS;
  }, [data]);

  const total = typeof data?.total === 'number' ? data.total : FALLBACK_BLOG_POSTS.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Split articles for featured grid (first 3) + rest
  const featured = articles[0];
  const sideFeatured = articles.slice(1, 3);
  const discoverArticles = articles.slice(3, 6);
  const remainingArticles = articles.slice(6);

  return (
    <>
      <Helmet>
        <title>Historias — Crónicas del Territorio | TELAR</title>
        <meta
          name="description"
          content="Descubre las historias, tradiciones y técnicas detrás de las artesanías colombianas. Relatos de vida, oficio y territorio."
        />
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c]">
        {/* HERO (CMS) */}
        {heroSection && <CmsSectionRenderer section={heroSection} />}

        {isLoading ? (
          <section className="max-w-[1400px] mx-auto px-6 pb-32 animate-pulse">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-7">
                <div className="aspect-[16/10] bg-[#e5e1d8] rounded-sm" />
                <div className="mt-6 h-8 w-3/4 bg-[#e5e1d8] rounded" />
              </div>
              <div className="col-span-12 lg:col-span-5 space-y-8">
                <div className="aspect-[16/9] bg-[#e5e1d8] rounded-sm" />
                <div className="aspect-[16/9] bg-[#e5e1d8] rounded-sm" />
              </div>
            </div>
          </section>
        ) : articles.length === 0 ? (
          <section className="py-32 px-6 text-center">
            <h2 className="font-serif text-3xl italic mb-4">
              Pronto publicaremos nuevas historias
            </h2>
            <p className="text-[#2c2c2c]/60">
              Estamos documentando los relatos de nuestros artesanos.
            </p>
          </section>
        ) : (
          <>
            {/* FEATURED STORIES GRID */}
            <section
              id="featured"
              className="max-w-[1400px] mx-auto px-6 pb-10 md:pb-10"
            >
              <div className="grid grid-cols-12 gap-6 md:gap-8 items-start">
                {featured && (
                  <Link
                    to={`/historia/${featured.slug}`}
                    className="col-span-12 lg:col-span-7 group"
                  >
                    <div className="aspect-[16/10] bg-[#e5e1d8] overflow-hidden rounded-sm">
                      {featured.coverUrl && (
                        <img
                          src={featured.coverUrl}
                          alt={featured.coverAlt ?? featured.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div className="mt-6 space-y-3">
                      {featured.category && (
                        <span className="text-[10px] text-[#ec6d13] uppercase tracking-[0.3em] font-bold">
                          {featured.category}
                        </span>
                      )}
                      <h2 className="font-serif text-4xl md:text-5xl italic leading-tight group-hover:text-[#ec6d13] transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-lg text-[#2c2c2c]/60 leading-relaxed font-light line-clamp-2 max-w-xl">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-[9px] tracking-[0.2em] font-semibold uppercase text-[#2c2c2c]/40 pt-4 border-t border-[#2c2c2c]/5">
                        {featured.category && <span>{featured.category}</span>}
                        {featured.readingTimeMin && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {featured.readingTimeMin} min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 md:gap-8 lg:mt-12">
                  {sideFeatured.map((article) => (
                    <Link
                      key={article._id}
                      to={`/historia/${article.slug}`}
                      className="group flex flex-col"
                    >
                      <div className="aspect-[16/9] bg-[#e5e1d8] overflow-hidden rounded-sm">
                        {article.coverUrl && (
                          <img
                            src={article.coverUrl}
                            alt={article.coverAlt ?? article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        {article.category && (
                          <span className="text-[9px] text-[#ec6d13] uppercase tracking-[0.3em] font-bold">
                            {article.category}
                          </span>
                        )}
                        <h3 className="font-serif text-2xl leading-tight group-hover:italic transition-all">
                          {article.title}
                        </h3>
                        {article.readingTimeMin && (
                          <div className="flex items-center gap-3 text-[9px] tracking-widest font-semibold uppercase text-[#2c2c2c]/30 pt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.readingTimeMin} min
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* EXPLORAR POR RELATO (CMS) */}
            {storyTypesSection && <CmsSectionRenderer section={storyTypesSection} />}

            {/* IMMERSIVE DARK BLOCK — GRAN RELATO */}
            {featured && (
              <section className="bg-[#2c2c2c] text-[#f9f7f2] py-24 md:py-32">
                <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
                  <div className="space-y-8">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-[#f9f7f2]/40 font-bold">
                      Gran Relato
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif italic leading-tight">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-xl text-[#f9f7f2]/70 leading-relaxed font-light italic max-w-lg">
                        {featured.excerpt}
                      </p>
                    )}
                    <Link
                      to={`/historia/${featured.slug}`}
                      className="inline-block px-10 py-4 border-2 border-[#f9f7f2] text-[#f9f7f2] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#f9f7f2] hover:text-[#2c2c2c] transition-all duration-300"
                    >
                      Leer la historia completa
                    </Link>
                  </div>
                  <div>
                    {featured.coverUrl ? (
                      <img
                        src={featured.coverUrl}
                        alt={featured.coverAlt ?? featured.title}
                        className="aspect-[4/5] w-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="aspect-[4/5] w-full bg-[#3a3a3a]" />
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* PRODUCTS */}
            {products.length > 0 && (
              <section className="max-w-[1400px] mx-auto px-6 py-20 md:py-20">
                {productsHeaderSection ? (
                  <CmsSectionRenderer section={productsHeaderSection} />
                ) : null}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                  {products.slice(0, 4).map((product) => {
                    const img = getPrimaryImageUrl(product);
                    const price = getProductPrice(product);
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group space-y-4"
                      >
                        <div className="aspect-square overflow-hidden bg-[#e5e1d8]">
                          {img && (
                            <img
                              src={img}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-serif text-lg leading-tight group-hover:text-[#ec6d13] transition-colors line-clamp-2">
                            {product.name}
                          </h4>
                          {price != null && (
                            <p className="text-sm font-bold text-[#2c2c2c]">
                              {formatCurrency(price)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* CULTURAL CAPSULE (CMS) */}
            {capsuleSection && <CmsSectionRenderer section={capsuleSection} />}

            {/* RELATOS POR DESCUBRIR */}
            {discoverArticles.length > 0 && (
              <section className="max-w-[1400px] mx-auto px-6 py-24 md:py-32">
                {discoverHeaderSection ? (
                  <CmsSectionRenderer section={discoverHeaderSection} />
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                  {discoverArticles.map((article) => (
                    <Link
                      key={article._id}
                      to={`/historia/${article.slug}`}
                      className="group space-y-6"
                    >
                      <div className="aspect-[4/5] bg-[#e5e1d8] overflow-hidden rounded-sm">
                        {article.coverUrl && (
                          <img
                            src={article.coverUrl}
                            alt={article.coverAlt ?? article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <div className="space-y-3">
                        {article.category && (
                          <span className="text-[9px] text-[#ec6d13] uppercase tracking-[0.3em] font-bold">
                            {article.category}
                          </span>
                        )}
                        <h3 className="font-serif text-2xl leading-tight group-hover:italic transition-all">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-[#2c2c2c]/60 leading-relaxed font-light line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-[9px] tracking-widest font-semibold uppercase text-[#2c2c2c]/30 pt-4 border-t border-[#2c2c2c]/5">
                          {article.publishedAt && (
                            <span>
                              {format(
                                new Date(article.publishedAt),
                                "d MMM yyyy",
                                { locale: es },
                              )}
                            </span>
                          )}
                          {article.readingTimeMin && (
                            <span>{article.readingTimeMin} min</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* REMAINING ARTICLES GRID */}
            {remainingArticles.length > 0 && (
              <section className="max-w-[1400px] mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                  {remainingArticles.map((article) => (
                    <Link
                      key={article._id}
                      to={`/historia/${article.slug}`}
                      className="group space-y-6"
                    >
                      <div className="aspect-[16/10] bg-[#e5e1d8] overflow-hidden rounded-sm">
                        {article.coverUrl && (
                          <img
                            src={article.coverUrl}
                            alt={article.coverAlt ?? article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <div className="space-y-3">
                        {article.category && (
                          <span className="text-[10px] text-[#ec6d13] uppercase tracking-[0.3em] font-bold">
                            {article.category}
                          </span>
                        )}
                        <h3 className="font-serif text-2xl leading-tight group-hover:italic transition-all">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-[9px] tracking-widest font-semibold uppercase text-[#2c2c2c]/30 pt-4 border-t border-[#2c2c2c]/5">
                          {article.publishedAt && (
                            <span>
                              {format(
                                new Date(article.publishedAt),
                                "d MMM yyyy",
                                { locale: es },
                              )}
                            </span>
                          )}
                          {article.readingTimeMin && (
                            <span>{article.readingTimeMin} min</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="max-w-[1400px] mx-auto px-6 pb-24 flex justify-center items-center gap-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="disabled:opacity-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors",
                          p === page
                            ? "bg-[#2c2c2c] text-white"
                            : "text-[#2c2c2c]/40 hover:text-[#2c2c2c]",
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="disabled:opacity-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* FINAL CTA (CMS) */}
        {finalCtaSection && <CmsSectionRenderer section={finalCtaSection} />}

        <Footer showNewsletter />
      </div>
    </>
  );
};

export default Historias;
