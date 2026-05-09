import { useQuery } from '@tanstack/react-query';
import {
  listBlogPosts,
  getBlogPostBySlug,
  type BlogPost,
  type ListBlogPostsResponse,
} from '@/services/blog-posts.actions';

export function useBlogPosts(params: {
  page?: number;
  perPage?: number;
  category?: string;
} = {}) {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 12;
  const offset = (page - 1) * perPage;

  return useQuery<ListBlogPostsResponse>({
    queryKey: ['blog-posts', { page, perPage, category: params.category }],
    queryFn: () =>
      listBlogPosts({
        limit: perPage,
        offset,
        category: params.category,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBlogPost(slug: string) {
  return useQuery<BlogPost>({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
