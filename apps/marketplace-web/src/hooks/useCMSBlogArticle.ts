import { useQuery } from '@tanstack/react-query';
import { fetchBlogArticle } from '@/lib/storyblokClient';
import { BlogArticle } from '@/types/storyblok';

export function useCMSBlogArticle(slug: string) {
  return useQuery({
    queryKey: ['storyblok', 'blog-article', slug],
    queryFn: async () => {
      const response = await fetchBlogArticle(slug);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as BlogArticle | null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
