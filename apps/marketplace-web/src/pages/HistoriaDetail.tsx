/**
 * HistoriaDetail — Editorial Story Detail
 * Route: /historia/:slug
 *
 * Carga el post desde el CMS propio. Si la API devuelve 404 / error, intenta
 * resolverlo desde el FALLBACK estático para no romper la página.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { ArrowLeft, Clock, Share2, Map, Waypoints, Store } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  getProductsNew,
  getProductsByStore,
  getPrimaryImageUrl,
  getProductPrice,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import {
  getStoryKeywords,
  getFallbackBlogPostBySlug,
  ALCIDES_STORY_SLUG,
  ARTESOL_SHOP_SLUG,
} from "@/datafallback/fallbackBlogPosts";
import { getArtisanShopBySlug } from "@/services/artisan-shops.actions";
import type { BlogPost } from "@/services/blog-posts.actions";

// ── helpers ────────────────────────────────────────────
function normalize(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function productKeywordScore(
  product: ProductNewCore,
  keywords: string[],
): number {
  if (!keywords.length) return 0;
  const haystack = normalize(
    [
      product.name,
      product.shortDescription,
      product.history,
      product.artisanalIdentity?.primaryTechnique?.name,
      product.artisanalIdentity?.secondaryTechnique?.name,
      product.artisanalIdentity?.primaryCraft?.name,
      product.artisanalIdentity?.pieceType,
      product.artisanalIdentity?.style,
      product.artisanShop?.department,
      product.artisanShop?.municipality,
      product.artisanShop?.shopName,
      ...(product.materials || []).map((m) => m.material?.name),
    ]
      .filter(Boolean)
      .join(" "),
  );
  let score = 0;
  for (const kw of keywords) {
    const needle = normalize(kw);
    if (needle && haystack.includes(needle)) score += 1;
  }
  return score;
}

const HistoriaDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: apiArticle, isLoading, error } = useBlogPost(slug || "");

  // Fall back to baked-in entry when the API has nothing for this slug.
  const article: BlogPost | null = useMemo(() => {
    if (apiArticle) return apiArticle;
    if (error) return getFallbackBlogPostBySlug(slug);
    return null;
  }, [apiArticle, error, slug]);

  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [shopProducts, setShopProducts] = useState<ProductNewCore[]>([]);

  const isAlcides = slug === ALCIDES_STORY_SLUG;

  useEffect(() => {
    getProductsNew({ page: 1, limit: 100 })
      .then((res) => {
        const d = Array.isArray(res) ? res : res.data ?? [];
        setProducts(d as ProductNewCore[]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAlcides) return;
    let cancelled = false;
    (async () => {
      try {
        const shop = await getArtisanShopBySlug(ARTESOL_SHOP_SLUG);
        if (!shop || cancelled) return;
        const prods = await getProductsByStore(shop.id);
        if (!cancelled) setShopProducts(prods);
      } catch {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAlcides]);

  const relatedProducts = useMemo(() => {
    if (isAlcides) return shopProducts.slice(0, 8);
    if (!products.length) return [];
    const explicit = getStoryKeywords(article ?? null);
    const derived = article
      ? [
          ...(article.title?.split(/\s+/) ?? []),
          ...(article.category?.split(/\s+/) ?? []),
        ]
          .map((w) => w.replace(/[^\p{L}]/gu, ""))
          .filter((w) => w.length > 3)
      : [];
    const keywords = explicit.length ? explicit : derived;
    if (!keywords.length) return products.slice(0, 4);

    const scored = products
      .map((p) => ({ p, score: productKeywordScore(p, keywords) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);

    return (scored.length ? scored : products).slice(0, 4);
  }, [products, article, isAlcides, shopProducts]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt ?? undefined,
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

  if (!article) {
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

  const artesolCoverUrl =
    isAlcides && shopProducts.length > 0
      ? getPrimaryImageUrl(shopProducts[0])
      : null;
  const coverImageUrl = artesolCoverUrl || article.coverUrl;
  const publishDate = article.publishedAt ?? article.createdAt;

  return (
    <>
      <Helmet>
        <title>{article.title} | Historias TELAR</title>
        {article.excerpt && (
          <meta name="description" content={article.excerpt} />
        )}
        {coverImageUrl && (
          <meta property="og:image" content={coverImageUrl} />
        )}
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c]">
        {/* HERO */}
        <header className="max-w-[1400px] mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col items-center text-center">
          <div className="space-y-12 max-w-5xl mx-auto">
            <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#2c2c2c]/40 font-medium">
              <Link to="/" className="hover:text-[#2c2c2c] transition-colors">
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
              {article.excerpt && (
                <p className="text-xl md:text-2xl text-[#2c2c2c]/70 leading-relaxed font-light italic font-serif max-w-3xl mx-auto">
                  {article.excerpt}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] tracking-[0.2em] font-semibold uppercase text-[#2c2c2c]/50 pt-12 border-t border-[#2c2c2c]/10">
              {publishDate && (
                <span>
                  {format(new Date(publishDate), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              )}
              {article.category && <span>{article.category}</span>}
              {article.readingTimeMin && (
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {article.readingTimeMin} min lectura
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

        {/* COVER IMAGE */}
        {coverImageUrl && (
          <section className="max-w-[1400px] mx-auto px-6 pb-24">
            <div className="aspect-[21/9] overflow-hidden rounded-sm">
              <img
                src={coverImageUrl}
                alt={article.coverAlt ?? article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-4 text-[10px] tracking-widest text-[#2c2c2c]/40 uppercase text-center">
              {article.coverAlt ?? article.title}
            </p>
          </section>
        )}

        {/* BLOCKQUOTE OPENER */}
        {article.excerpt && (
          <section className="py-24 md:py-32 px-6 flex justify-center bg-white/50 border-y border-[#2c2c2c]/5">
            <div className="max-w-3xl text-center">
              <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mb-16" />
              <blockquote className="font-serif italic text-3xl md:text-4xl leading-relaxed text-[#2c2c2c]">
                "{article.excerpt}"
              </blockquote>
              <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mt-16" />
            </div>
          </section>
        )}

        {/* MAIN CONTENT (Markdown) */}
        {article.body && (
          <section className="py-24 md:py-32 px-6">
            <div className="max-w-3xl mx-auto prose prose-lg prose-neutral prose-headings:font-serif prose-headings:italic prose-a:text-[#ec6d13]">
              <ReactMarkdown>{article.body}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* AUTHOR */}
        {article.authorName && (
          <section className="py-20 bg-[#2c2c2c] text-[#f9f7f2] px-6">
            <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center space-y-6">
              <span className="text-[10px] text-[#ec6d13] uppercase tracking-[0.3em] font-bold">
                Escrito por
              </span>
              <h3 className="font-serif text-3xl italic">
                {article.authorName}
              </h3>
            </div>
          </section>
        )}

        {/* PRODUCTS */}
        {relatedProducts.length > 0 && (
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
              {relatedProducts.map((product) => {
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

        {/* SYSTEM NAVIGATION */}
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

        {/* CLOSING */}
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
