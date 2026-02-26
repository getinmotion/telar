import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const DATA_GOV_API_URL = "https://www.datos.gov.co/resource/82di-kkh9.json";
const APP_TOKEN = "EDjnElheZ5MJaJAr9sZsa65nw";
const CACHE_KEY = 'colombia_locations_cache';
const CACHE_TIMESTAMP_KEY = 'colombia_locations_timestamp';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas (datos estáticos)

interface LocationData {
  region: string;
  c_digo_dane_del_departamento: string;
  dpto: string;
  cod_mpio: string;
  nom_mpio: string;
}

interface UseColombiaLocationsReturn {
  departments: string[];
  getMunicipalities: (department: string) => string[];
  isLoading: boolean;
  error: string | null;
}

export const useColombiaLocations = (): UseColombiaLocationsReturn => {
  const [data, setData] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Guard para fetch único
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    // ✅ FIX: Si ya se hizo fetch, no volver a hacer
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    setIsLoading(true);
    setError(null);

    // ✅ FIX: Intentar cargar desde localStorage primero
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        if (cacheAge < CACHE_TTL) {
          const cachedData = JSON.parse(cached) as LocationData[];
          setData(cachedData);
          setIsLoading(false);
          return;
        }
      }
    } catch (cacheError) {
      console.warn('Error loading from cache:', cacheError);
    }

    // ✅ Si no hay cache válido, hacer fetch
    const headers = {
      'Accept': 'application/json',
      'X-App-Token': APP_TOKEN,
    };

    try {
      const response = await fetch(`${DATA_GOV_API_URL}?$limit=1500`, { headers });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const json: LocationData[] = await response.json();
      setData(json);

      // ✅ FIX: Guardar en localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(json));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (storageError) {
        console.warn('Error saving to localStorage:', storageError);
      }
    } catch (err) {
      console.error("Error fetching Colombia locations:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []); // ✅ Sin dependencias

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract unique departments, sorted alphabetically
  const departments = useMemo(() => {
    const uniqueDepts = [...new Set(data.map(item => item.dpto))];
    return uniqueDepts.sort((a, b) => a.localeCompare(b, 'es'));
  }, [data]);

  // Get municipalities for a specific department
  const getMunicipalities = useCallback((department: string): string[] => {
    const municipalities = data
      .filter(item => item.dpto === department)
      .map(item => item.nom_mpio);

    const uniqueMunicipalities = [...new Set(municipalities)];
    return uniqueMunicipalities.sort((a, b) => a.localeCompare(b, 'es'));
  }, [data]);

  return {
    departments,
    getMunicipalities,
    isLoading,
    error,
  };
};
