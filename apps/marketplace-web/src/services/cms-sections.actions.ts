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

    // Detectar el caso típico: la baseURL no está configurada y Vite devuelve
    // el index.html del SPA en lugar del JSON del API.
    if (typeof res.data === 'string' && (res.data as any).startsWith?.('<!')) {
      console.error(
        `[cms] /cms/sections?pageKey=${pageKey} respondió HTML en lugar de JSON.\n` +
          `→ Falta VITE_BACKEND_URL en apps/marketplace-web/.env (o no reiniciaste Vite).\n` +
          `→ Las peticiones se están sirviendo desde el SPA en vez del backend NestJS.`,
      );
      return [];
    }

    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    if (list.length === 0) {
      console.warn(
        `[cms] /cms/sections?pageKey=${pageKey} respondió pero la lista está vacía. ` +
          `¿Corriste \`npm run cms:seed\` en apps/api? ` +
          `¿VITE_BACKEND_URL apunta al API correcto?`,
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
