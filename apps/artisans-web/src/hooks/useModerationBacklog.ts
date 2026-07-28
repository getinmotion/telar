import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getModerationBacklog,
  ModerationBacklogResponse,
} from '@/services/gestion.actions';

/**
 * Carga el backlog de moderación del módulo Gestión (F4).
 * Auto-carga al montar; expone `refetch`.
 */
export const useModerationBacklog = () => {
  const [data, setData] = useState<ModerationBacklogResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getModerationBacklog();
      setData(result);
    } catch {
      toast.error('Error al cargar el backlog de moderación');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
};
