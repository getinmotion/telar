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

// ── Explore by story type ──────────────────────────
const STORY_TYPES = [
  { title: "Artesanos", subtitle: "Vida y Oficio", to: "/tiendas" },
  { title: "Territorios", subtitle: "Contexto Cultural", to: "/territorios" },
  { title: "Técnicas", subtitle: "Proceso y Conocimiento", to: "/tecnicas" },
  { title: "Piezas", subtitle: "Origen de Objetos", to: "/productos" },
];

const PER_PAGE = 12;

const Historias = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBlogPosts({ page, perPage: PER_PAGE });
  const [products, setProducts] = useState<ProductNewCore[]>([]);

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
    if (data && data.data.length > 0) return data.data;
    return FALLBACK_BLOG_POSTS;
  }, [data]);

  const total = data?.total ?? FALLBACK_BLOG_POSTS.length;
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
        {/* HERO */}
        <header className="max-w-[1400px] mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#2c2c2c]/40 font-bold">
              El Telar Digital
            </span>
            <h1 className="text-6xl md:text-8xl font-serif italic leading-[0.9] tracking-tight">
              Historias hechas a mano
            </h1>
            <p className="text-xl md:text-2xl text-[#2c2c2c]/70 leading-relaxed font-light italic font-serif max-w-3xl mx-auto">
              Detrás de cada pieza hay una historia humana. Crónicas de origen,
              saberes ancestrales y los rostros que dan vida a la artesanía
              colombiana.
            </p>
            <div className="pt-4">
              <a
                href="#featured"
                className="inline-block px-10 py-4 bg-[#ec6d13] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#2c2c2c] transition-colors duration-300"
              >
                Explorar historias
              </a>
            </div>
          </div>
        </header>

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

            {/* EXPLORAR POR RELATO */}
            <section className="max-w-[1400px] mx-auto px-6 py-10 md:py-10 border-y border-[#2c2c2c]/5">
              <div className="mb-16">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 text-[#2c2c2c]/40">
                  Navegar el archivo
                </h3>
                <p className="text-3xl md:text-4xl font-serif italic">
                  Explorar por relato
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                {STORY_TYPES.map((type) => (
                  <Link
                    key={type.title}
                    to={type.to}
                    className="group p-8 md:p-10 border border-[#2c2c2c]/10 hover:border-[#ec6d13]/30 hover:bg-white transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-px bg-[#ec6d13]/40 mx-auto mb-6 group-hover:w-16 transition-all" />
                    <h4 className="font-serif text-xl md:text-2xl italic mb-2 group-hover:text-[#ec6d13] transition-colors">
                      {type.title}
                    </h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#2c2c2c]/40 font-bold">
                      {type.subtitle}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

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
              <section className="max-w-[1400px] mx-auto px-6 py-24 md:py-32">
                <div className="mb-16">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 text-[#2c2c2c]/40">
                    Del Relato al Objeto
                  </h3>
                  <p className="text-3xl md:text-4xl font-serif italic">
                    Piezas que nacen de esta historia
                  </p>
                </div>
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

            {/* CULTURAL CAPSULE */}
            <section className="py-24 md:py-32 px-6 bg-white/50 border-y border-[#2c2c2c]/5">
              <div className="max-w-3xl mx-auto text-center">
                <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mb-16" />
                <blockquote className="font-serif italic text-3xl md:text-4xl leading-relaxed text-[#2c2c2c]">
                  "El oficio artesanal no es nostalgia: es memoria viva que se
                  reinventa con cada puntada, cada quema, cada trenzado."
                </blockquote>
                <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mt-16" />
              </div>
            </section>

            {/* RELATOS POR DESCUBRIR */}
            {discoverArticles.length > 0 && (
              <section className="max-w-[1400px] mx-auto px-6 py-24 md:py-32">
                <div className="mb-16">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 text-[#2c2c2c]/40">
                    Seguir leyendo
                  </h3>
                  <p className="text-3xl md:text-4xl font-serif italic">
                    Relatos por descubrir
                  </p>
                </div>
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

        {/* FINAL CTA */}
        <section className="bg-[#1a1a1a] py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-12 px-6">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[#ec6d13] font-bold">
                Continúa el viaje
              </p>
              <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] text-[#f9f7f2] italic">
                Cada pieza tiene una historia.
                <br />
                Cada historia, un territorio.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link
                to="/productos"
                className="px-12 py-4 bg-[#ec6d13] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#2c2c2c] transition-all"
              >
                Explorar piezas
              </Link>
              <Link
                to="/territorios"
                className="px-12 py-4 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] transition-all"
              >
                Ver territorios
              </Link>
              <Link
                to="/tiendas"
                className="px-12 py-4 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] transition-all"
              >
                Conocer talleres
              </Link>
            </div>
          </div>
        </section>

        <Footer showNewsletter />
      </div>
    </>
  );
};

export default Historias;
