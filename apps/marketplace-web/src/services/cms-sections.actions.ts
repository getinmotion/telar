/**
 * CMS Sections — public consumer for the marketplace.
 * Endpoint contract: GET /cms/sections?pageKey=tecnicas → { data: CmsSection[] }
 */

import { telarApiPublic } from '@/integrations/api/telarApi';

export type CmsSectionType =
  | 'hero'
  | 'quote'
  | 'two_column_intro'
  | 'technique_grid'
  | string;

export interface CmsSection {
  id: string;
  pageKey: string;
  position: number;
  type: CmsSectionType;
  payload: Record<string, any>;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getCmsSections = async (
  pageKey: string,
): Promise<CmsSection[]> => {
  const res = await telarApiPublic.get<{ data: CmsSection[] }>(
    `/cms/sections`,
    { params: { pageKey } },
  );
  const list = res.data?.data ?? [];
  return [...list].sort((a, b) => a.position - b.position);
};
