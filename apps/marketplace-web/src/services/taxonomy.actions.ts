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

/** GET /categories — all categories (flat list with parent relations) */
export const getCategories = async (): Promise<TaxonomyCategory[]> => {
  const response = await telarApiPublic.get<TaxonomyCategory[]>('/categories');
  return response.data;
};

/** GET /categories/active — only active categories */
export const getActiveCategories = async (): Promise<TaxonomyCategory[]> => {
  const response = await telarApiPublic.get('/categories/active');
  const raw = response.data;
  // Handle both array and { data: [...] } response formats
  return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
};

/** GET /categories/parent/:parentId — subcategories of a parent */
export const getSubcategories = async (parentId: string): Promise<TaxonomyCategory[]> => {
  const response = await telarApiPublic.get<TaxonomyCategory[]>(`/categories/parent/${parentId}`);
  return response.data;
};

/** GET /materials — all materials */
export const getMaterials = async (): Promise<TaxonomyMaterial[]> => {
  const response = await telarApiPublic.get<TaxonomyMaterial[]>('/materials');
  return response.data;
};

/** GET /crafts — all crafts */
export const getCrafts = async (): Promise<TaxonomyCraft[]> => {
  const response = await telarApiPublic.get<TaxonomyCraft[]>('/crafts');
  return response.data;
};

/** GET /techniques — all techniques */
export const getTechniques = async (): Promise<TaxonomyTechnique[]> => {
  const response = await telarApiPublic.get<TaxonomyTechnique[]>('/techniques');
  return response.data;
};

export interface TechniqueWithProductCount {
  id: string;
  name: string;
  productCount: number;
}

/** GET /techniques?withProductCount=true — técnicas + cantidad de productos asociados */
export const getTechniquesWithProductCount = async (): Promise<
  TechniqueWithProductCount[]
> => {
  const response = await telarApiPublic.get<TechniqueWithProductCount[]>(
    '/techniques?withProductCount=true',
  );
  return Array.isArray(response.data) ? response.data : [];
};

/** GET /curatorial-categories — all curatorial collections */
export const getCuratorialCategories = async (): Promise<TaxonomyCuratorialCategory[]> => {
  const response = await telarApiPublic.get<TaxonomyCuratorialCategory[]>('/curatorial-categories');
  return response.data;
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
