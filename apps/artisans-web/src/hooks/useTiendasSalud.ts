import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getTiendasSalud,
  TiendasSaludResponse,
} from '@/services/gestion.actions';

/**
 * Carga la salud del padrón de tiendas del módulo Gestión (F3).
 * Auto-carga al montar; expone `refetch`.
 */
export const useTiendasSalud = () => {
  const [data, setData] = useState<TiendasSaludResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTiendasSalud();
      setData(result);
    } catch {
      toast.error('Error al cargar la salud de tiendas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
};
