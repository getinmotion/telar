import { useQuery } from '@tanstack/react-query';
import { fetchBlogArticles } from '@/lib/storyblokClient';
import { BlogArticleListResponse } from '@/types/storyblok';

export function useCMSBlogArticles(page: number = 1, perPage: number = 10) {
  return useQuery({
    queryKey: ['storyblok', 'blog-articles', page, perPage],
    queryFn: async () => {
      const response = await fetchBlogArticles(page, perPage);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as BlogArticleListResponse | null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
