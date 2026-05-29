/**
 * Taxonomy Service
 * Consume los endpoints de taxonomía del backend NestJS:
 * /categories, /materials, /crafts, /techniques, /curatorial-categories
 */

import { telarApiPublic } from '@/integrations/api/telarApi';

// ── Types ─────────────────────────────────────────────

export interface TaxonomyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent: TaxonomyCategory | null;
  displayOrder: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxonomyMaterial {
  id: string;
  name: string;
  isOrganic: boolean;
  isSustainable: boolean;
  status?: string;
}

export interface TaxonomyCraft {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  status?: string;
}

export interface TaxonomyTechnique {
  id: string;
  name: string;
  craftId?: string;
  description?: string;
  status?: string;
}

export interface TaxonomyCuratorialCategory {
  id: string;
  name: string;
  description: string;
}

/** Category with its subcategories resolved */
export interface CategoryWithChildren extends TaxonomyCategory {
  subcategories: TaxonomyCategory[];
}

// ── API Calls ─────────────────────────────────────────

/**
 * Coerce cualquier respuesta a array. La API puede devolver `[...]`,
 * `{ data: [...] }`, `null`, `undefined`, o un error — y este helper hace que
 * el caller siempre reciba un array (vacío en el peor caso). Evita los
 * `*.map is not a function` y `is not iterable` que crashean páginas enteras.
 */
function coerceArray<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

async function safeGetArray<T>(path: string, label: string): Promise<T[]> {
  try {
    const response = await telarApiPublic.get(path);
    return coerceArray<T>(response.data);
  } catch (err: any) {
    console.warn(
      `[taxonomy] GET ${path} falló (${label}):`,
      err?.message ?? err,
    );
    return [];
  }
}

/** GET /categories — all categories (flat list with parent relations) */
export const getCategories = async (): Promise<TaxonomyCategory[]> =>
  safeGetArray<TaxonomyCategory>('/categories', 'getCategories');

/** GET /categories/active — only active categories */
export const getActiveCategories = async (): Promise<TaxonomyCategory[]> =>
  safeGetArray<TaxonomyCategory>('/categories/active', 'getActiveCategories');

/** GET /categories/parent/:parentId — subcategories of a parent */
export const getSubcategories = async (parentId: string): Promise<TaxonomyCategory[]> =>
  safeGetArray<TaxonomyCategory>(
    `/categories/parent/${parentId}`,
    'getSubcategories',
  );

/** GET /materials — all materials */
export const getMaterials = async (): Promise<TaxonomyMaterial[]> =>
  safeGetArray<TaxonomyMaterial>('/materials', 'getMaterials');

/** GET /crafts — all crafts */
export const getCrafts = async (): Promise<TaxonomyCraft[]> =>
  safeGetArray<TaxonomyCraft>('/crafts', 'getCrafts');

/** GET /techniques — all techniques */
export const getTechniques = async (): Promise<TaxonomyTechnique[]> =>
  safeGetArray<TaxonomyTechnique>('/techniques', 'getTechniques');

export interface TechniqueWithProductCount {
  id: string;
  name: string;
  productCount: number;
}

/** GET /techniques?withProductCount=true — técnicas + cantidad de productos asociados */
export const getTechniquesWithProductCount = async (): Promise<
  TechniqueWithProductCount[]
> =>
  safeGetArray<TechniqueWithProductCount>(
    '/techniques?withProductCount=true',
    'getTechniquesWithProductCount',
  );

/** GET /curatorial-categories — all curatorial collections */
export const getCuratorialCategories = async (): Promise<TaxonomyCuratorialCategory[]> => {
  return safeGetArray<TaxonomyCuratorialCategory>(
    '/curatorial-categories',
    'getCuratorialCategories',
  );
};

// ── Helpers ───────────────────────────────────────────

/**
 * Build a hierarchy from the flat category list.
 * Returns top-level categories (parentId === null) each with a `subcategories` array.
 */
export function buildCategoryHierarchy(flat: TaxonomyCategory[]): CategoryWithChildren[] {
  if (!Array.isArray(flat)) return [];
  const topLevel = flat.filter(c => !c.parentId);
  return topLevel.map(parent => ({
    ...parent,
    subcategories: flat
      .filter(c => c.parentId === parent.id)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  })).sort((a, b) => a.displayOrder - b.displayOrder);
}
