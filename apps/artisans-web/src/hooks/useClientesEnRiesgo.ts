import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getClientesEnRiesgo,
  ClientesEnRiesgoResponse,
} from '@/services/gestion.actions';

/**
 * Carga la worklist "Clientes en riesgo" del módulo Gestión.
 * Auto-carga al montar; expone `refetch` para recargar.
 */
export const useClientesEnRiesgo = () => {
  const [data, setData] = useState<ClientesEnRiesgoResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getClientesEnRiesgo();
      setData(result);
    } catch {
      toast.error('Error al cargar clientes en riesgo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
};
