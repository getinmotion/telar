import { useEffect, useState } from 'react';
import { getAllCategories } from '@/services/categories.actions';
import { getAllCrafts, getTechniquesByCraftId } from '@/services/crafts.actions';
import { getAllMaterials } from '@/services/materials.actions';
import type { NewWizardState } from './useNewWizardState';

export interface ResolvedNames {
  categoryName: string | null;
  subcategoryName: string | null;
  craftName: string | null;
  primaryTechniqueName: string | null;
  secondaryTechniqueName: string | null;
  materialNames: string[];
}

/**
 * Resuelve los UUIDs del estado del wizard a nombres legibles
 * (categoría, subcategoría, oficio, técnicas y materiales).
 * Compartido por los pasos 5 y 6.
 */
export const useResolvedNames = (state: NewWizardState): ResolvedNames => {
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [subcategoryName, setSubcategoryName] = useState<string | null>(null);
  const [craftName, setCraftName] = useState<string | null>(null);
  const [primaryTechniqueName, setPrimaryTechniqueName] = useState<string | null>(null);
  const [secondaryTechniqueName, setSecondaryTechniqueName] = useState<string | null>(null);
  const [materialNames, setMaterialNames] = useState<string[]>([]);

  useEffect(() => {
    if (!state.categoryId) {
      setCategoryName(null);
      setSubcategoryName(null);
      return;
    }
    getAllCategories()
      .then(cats => {
        setCategoryName(cats.find(c => c.id === state.categoryId)?.name ?? null);
        setSubcategoryName(
          state.subcategoryId
            ? cats.find(c => c.id === state.subcategoryId)?.name ?? null
            : null,
        );
      })
      .catch(() => {});
  }, [state.categoryId, state.subcategoryId]);

  useEffect(() => {
    if (!state.craftId) {
      setCraftName(null);
      setPrimaryTechniqueName(null);
      setSecondaryTechniqueName(null);
      return;
    }
    getAllCrafts()
      .then(crafts => {
        const craft = crafts.find(c => c.id === state.craftId);
        setCraftName(craft?.name ?? null);
        if (craft && (state.primaryTechniqueId || state.secondaryTechniqueId)) {
          getTechniquesByCraftId(craft.id)
            .then(techs => {
              setPrimaryTechniqueName(
                techs.find(t => t.id === state.primaryTechniqueId)?.name ?? null,
              );
              setSecondaryTechniqueName(
                techs.find(t => t.id === state.secondaryTechniqueId)?.name ?? null,
              );
            })
            .catch(() => {});
        } else {
          setPrimaryTechniqueName(null);
          setSecondaryTechniqueName(null);
        }
      })
      .catch(() => {});
  }, [state.craftId, state.primaryTechniqueId, state.secondaryTechniqueId]);

  useEffect(() => {
    if (state.materials.length === 0) {
      setMaterialNames([]);
      return;
    }
    getAllMaterials()
      .then(mats => {
        const names = state.materials
          .map(id => mats.find(m => m.id === id)?.name)
          .filter(Boolean) as string[];
        setMaterialNames(names);
      })
      .catch(() => {});
  }, [state.materials]);

  return {
    categoryName,
    subcategoryName,
    craftName,
    primaryTechniqueName,
    secondaryTechniqueName,
    materialNames,
  };
};
