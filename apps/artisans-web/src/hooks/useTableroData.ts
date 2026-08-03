import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getCatalogoComposicion,
  getClientesEnRiesgo,
  getSanidadDatos,
  getTiendasSalud,
  type CatalogoComposicionResponse,
  type ClientesEnRiesgoResponse,
  type GestionFilters,
  type SanidadResponse,
  type TiendasSaludResponse,
} from '@/services/gestion.actions';

/**
 * Carga los cuatro bloques del tablero con UN SOLO juego de filtros.
 *
 * Que los cuatro salgan de la misma llamada es lo que garantiza que se muevan
 * juntos: si cada bloque pidiera sus datos por su cuenta, un filtro aplicado a
 * medias dejaría la pantalla mostrando cifras de dos universos distintos, que es
 * exactamente el error que un tablero institucional no se puede permitir.
 */

export interface TableroData {
  salud: TiendasSaludResponse | null;
  catalogo: CatalogoComposicionResponse | null;
  sanidad: SanidadResponse | null;
  clientes: ClientesEnRiesgoResponse | null;
}

const EMPTY: TableroData = {
  salud: null,
  catalogo: null,
  sanidad: null,
  clientes: null,
};

export interface UseTableroDataOptions {
  /** El mapa es lo más pesado; se puede omitir donde no se pinta. */
  includeMapa?: boolean;
}

export function useTableroData(
  filters: GestionFilters,
  options: UseTableroDataOptions = {},
) {
  const { includeMapa = true } = options;
  const [data, setData] = useState<TableroData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serializar los filtros evita relanzar la carga en cada render por culpa de
  // la identidad del objeto.
  const filtersKey = JSON.stringify(filters);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const parsed: GestionFilters = JSON.parse(filtersKey);
    try {
      const [salud, catalogo, sanidad, clientes] = await Promise.all([
        getTiendasSalud(parsed),
        getCatalogoComposicion(parsed),
        getSanidadDatos(parsed),
        includeMapa ? getClientesEnRiesgo(parsed) : Promise.resolve(null),
      ]);
      setData({ salud, catalogo, sanidad, clientes });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'No se pudo cargar el tablero';
      setError(message);
      toast.error('No se pudo cargar el tablero');
    } finally {
      setLoading(false);
    }
  }, [filtersKey, includeMapa]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refetch: fetchAll };
}
