/**
 * blog-posts-admin.actions — super_admin client for the blog posts CMS.
 *
 * Endpoints:
 *   GET    /blog-posts?includeDrafts=true&search=&limit=&offset=
 *   GET    /blog-posts/slug/:slug   (public — published only)
 *   GET    /blog-posts/:id          (admin)
 *   POST   /blog-posts              (super_admin)
 *   PATCH  /blog-posts/:id          (super_admin)
 *   DELETE /blog-posts/:id          (super_admin)
 */
import { telarApi } from '@/integrations/api/telarApi';

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

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  coverUrl?: string;
  coverAlt?: string;
  category?: string;
  authorName?: string;
  readingTimeMin?: number;
  status?: 'draft' | 'published';
  publishedAt?: string;
  keywords?: string[];
}

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

export const listBlogPostsAdmin = async (params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ListBlogPostsResponse> => {
  const res = await telarApi.get<ListBlogPostsResponse>('/blog-posts', {
    params: { ...params, includeDrafts: 'true' },
  });
  return res.data;
};

export const getBlogPostById = async (id: string): Promise<BlogPost> => {
  const res = await telarApi.get<BlogPost>(`/blog-posts/${id}`);
  return res.data;
};

export const createBlogPost = async (
  input: CreateBlogPostInput,
): Promise<BlogPost> => {
  const res = await telarApi.post<BlogPost>('/blog-posts', input);
  return res.data;
};

export const updateBlogPost = async (
  id: string,
  input: UpdateBlogPostInput,
): Promise<BlogPost> => {
  const res = await telarApi.patch<BlogPost>(`/blog-posts/${id}`, input);
  return res.data;
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  await telarApi.delete(`/blog-posts/${id}`);
};

/** kebab-case slug from a free-form title. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}
