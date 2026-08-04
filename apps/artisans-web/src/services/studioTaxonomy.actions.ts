import { telarApi } from '@/integrations/api/telarApi';
import { getActiveCategories } from '@/services/categories.actions';

/**
 * Catálogos de taxonomía que consumen los Studios del backoffice.
 *
 * Vive aparte de los hooks porque lo usan tanto `useProductStudio` como los
 * inyectores de datos de prueba (que no son hooks). La carga se memoiza a nivel
 * de módulo: varias pantallas piden lo mismo y no cambia dentro de la sesión.
 */

export interface TaxonomyItem {
  id: string;
  name: string;
  slug?: string;
  /** Solo en /crafts: categoría a la que pertenece el oficio. */
  categoryId?: string | null;
  /** Solo en /techniques: oficios vinculados (relación N:M canónica). */
  craftIds?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface StudioTaxonomy {
  categories: Category[];
  crafts: TaxonomyItem[];
  techniques: TaxonomyItem[];
  curatorialCategories: TaxonomyItem[];
  materials: TaxonomyItem[];
}

export const EMPTY_STUDIO_TAXONOMY: StudioTaxonomy = {
  categories: [],
  crafts: [],
  techniques: [],
  curatorialCategories: [],
  materials: [],
};

let cached: Promise<StudioTaxonomy> | null = null;

async function load(): Promise<StudioTaxonomy> {
  const [catsRes, craftsRes, techsRes, curatRes, matsRes] = await Promise.allSettled([
    getActiveCategories(),
    telarApi.get<TaxonomyItem[]>('/crafts'),
    telarApi.get<TaxonomyItem[]>('/techniques'),
    telarApi.get<TaxonomyItem[]>('/curatorial-categories'),
    telarApi.get<TaxonomyItem[]>('/materials'),
  ]);

  return {
    categories: catsRes.status === 'fulfilled' ? (catsRes.value as Category[]) : [],
    crafts: craftsRes.status === 'fulfilled' ? craftsRes.value.data : [],
    techniques: techsRes.status === 'fulfilled' ? techsRes.value.data : [],
    curatorialCategories: curatRes.status === 'fulfilled' ? curatRes.value.data : [],
    materials: matsRes.status === 'fulfilled' ? matsRes.value.data : [],
  };
}

/** Carga (memoizada) de los 5 catálogos. Reintenta si la vez anterior falló entera. */
export function fetchStudioTaxonomy(): Promise<StudioTaxonomy> {
  cached ??= load().catch((err) => {
    cached = null;
    throw err;
  });
  return cached;
}
