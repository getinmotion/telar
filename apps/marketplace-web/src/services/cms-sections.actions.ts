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
  | 'featured_aside_card'
  | 'metrics_stat'
  | 'muestra_intro'
  | 'archive_label'
  | 'editorial_footer'
  | 'home_value_props'
  | 'home_section_header'
  | 'home_block'
  | 'home_hero_carousel'
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
  try {
    const res = await telarApiPublic.get<{ data: CmsSection[] }>(
      `/cms/sections`,
      { params: { pageKey } },
    );
    const list = res.data?.data ?? [];
    if (list.length === 0) {
      console.warn(
        `[cms] /cms/sections?pageKey=${pageKey} respondió 200 pero data está vacía. ` +
          `¿Corriste \`npm run cms:seed\` en apps/api?`,
      );
    }
    return [...list].sort((a, b) => a.position - b.position);
  } catch (err: any) {
    console.error(
      `[cms] Error consultando /cms/sections?pageKey=${pageKey}:`,
      err?.message ?? err,
      err?.code ? `(code=${err.code})` : '',
      err?.config?.baseURL ? `baseURL=${err.config.baseURL}` : '',
    );
    return [];
  }
};
