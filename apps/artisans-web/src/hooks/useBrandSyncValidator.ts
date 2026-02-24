import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { validateAndSyncBrandData } from '@/utils/validateBrandSync';

interface UseBrandSyncValidatorOptions {
  enabled?: boolean;
  intervalMinutes?: number;
  skipInitialSync?: boolean;
}

/**
 * Hook que valida y sincroniza automáticamente los datos de marca
 * cada cierto intervalo de tiempo.
 * 
 * @param enabled - Si está activo el validador (default: true)
 * @param intervalMinutes - Intervalo en minutos para validar (default: 5)
 * @param skipInitialSync - Si debe saltar la sincronización inicial (default: false)
 */
export function useBrandSyncValidator(options: UseBrandSyncValidatorOptions = {}) {
  const { enabled = true, intervalMinutes = 5, skipInitialSync = false } = options;
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !user?.id) {
      return;
    }

    // Ejecutar validación inmediatamente al montar (solo si no se debe saltar)
    const runValidation = async () => {
      try {
        const result = await validateAndSyncBrandData(user.id);
        if (result.syncPerformed) {
          console.log('[useBrandSyncValidator]', result.message, result.details);
        }
      } catch (error) {
        console.error('[useBrandSyncValidator] Error during validation:', error);
      }
    };

    // Solo ejecutar validación inicial si skipInitialSync es false
    if (!skipInitialSync) {
      runValidation();
    }

    // Configurar validación periódica

    // intervalRef.current = setInterval(() => {
    //   runValidation();
    // }, intervalMinutes * 60 * 1000); // TODO: Revisar la periodicidad de la sincronización

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, user?.id, intervalMinutes, skipInitialSync]);
}
