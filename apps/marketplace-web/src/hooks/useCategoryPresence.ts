/**
 * useCategoryPresence Hook
 * Determina qué categorías/subcategorías tienen al menos un producto marcado,
 * para no mostrar como filtro categorías vacías (que llevarían a un falso
 * "No se encontraron piezas").
 *
 * Hace un único fetch de productos (cacheado en memoria a nivel de módulo,
 * mismo patrón que useTaxonomy) y expone helpers de presencia.
 */

import { useState, useEffect } from 'react';
import { getProductsNew } from '@/services/products-new.actions';
import type { CategoryWithChildren } from '@/services/taxonomy.actions';

// ── Caché en memoria ──────────────────────────────────
let cachedPresentIds: Set<string> | null = null;

export function useCategoryPresence() {
  const [presentCategoryIds, setPresentCategoryIds] = useState<Set<string>>(
    cachedPresentIds ?? new Set(),
  );
  const [ready, setReady] = useState(!!cachedPresentIds);

  useEffect(() => {
    if (cachedPresentIds) {
      setPresentCategoryIds(cachedPresentIds);
      setReady(true);
      return;
    }

    let cancelled = false;

    getProductsNew({ page: 1, limit: 500 })
      .then((res) => {
        const products = Array.isArray(res) ? res : (res.data ?? []);
        const ids = new Set<string>(
          products.map((p) => p.categoryId).filter(Boolean),
        );
        cachedPresentIds = ids;
        if (!cancelled) {
          setPresentCategoryIds(ids);
          setReady(true);
        }
      })
      .catch(() => {
        // En caso de error dejamos ready=true con set vacío: la guarda de
        // más abajo hace que no se oculte nada (fallback: mostrar todo).
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Solo filtramos cuando hay datos reales. Mientras carga (o si el set quedó
  // vacío por un error) devolvemos "true" para no dejar filtros/menús en blanco.
  const active = ready && presentCategoryIds.size > 0;

  const subcategoryHasProducts = (id: string): boolean =>
    !active || presentCategoryIds.has(id);

  const categoryHasProducts = (cat: CategoryWithChildren): boolean =>
    !active ||
    presentCategoryIds.has(cat.id) ||
    cat.subcategories.some((s) => presentCategoryIds.has(s.id));

  return {
    presentCategoryIds,
    ready,
    /** true cuando el filtrado por presencia está activo (datos cargados) */
    active,
    categoryHasProducts,
    subcategoryHasProducts,
  };
}
