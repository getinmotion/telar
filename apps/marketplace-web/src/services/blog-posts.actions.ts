/**
 * blog-posts.actions — public client for the new own-CMS blog posts API.
 * Endpoints (NestJS, public — no auth needed for reads):
 *   GET /blog-posts?search=&category=&limit=&offset=
 *   GET /blog-posts/slug/:slug
 */
import { telarApiPublic } from '@/integrations/api/telarApi';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  coverAlt: string | null;
  category: string | null;
  authorName: string | null;
  readingTimeMin: number | null;
  status: 'draft' | 'published';
  publishedAt: string | null;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListBlogPostsResponse {
  data: BlogPost[];
  total: number;
  limit: number;
  offset: number;
}

export const listBlogPosts = async (params: {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<ListBlogPostsResponse> => {
  const res = await telarApiPublic.get<ListBlogPostsResponse>('/blog-posts', {
    params,
  });
  return res.data;
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
  const res = await telarApiPublic.get<BlogPost>(`/blog-posts/slug/${slug}`);
  return res.data;
};
