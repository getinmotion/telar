import { useEffect, useMemo, useState } from 'react';
import {
  getVariantAxesForCategory,
  type VariantAxisConfig,
} from '@/types/products.types';
import { getAllCategories, type Category } from '@/services/categories.actions';
import { getAllMaterials } from '@/services/materials.actions';

/**
 * Resuelve los ejes de variación disponibles para la categoría del producto
 * (por slug top-level) y llena el eje "material" con los materiales ya
 * vinculados a la pieza.
 */
export const useVariantAxes = (
  categoryId: string | undefined,
  materialIds: string[],
): { axes: VariantAxisConfig[]; isLoading: boolean } => {
  const [topLevelSlug, setTopLevelSlug] = useState<string | null>(null);
  const [materialNames, setMaterialNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setTopLevelSlug(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getAllCategories()
      .then(cats => {
        const byId = new Map(cats.map(c => [c.id, c]));
        // Subir por parentId hasta la categoría raíz
        let current: Category | undefined = byId.get(categoryId);
        let guard = 0;
        while (current?.parentId && guard < 10) {
          current = byId.get(current.parentId);
          guard++;
        }
        setTopLevelSlug(current?.slug ?? null);
      })
      .catch(() => setTopLevelSlug(null))
      .finally(() => setIsLoading(false));
  }, [categoryId]);

  // Clave estable: el array de ids se recrea en cada render del wizard
  const materialsKey = materialIds.join(',');
  useEffect(() => {
    if (!materialsKey) {
      setMaterialNames([]);
      return;
    }
    const ids = materialsKey.split(',');
    getAllMaterials()
      .then(mats => {
        const names = ids
          .map(id => mats.find(m => m.id === id)?.name)
          .filter(Boolean) as string[];
        setMaterialNames(names);
      })
      .catch(() => setMaterialNames([]));
  }, [materialsKey]);

  const axes = useMemo(() => {
    return getVariantAxesForCategory(topLevelSlug).map(axis =>
      axis.valuesFromProductMaterials
        ? { ...axis, suggestedValues: materialNames }
        : axis,
    );
  }, [topLevelSlug, materialNames]);

  return { axes, isLoading };
};
