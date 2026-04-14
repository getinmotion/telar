/**
 * Blog / Historias Listing Page — Editorial Design
 * Route: /blog
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { useCMSBlogArticles } from "@/hooks/useCMSBlogArticles";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getStoryblokImageUrl } from "@/types/storyblok";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Blog = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useCMSBlogArticles(page, 12);

  const articles =
    data?.articles?.map((article) => ({
      id: article._uid,
      title: article.title,
      slug: article.slug,
      description: article.description,
      coverUrl: article.cover?.filename
        ? getStoryblokImageUrl(article.cover, {
            width: 800,
            height: 500,
            quality: 80,
          })
        : null,
      coverAlt: article.cover?.alt || article.title,
      category: article.category || null,
      authorName: article.author_name || null,
      publishedAt:
        article.first_published_at ||
        article.published_at ||
        new Date().toISOString(),
      readingTime: article.reading_time || 5,
    })) || [];

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 1;

  // Client-side search filter
  const filteredArticles = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  // Split: first article is featured, rest in grid
  const featured = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);

  return (
    <>
      <Helmet>
        <title>Historias - Cronicas del Territorio | TELAR</title>
        <meta
          name="description"
          content="Descubre las historias, tradiciones y tecnicas detras de las artesanias colombianas."
        />
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c]">
        {/* Hero */}
        <header className="max-w-[1400px] mx-auto px-6 py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#2c2c2c]/40 font-bold">
              El Telar Digital
            </span>
            <h1 className="text-6xl md:text-8xl font-serif italic leading-[0.9] tracking-tight">
              Historias
            </h1>
            <p className="text-xl text-[#2c2c2c]/70 leading-relaxed font-light italic font-serif max-w-2xl mx-auto">
              Cronicas de origen, tecnicas ancestrales y los rostros detras de
              cada pieza artesanal colombiana.
            </p>
            <div className="w-24 h-px bg-primary mx-auto mt-8" />
          </div>
        </header>

        {/* Search */}
        <div className="max-w-[1400px] mx-auto px-6 pb-16">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar historias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-[#2c2c2c]/20 py-3 text-center text-sm focus:ring-0 focus:border-[#2c2c2c] outline-none placeholder:text-[#2c2c2c]/30 transition-colors"
            />
          </div>
        </div>

        {error ? (
          <section className="py-32 px-6 text-center">
            <div className="max-w-xl mx-auto space-y-6">
              <h2 className="font-serif text-4xl italic">Proximamente</h2>
              <p className="text-[#2c2c2c]/60 leading-relaxed">
                Estamos preparando contenido increible sobre nuestros artesanos
                y sus tecnicas ancestrales.
              </p>
            </div>
          </section>
        ) : isLoading ? (
          <section className="max-w-[1400px] mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-6">
                  <div className="aspect-[16/10] bg-[#e5e1d8] rounded-sm" />
                  <div className="h-4 w-24 bg-[#e5e1d8] rounded" />
                  <div className="h-8 w-3/4 bg-[#e5e1d8] rounded" />
                  <div className="h-4 w-full bg-[#e5e1d8] rounded" />
                </div>
              ))}
            </div>
          </section>
        ) : filteredArticles.length === 0 ? (
          <section className="py-32 px-6 text-center">
            <h2 className="font-serif text-3xl italic mb-4">
              Sin resultados
            </h2>
            <p className="text-[#2c2c2c]/60">
              {searchQuery
                ? "No se encontraron historias con esa busqueda"
                : "Pronto publicaremos nuevas historias"}
            </p>
          </section>
        ) : (
          <section className="max-w-[1400px] mx-auto px-6 pb-32">
            {/* Featured Article */}
            {featured && (
              <Link
                to={`/blog/${featured.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-center"
              >
                <div className="aspect-[16/10] bg-[#e5e1d8] overflow-hidden rounded-sm">
                  {featured.coverUrl && (
                    <img
                      src={featured.coverUrl}
                      alt={featured.coverAlt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="space-y-6">
                  {featured.category && (
                    <span className="text-[10px] text-primary uppercase tracking-[0.3em] font-bold">
                      {featured.category}
                    </span>
                  )}
                  <h2 className="font-serif text-4xl lg:text-5xl italic leading-tight group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  {featured.description && (
                    <p className="text-lg text-[#2c2c2c]/70 leading-relaxed font-light">
                      {featured.description}
                    </p>
                  )}
                  <div className="flex items-center gap-6 text-[10px] tracking-[0.2em] font-semibold uppercase text-[#2c2c2c]/40 pt-6 border-t border-[#2c2c2c]/5">
                    <span>
                      {format(
                        new Date(featured.publishedAt),
                        "d MMM yyyy",
                        { locale: es }
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featured.readingTime} min
                    </span>
                    {featured.authorName && (
                      <span>Por {featured.authorName}</span>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Articles Grid */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                {gridArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="group space-y-6"
                  >
                    <div className="aspect-[16/10] bg-[#e5e1d8] overflow-hidden rounded-sm">
                      {article.coverUrl && (
                        <img
                          src={article.coverUrl}
                          alt={article.coverAlt}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div className="space-y-3">
                      {article.category && (
                        <span className="text-[10px] text-primary uppercase tracking-[0.3em] font-bold">
                          {article.category}
                        </span>
                      )}
                      <h3 className="font-serif text-2xl leading-tight group-hover:italic transition-all">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-sm text-[#2c2c2c]/60 leading-relaxed font-light line-clamp-3">
                          {article.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-[9px] tracking-widest font-semibold uppercase text-[#2c2c2c]/30 pt-4 border-t border-[#2c2c2c]/5">
                        <span>
                          {format(
                            new Date(article.publishedAt),
                            "d MMM yyyy",
                            { locale: es }
                          )}
                        </span>
                        <span>{article.readingTime} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-32 flex justify-center items-center gap-6">
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
                            : "text-[#2c2c2c]/40 hover:text-[#2c2c2c]"
                        )}
                      >
                        {p}
                      </button>
                    )
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
          </section>
        )}

        {/* CTA Section */}
        <section className="py-32 bg-[#2c2c2c] text-[#f9f7f2] text-center">
          <div className="max-w-3xl mx-auto px-6 space-y-10">
            <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
              Cada pieza tiene una historia. Cada historia, un territorio.
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/productos"
                className="px-12 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#2c2c2c] transition-all"
              >
                Explorar piezas
              </Link>
              <Link
                to="/tiendas"
                className="px-12 py-4 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
              >
                Conocer talleres
              </Link>
            </div>
          </div>
        </section>

        <div className="pb-24" />
        <Footer showNewsletter />
      </div>
    </>
  );
};

export default Blog;
