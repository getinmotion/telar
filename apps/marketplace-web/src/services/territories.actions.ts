/**
 * Territories CMS — public consumer.
 * Lee de la colección Mongo `territories` vía el backend NestJS.
 *
 * GET /cms/territories            → listado público
 * GET /cms/territories/slug/:slug → ficha por slug
 */

import { telarApiPublic } from '@/integrations/api/telarApi';

export interface CmsTerritoryExtraSection {
  eyebrow: string;
  title: string;
  body: string;
}

export interface CmsTerritory {
  _id: string;
  slug: string;
  name: string;
  department: string;
  region: string;
  subtitle: string;
  description: string;
  longDescription: string;
  culturalTitle: string;
  culturalQuote: string;
  ctaHeadline: string;
  lat: number | null;
  lng: number | null;
  color: string | null;
  markerSize: number | null;
  techniques: string | null;
  featuredProductId: string | null;
  extraSections: CmsTerritoryExtraSection[];
  status: 'draft' | 'published';
  publishedAt: string | null;
  keywords: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  data: CmsTerritory[];
  total: number;
}

export const getCmsTerritories = async (): Promise<CmsTerritory[]> => {
  const res = await telarApiPublic.get<ListResponse>('/cms/territories');
  const data = res.data?.data ?? [];
  return [...data].sort((a, b) => a.position - b.position);
};

export const getCmsTerritoryBySlug = async (
  slug: string,
): Promise<CmsTerritory | null> => {
  try {
    const res = await telarApiPublic.get<CmsTerritory>(
      `/cms/territories/slug/${encodeURIComponent(slug)}`,
    );
    return res.data ?? null;
  } catch {
    return null;
  }
};
