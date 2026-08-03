import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getModerationBacklog,
  ModerationBacklogResponse,
  GestionFilters,
} from '@/services/gestion.actions';

/**
 * Carga el backlog de moderación del módulo Gestión (F4).
 * Auto-carga al montar; expone `refetch`.
 */
export const useModerationBacklog = (filters: GestionFilters = {}) => {
  const [data, setData] = useState<ModerationBacklogResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Serializar evita relanzar la carga en cada render por la identidad del objeto.
  const filtersKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getModerationBacklog(JSON.parse(filtersKey));
      setData(result);
    } catch {
      toast.error('Error al cargar el backlog de moderación');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
};
