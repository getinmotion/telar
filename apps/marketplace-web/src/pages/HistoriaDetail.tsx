/**
 * HistoriaDetail — Editorial Story Detail
 * Route: /historia/:slug
 * Reference: telar_historia_interna_refinamiento_editorial_final
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { useCMSBlogArticle } from "@/hooks/useCMSBlogArticle";
import { StoryblokRichText } from "@/components/StoryblokRichText";
import { ArrowLeft, Clock, Share2, Map, Waypoints, Store } from "lucide-react";
import { getStoryblokImageUrl } from "@/types/storyblok";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";

const HistoriaDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useCMSBlogArticle(slug || "");
  const [products, setProducts] = useState<ProductNewCore[]>([]);

  useEffect(() => {
    getProductsNew({ page: 1, limit: 8 })
      .then((res) => {
        const d = Array.isArray(res) ? res : res.data ?? [];
        setProducts(d as ProductNewCore[]);
      })
      .catch(() => {});
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url,
        });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2]">
        <div className="max-w-[1400px] mx-auto px-6 py-32 animate-pulse space-y-16">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="h-4 w-40 bg-[#e5e1d8] mx-auto rounded" />
            <div className="h-20 w-full bg-[#e5e1d8] rounded" />
            <div className="h-6 w-96 bg-[#e5e1d8] mx-auto rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex flex-col items-center justify-center gap-6">
        <h1 className="font-serif text-4xl italic">Historia no encontrada</h1>
        <p className="text-[#2c2c2c]/60">
          La historia que buscas no existe o ha sido eliminada.
        </p>
        <Link
          to="/historias"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-[#ec6d13] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Volver a Historias
        </Link>
        <Footer showNewsletter />
      </div>
    );
  }

  const coverImageUrl = getStoryblokImageUrl(article.cover, {
    width: 1400,
    height: 660,
    quality: 85,
  });
  const publishDate = article.first_published_at || article.published_at;

  return (
    <>
      <Helmet>
        <title>{article.title} | Historias TELAR</title>
        <meta name="description" content={article.description} />
        {coverImageUrl && (
          <meta property="og:image" content={coverImageUrl} />
        )}
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c]">
        {/* ═══════════════ HERO — NARRATIVE ENTRY ═══════════════ */}
        <header className="max-w-[1400px] mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col items-center text-center">
          <div className="space-y-12 max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#2c2c2c]/40 font-medium">
              <Link
                to="/"
                className="hover:text-[#2c2c2c] transition-colors"
              >
                Inicio
              </Link>
              <span>/</span>
              <Link
                to="/historias"
                className="hover:text-[#2c2c2c] transition-colors"
              >
                Historias
              </Link>
              <span>/</span>
              <span className="text-[#ec6d13] truncate max-w-[200px]">
                {article.title}
              </span>
            </nav>

            <div className="space-y-8">
              <span className="inline-block text-[10px] uppercase tracking-[0.4em] text-[#ec6d13] font-bold">
                {article.category || "Crónica del Territorio"}
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] font-serif italic tracking-tight">
                {article.title}
              </h1>
              {article.description && (
                <p className="text-xl md:text-2xl text-[#2c2c2c]/70 leading-relaxed font-light italic font-serif max-w-3xl mx-auto">
                  {article.description}
                </p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] tracking-[0.2em] font-semibold uppercase text-[#2c2c2c]/50 pt-12 border-t border-[#2c2c2c]/10">
              {publishDate && (
                <span>
                  {format(new Date(publishDate), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              )}
              {article.category && <span>{article.category}</span>}
              {article.reading_time && (
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {article.reading_time} min lectura
                </span>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-[#ec6d13] transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Compartir
              </button>
            </div>
          </div>
        </header>

        {/* ═══════════════ COVER IMAGE ═══════════════ */}
        {coverImageUrl && (
          <section className="max-w-[1400px] mx-auto px-6 pb-24">
            <div className="aspect-[21/9] overflow-hidden rounded-sm">
              <img
                src={coverImageUrl}
                alt={article.cover?.alt || article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-4 text-[10px] tracking-widest text-[#2c2c2c]/40 uppercase text-center">
              {article.cover?.alt || article.title}
            </p>
          </section>
        )}

        {/* ═══════════════ SCENIC OPENING — BLOCKQUOTE ═══════════════ */}
        {article.description && (
          <section className="py-24 md:py-32 px-6 flex justify-center bg-white/50 border-y border-[#2c2c2c]/5">
            <div className="max-w-3xl text-center">
              <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mb-16" />
              <blockquote className="font-serif italic text-3xl md:text-4xl leading-relaxed text-[#2c2c2c]">
                "{article.description}"
              </blockquote>
              <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mt-16" />
            </div>
          </section>
        )}

        {/* ═══════════════ MAIN CONTENT (CMS RICH TEXT) ═══════════════ */}
        {article.content && (
          <section className="py-24 md:py-32 px-6">
            <div className="max-w-3xl mx-auto prose prose-lg prose-neutral prose-headings:font-serif prose-headings:italic prose-a:text-[#ec6d13]">
              <StoryblokRichText content={article.content} />
            </div>
          </section>
        )}

        {/* ═══════════════ AUTHOR SECTION ═══════════════ */}
        {article.author_name && (
          <section className="py-20 bg-[#2c2c2c] text-[#f9f7f2] px-6">
            <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center space-y-6">
              <span className="text-[10px] text-[#ec6d13] uppercase tracking-[0.3em] font-bold">
                Escrito por
              </span>
              <h3 className="font-serif text-3xl italic">
                {article.author_name}
              </h3>
            </div>
          </section>
        )}

        {/* ═══════════════ PRODUCTS — DEL RELATO AL OBJETO ═══════════════ */}
        {products.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-6 py-24 md:py-32">
            <div className="mb-16 text-center">
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

        {/* ═══════════════ SYSTEM NAVIGATION ═══════════════ */}
        <section className="py-24 bg-white border-y border-[#2c2c2c]/5">
          <div className="max-w-4xl mx-auto px-6">
            <h4 className="text-[10px] font-bold tracking-[0.4em] text-center text-[#2c2c2c]/30 mb-16 uppercase">
              Profundizar en la huella
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Link to="/tiendas" className="group text-center space-y-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center">
                  <Store className="w-8 h-8 text-[#ec6d13]" />
                </div>
                <div>
                  <span className="block text-2xl font-serif group-hover:italic transition-all">
                    Conocer el taller
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 font-bold">
                    Artesanos de Colombia
                  </span>
                </div>
              </Link>
              <Link to="/tecnicas" className="group text-center space-y-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center">
                  <Waypoints className="w-8 h-8 text-[#ec6d13]" />
                </div>
                <div>
                  <span className="block text-2xl font-serif group-hover:italic transition-all">
                    Explorar técnica
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 font-bold">
                    Archivo de técnicas
                  </span>
                </div>
              </Link>
              <Link to="/territorios" className="group text-center space-y-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center">
                  <Map className="w-8 h-8 text-[#ec6d13]" />
                </div>
                <div>
                  <span className="block text-2xl font-serif group-hover:italic transition-all">
                    Ver territorio
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 font-bold">
                    Mapa de regiones
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ NARRATIVE CLOSING ═══════════════ */}
        <section className="py-32 md:py-40 px-6 text-center bg-[#f9f7f2]">
          <div className="max-w-3xl mx-auto space-y-16">
            <blockquote className="text-4xl md:text-5xl font-serif italic text-[#2c2c2c] leading-[1.1]">
              "Cada puntada es un susurro de nuestros ancestros."
            </blockquote>
            <Link
              to="/historias"
              className="inline-block bg-[#2c2c2c] text-white px-12 py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-[#ec6d13] transition-all duration-500 shadow-lg"
            >
              Descubrir más relatos del territorio
            </Link>
            <div className="pt-24 opacity-30">
              <p className="text-[9px] tracking-[0.5em] uppercase font-bold">
                El Telar Digital · Crónicas de Origen
              </p>
            </div>
          </div>
        </section>

        <Footer showNewsletter />
      </div>
    </>
  );
};

export default HistoriaDetail;
