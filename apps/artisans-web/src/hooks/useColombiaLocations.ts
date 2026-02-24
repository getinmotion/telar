import { useState, useEffect, useMemo, useCallback } from 'react';

const DATA_GOV_API_URL = "https://www.datos.gov.co/resource/82di-kkh9.json";
const APP_TOKEN = "EDjnElheZ5MJaJAr9sZsa65nw";

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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const headers = {
      'Accept': 'application/json',
      'X-App-Token': APP_TOKEN,
    };

    try {
      // Fetch all records (the dataset has ~1100 records)
      const response = await fetch(`${DATA_GOV_API_URL}?$limit=1500`, { headers });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const json: LocationData[] = await response.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching Colombia locations:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
