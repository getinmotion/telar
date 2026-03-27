/**
 * useTaxonomy Hook
 * Fetches and caches taxonomy data from the API:
 * categories (with hierarchy), materials, crafts, techniques, curatorial categories.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  getActiveCategories,
  getMaterials,
  getCrafts,
  getTechniques,
  getCuratorialCategories,
  buildCategoryHierarchy,
  type TaxonomyCategory,
  type TaxonomyMaterial,
  type TaxonomyCraft,
  type TaxonomyTechnique,
  type TaxonomyCuratorialCategory,
  type CategoryWithChildren,
} from '@/services/taxonomy.actions';

// ── Simple in-memory cache ────────────────────────────
let cachedCategories: TaxonomyCategory[] | null = null;
let cachedMaterials: TaxonomyMaterial[] | null = null;
let cachedCrafts: TaxonomyCraft[] | null = null;
let cachedTechniques: TaxonomyTechnique[] | null = null;
let cachedCuratorial: TaxonomyCuratorialCategory[] | null = null;

export function useTaxonomy() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>(cachedCategories ?? []);
  const [materials, setMaterials] = useState<TaxonomyMaterial[]>(cachedMaterials ?? []);
  const [crafts, setCrafts] = useState<TaxonomyCraft[]>(cachedCrafts ?? []);
  const [techniques, setTechniques] = useState<TaxonomyTechnique[]>(cachedTechniques ?? []);
  const [curatorialCategories, setCuratorialCategories] = useState<TaxonomyCuratorialCategory[]>(cachedCuratorial ?? []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If everything is cached, skip
    if (cachedCategories && cachedMaterials && cachedCrafts && cachedTechniques && cachedCuratorial) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [cats, mats, crs, techs, curat] = await Promise.allSettled([
          cachedCategories ? Promise.resolve(cachedCategories) : getActiveCategories(),
          cachedMaterials ? Promise.resolve(cachedMaterials) : getMaterials(),
          cachedCrafts ? Promise.resolve(cachedCrafts) : getCrafts(),
          cachedTechniques ? Promise.resolve(cachedTechniques) : getTechniques(),
          cachedCuratorial ? Promise.resolve(cachedCuratorial) : getCuratorialCategories(),
        ]);

        if (cancelled) return;

        if (cats.status === 'fulfilled') {
          cachedCategories = cats.value;
          setCategories(cats.value);
        }
        if (mats.status === 'fulfilled') {
          cachedMaterials = mats.value;
          setMaterials(mats.value);
        }
        if (crs.status === 'fulfilled') {
          cachedCrafts = crs.value;
          setCrafts(crs.value);
        }
        if (techs.status === 'fulfilled') {
          cachedTechniques = techs.value;
          setTechniques(techs.value);
        }
        if (curat.status === 'fulfilled') {
          cachedCuratorial = curat.value;
          setCuratorialCategories(curat.value);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando taxonomía');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Build hierarchy from flat categories
  const categoryHierarchy: CategoryWithChildren[] = useMemo(
    () => buildCategoryHierarchy(categories),
    [categories],
  );

  // Find a category by slug (works for both parents and children)
  const findCategoryBySlug = (slug: string): TaxonomyCategory | undefined => {
    return categories.find(c => c.slug === slug);
  };

  // Find a parent category with children by slug
  const findCategoryWithChildren = (slug: string): CategoryWithChildren | undefined => {
    return categoryHierarchy.find(c => c.slug === slug);
  };

  return {
    // Raw data
    categories,
    materials,
    crafts,
    techniques,
    curatorialCategories,

    // Computed
    categoryHierarchy,

    // Helpers
    findCategoryBySlug,
    findCategoryWithChildren,

    // State
    loading,
    error,
  };
}
