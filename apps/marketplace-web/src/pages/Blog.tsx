import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCMSBlogArticles } from "@/hooks/useCMSBlogArticles";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ArticleFilters } from "@/components/blog/ArticleFilters";
import { BlogFilters } from "@/types/blog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

const Blog = () => {
  const [filters, setFilters] = useState<BlogFilters>({});
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useCMSBlogArticles(page, 9);

  const handleFiltersChange = (newFilters: BlogFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Transform Storyblok articles to match expected format
  const articles = data?.articles?.map(article => ({
    id: article._uid,
    title: article.title,
    slug: article.slug,
    excerpt: article.description,
    cover: {
      url: article.cover?.filename || '',
      alternativeText: article.cover?.alt || article.title
    },
    category: article.category ? { name: article.category, slug: article.category.toLowerCase() } : null,
    author: article.author_name ? {
      name: article.author_name,
      avatar: article.author_avatar ? { url: article.author_avatar.filename } : null
    } : null,
    publishedAt: article.first_published_at || article.published_at || new Date().toISOString(),
    readingTime: article.reading_time || 5
  })) || [];

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 1;

  // Filter articles client-side if filters are applied
  const filteredArticles = articles.filter(article => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!article.title.toLowerCase().includes(searchLower) && 
          !article.excerpt?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.category && article.category?.slug !== filters.category) {
      return false;
    }
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Blog - Historias de Artesanías | TELAR</title>
        <meta 
          name="description" 
          content="Descubre las historias, tradiciones y técnicas detrás de las artesanías colombianas. Conoce a nuestros artesanos y su invaluable legado cultural." 
        />
      </Helmet>

      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Blog de Artesanías
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Historias, tradiciones y técnicas que preservan el patrimonio cultural de Colombia
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <ArticleFilters filters={filters} onFiltersChange={handleFiltersChange} />

            {error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <BookOpen className="h-20 w-20 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-semibold mb-2">Próximamente</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Estamos preparando contenido increíble sobre nuestros artesanos y sus técnicas ancestrales.
                </p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No hay artículos</h2>
                <p className="text-muted-foreground">
                  {filters.search || filters.category
                    ? "No se encontraron artículos con estos filtros"
                    : "Pronto publicaremos nuevos artículos"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article as any} variant="blog" />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-12">
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                      </PaginationItem>
                      
                      <PaginationItem>
                        <span className="px-4 py-2 text-sm text-muted-foreground">
                          Página {page} de {totalPages}
                        </span>
                      </PaginationItem>

                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
