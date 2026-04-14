/**
 * BlogArticle Page — Editorial Historia Design
 * Route: /blog/:slug
 * Reference: telar_historia_interna_refinamiento_editorial_final
 */

import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { useCMSBlogArticle } from "@/hooks/useCMSBlogArticle";
import { StoryblokRichText } from "@/components/StoryblokRichText";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { getStoryblokImageUrl } from "@/types/storyblok";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useCMSBlogArticle(slug || "");

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
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="font-serif text-4xl italic">
            Articulo no encontrado
          </h1>
          <p className="text-[#2c2c2c]/60">
            El articulo que buscas no existe o ha sido eliminado.
          </p>
          <Link
            to="/historias"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver a Historias
          </Link>
        </div>
        <Footer showNewsletter />
      </div>
    );
  }

  const coverImageUrl = getStoryblokImageUrl(article.cover, {
    width: 1200,
    height: 630,
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
        {/* HERO — Narrative Entry */}
        <header className="max-w-[1400px] mx-auto px-6 py-32 flex flex-col items-center text-center">
          <div className="space-y-12 max-w-5xl mx-auto">
            <div className="space-y-8">
              <span className="inline-block text-[10px] uppercase tracking-[0.4em] text-[#2c2c2c]/40 font-bold">
                {article.category || "Cronica del Territorio"}
              </span>
              <h1 className="text-5xl md:text-8xl leading-[0.9] font-serif italic tracking-tight">
                {article.title}
              </h1>
              {article.description && (
                <p className="text-xl md:text-2xl text-[#2c2c2c]/70 leading-relaxed font-light italic font-serif max-w-3xl mx-auto">
                  {article.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] tracking-[0.2em] font-semibold uppercase text-[#2c2c2c]/50 pt-12 border-t border-[#2c2c2c]/10">
              {publishDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {format(new Date(publishDate), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </div>
              )}
              {article.reading_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {article.reading_time} min lectura
                </div>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Compartir
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
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

        {/* Scenic Opening — Description as blockquote */}
        {article.description && (
          <section className="py-32 px-6 flex justify-center bg-white/50 border-y border-[#2c2c2c]/5">
            <div className="max-w-3xl text-center">
              <div className="w-16 h-px bg-primary/40 mx-auto mb-16" />
              <blockquote className="font-serif italic text-3xl md:text-4xl leading-relaxed text-[#2c2c2c]">
                "{article.description}"
              </blockquote>
              <div className="w-16 h-px bg-primary/40 mx-auto mt-16" />
            </div>
          </section>
        )}

        {/* Main Content */}
        {article.content && (
          <section className="py-32 px-6">
            <div className="max-w-3xl mx-auto prose prose-lg prose-neutral">
              <StoryblokRichText content={article.content} />
            </div>
          </section>
        )}

        {/* Author Section */}
        {article.author_name && (
          <section className="py-24 bg-[#2c2c2c] text-[#f9f7f2] px-6">
            <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center space-y-6">
              <span className="text-[10px] text-primary uppercase tracking-[0.3em] font-bold">
                Escrito por
              </span>
              <h3 className="font-serif text-3xl italic">
                {article.author_name}
              </h3>
            </div>
          </section>
        )}

        {/* System Navigation */}
        <section className="py-24 bg-white border-y border-[#2c2c2c]/5">
          <div className="max-w-4xl mx-auto px-6">
            <h4 className="text-[10px] font-bold tracking-[0.4em] text-center text-[#2c2c2c]/30 mb-16 uppercase">
              Profundizar en la huella
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Link to="/tiendas" className="group text-center space-y-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center text-primary text-3xl">
                  ✦
                </div>
                <div>
                  <span className="block text-2xl font-serif group-hover:italic transition-all">
                    Conocer talleres
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 font-bold">
                    Artesanos de Colombia
                  </span>
                </div>
              </Link>
              <Link to="/productos" className="group text-center space-y-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center text-primary text-3xl">
                  ◆
                </div>
                <div>
                  <span className="block text-2xl font-serif group-hover:italic transition-all">
                    Explorar piezas
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 font-bold">
                    Coleccion completa
                  </span>
                </div>
              </Link>
              <Link to="/historias" className="group text-center space-y-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center text-primary text-3xl">
                  ●
                </div>
                <div>
                  <span className="block text-2xl font-serif group-hover:italic transition-all">
                    Mas historias
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 font-bold">
                    Cronicas del territorio
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final Narrative Closing */}
        <section className="py-40 px-6 text-center bg-[#f9f7f2]">
          <div className="max-w-3xl mx-auto space-y-16">
            <blockquote className="text-4xl md:text-5xl font-serif italic text-[#2c2c2c] leading-[1.1]">
              "Cada puntada es un susurro de nuestros ancestros."
            </blockquote>
            <Link
              to="/historias"
              className="inline-block bg-[#2c2c2c] text-white px-12 py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-primary transition-all duration-500 shadow-lg"
            >
              Descubrir mas relatos del territorio
            </Link>
            <div className="pt-24 opacity-30">
              <p className="text-[9px] tracking-[0.5em] uppercase font-bold">
                El Telar Digital · Cronicas de Origen
              </p>
            </div>
          </div>
        </section>

        <div className="pb-24" />
        <Footer showNewsletter />
      </div>
    </>
  );
};

export default BlogArticle;
