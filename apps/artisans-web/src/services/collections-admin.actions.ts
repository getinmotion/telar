/**
 * collections-admin.actions — super_admin client for the Collections CMS.
 *
 * Endpoints:
 *   GET    /collections?includeDrafts=true&search=&limit=&offset=
 *   GET    /collections/slug/:slug   (public — published only)
 *   GET    /collections/:id          (admin)
 *   POST   /collections              (super_admin)
 *   PATCH  /collections/:id          (super_admin)
 *   DELETE /collections/:id          (super_admin)
 */
import { telarApi } from '@/integrations/api/telarApi';

export type CollectionLayoutVariant = 'wide' | 'dark' | 'centered';

export type CollectionBlockType =
  | 'text'
  | 'image'
  | 'gallery'
  | 'product_grid'
  | 'manifest'
  | 'quote';

export interface CollectionBlock {
  type: CollectionBlockType;
  payload: Record<string, any>;
}

export interface CollectionAdmin {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  region: string | null;
  layoutVariant: CollectionLayoutVariant;
  blocks: CollectionBlock[];
  status: 'draft' | 'published';
  publishedAt: string | null;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListCollectionsResponse {
  data: CollectionAdmin[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCollectionInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
  region?: string | null;
  layoutVariant?: CollectionLayoutVariant;
  blocks?: CollectionBlock[];
  status?: 'draft' | 'published';
  publishedAt?: string | null;
  keywords?: string[];
}

export type UpdateCollectionInput = Partial<CreateCollectionInput>;

export const listCollectionsAdmin = async (params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ListCollectionsResponse> => {
  const res = await telarApi.get<ListCollectionsResponse>('/collections', {
    params: { ...params, includeDrafts: 'true' },
  });
  return res.data;
};

export const getCollectionById = async (id: string): Promise<CollectionAdmin> => {
  const res = await telarApi.get<CollectionAdmin>(`/collections/${id}`);
  return res.data;
};

export const createCollection = async (
  input: CreateCollectionInput,
): Promise<CollectionAdmin> => {
  const res = await telarApi.post<CollectionAdmin>('/collections', input);
  return res.data;
};

export const updateCollection = async (
  id: string,
  input: UpdateCollectionInput,
): Promise<CollectionAdmin> => {
  const res = await telarApi.patch<CollectionAdmin>(`/collections/${id}`, input);
  return res.data;
};

export const deleteCollection = async (id: string): Promise<void> => {
  await telarApi.delete(`/collections/${id}`);
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}
