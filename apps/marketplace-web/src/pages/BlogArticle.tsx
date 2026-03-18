import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCMSBlogArticle } from "@/hooks/useCMSBlogArticle";
import { StoryblokRichText } from "@/components/StoryblokRichText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { getStoryblokImageUrl } from "@/types/storyblok";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useCMSBlogArticle(slug || '');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="aspect-[21/9] w-full rounded-xl mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Artículo no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              El artículo que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const coverImageUrl = getStoryblokImageUrl(article.cover, { width: 1200, height: 630, quality: 85 });
  const publishDate = article.first_published_at || article.published_at;

  return (
    <>
      <Helmet>
        <title>{article.title} | Blog TELAR</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        {coverImageUrl && <meta property="og:image" content={coverImageUrl} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <Navbar />
      
      <main className="min-h-screen bg-background">
        <article className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Back Link */}
            <Link 
              to="/blog" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Blog
            </Link>

            {/* Cover Image */}
            {coverImageUrl && (
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-8">
                <img
                  src={coverImageUrl}
                  alt={article.cover?.alt || article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header */}
            <header className="mb-10">
              {article.category && (
                <Badge className="mb-4">{article.category}</Badge>
              )}
              
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {publishDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={publishDate}>
                      {format(new Date(publishDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </time>
                  </div>
                )}

                {article.reading_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{article.reading_time} min de lectura</span>
                  </div>
                )}

                <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </header>

            {/* Excerpt */}
            {article.description && (
              <p className="text-xl text-foreground/80 leading-relaxed mb-10 border-l-4 border-primary pl-6">
                {article.description}
              </p>
            )}

            {/* Content */}
            {article.content && (
              <StoryblokRichText content={article.content} />
            )}

            {/* Author */}
            {article.author_name && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                  ESCRITO POR
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {article.author_avatar && (
                      <AvatarImage 
                        src={getStoryblokImageUrl(article.author_avatar, { width: 96, height: 96 })} 
                        alt={article.author_name} 
                      />
                    )}
                    <AvatarFallback>{article.author_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{article.author_name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default BlogArticle;
