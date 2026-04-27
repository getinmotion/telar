import { useQuery } from '@tanstack/react-query';
import { fetchBlogArticles } from '@/lib/storyblokClient';
import { BlogArticleListResponse } from '@/types/storyblok';
import { FALLBACK_STORIES } from '@/datafallback/fallbackStories';

function buildFallbackResponse(
  page: number,
  perPage: number,
): BlogArticleListResponse {
  return {
    articles: FALLBACK_STORIES,
    total: FALLBACK_STORIES.length,
    per_page: perPage,
    page,
  };
}

export function useCMSBlogArticles(page: number = 1, perPage: number = 10) {
  return useQuery({
    queryKey: ['storyblok', 'blog-articles', page, perPage],
    queryFn: async () => {
      try {
        const response = await fetchBlogArticles(page, perPage);
        if (response.error) {
          // CMS error → degrade gracefully to the baked-in editorial.
          return buildFallbackResponse(page, perPage);
        }
        const data = response.data as BlogArticleListResponse | null;
        // If the CMS has no articles yet, serve the fallback editorial so the
        // /historias archive is never blank.
        if (!data || !data.articles || data.articles.length === 0) {
          return buildFallbackResponse(page, perPage);
        }
        // Merge fallback stories as the featured entries (but avoid dupes).
        const existingSlugs = new Set(data.articles.map((a) => a.slug));
        const extras = FALLBACK_STORIES.filter((a) => !existingSlugs.has(a.slug));
        
        return {
          ...data,
          articles: [...extras, ...data.articles],
          total: data.total + extras.length,
        };
      } catch {
        return buildFallbackResponse(page, perPage);
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
