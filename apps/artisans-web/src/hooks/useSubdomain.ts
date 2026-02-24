import { useMemo } from 'react';

interface SubdomainInfo {
  isModerationSubdomain: boolean;
  hostname: string;
  subdomain: string | null;
}

/**
 * Hook para detectar si estamos en el subdominio de moderación
 * Detecta: moderacion.telar.co, moderacion.localhost
 */
export const useSubdomain = (): SubdomainInfo => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    
    // Detectar subdominio de moderación
    const isModerationSubdomain = 
      hostname.startsWith('moderacion.') || // moderacion.telar.co, moderacion.localhost
      hostname === 'moderacion.telar.co';
    
    // Extraer subdomain si existe
    const parts = hostname.split('.');
    const subdomain = parts.length > 2 ? parts[0] : null;

    return {
      isModerationSubdomain,
      hostname,
      subdomain,
    };
  }, []);
};
