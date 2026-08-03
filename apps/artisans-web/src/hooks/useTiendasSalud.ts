import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getTiendasSalud,
  TiendasSaludResponse,
  GestionFilters,
} from '@/services/gestion.actions';

/**
 * Carga la salud del padrón de tiendas del módulo Gestión (F3).
 * Auto-carga al montar; expone `refetch`.
 */
export const useTiendasSalud = (filters: GestionFilters = {}) => {
  const [data, setData] = useState<TiendasSaludResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Serializar evita relanzar la carga en cada render por la identidad del objeto.
  const filtersKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTiendasSalud(JSON.parse(filtersKey));
      setData(result);
    } catch {
      toast.error('Error al cargar la salud de tiendas');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
};
