/**
 * collections.actions — public client for the Collections CMS.
 *
 * Endpoints (NestJS, public — no auth needed for reads):
 *   GET /collections?search=&limit=&offset=
 *   GET /collections/slug/:slug
 */
import { telarApiPublic } from '@/integrations/api/telarApi';

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

export interface Collection {
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
  data: Collection[];
  total: number;
  limit: number;
  offset: number;
}

export const listCollections = async (params: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<ListCollectionsResponse> => {
  const res = await telarApiPublic.get<ListCollectionsResponse>('/collections', {
    params,
  });
  return res.data;
};

export const getCollectionBySlug = async (slug: string): Promise<Collection> => {
  const res = await telarApiPublic.get<Collection>(`/collections/slug/${slug}`);
  return res.data;
};
