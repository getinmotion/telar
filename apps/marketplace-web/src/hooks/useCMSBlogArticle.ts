import { useQuery } from '@tanstack/react-query';
import { fetchBlogArticle } from '@/lib/storyblokClient';
import { BlogArticle } from '@/types/storyblok';
import { getFallbackStoryBySlug } from '@/datafallback/fallbackStories';

export function useCMSBlogArticle(slug: string) {
  return useQuery({
    queryKey: ['storyblok', 'blog-article', slug],
    queryFn: async () => {
      // Fallback stories take precedence — they are the editorial baseline
      // that must always render even when the CMS is empty or unreachable.
      const fallback = getFallbackStoryBySlug(slug);
      if (fallback) return fallback;

      try {
        const response = await fetchBlogArticle(slug);
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data as BlogArticle | null;
      } catch (err) {
        // If the CMS errors out, bubble the error up only when we have no
        // fallback to serve.
        throw err;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
