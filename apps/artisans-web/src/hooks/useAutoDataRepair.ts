/**
 * Auto Data Repair Hook
 * FASE 6: Hook que ejecuta auto-reparación automáticamente cuando detecta problemas
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDataIntegrityCheck } from './useDataIntegrityCheck';
import { attemptDataRepair } from '@/utils/dataRepair';
import { useToast } from './use-toast';

export const useAutoDataRepair = () => {
  const { user } = useAuth();
  const integrityReport = useDataIntegrityCheck();
  const { toast } = useToast();
  const [hasAttemptedRepair, setHasAttemptedRepair] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    // Solo intentar auto-reparación una vez por sesión si hay problemas críticos
    if (
      !user?.id ||
      hasAttemptedRepair ||
      isRepairing ||
      integrityReport.summary.critical === 0
    ) {
      return;
    }

    const performAutoRepair = async () => {
      console.log('🔧 [AUTO REPAIR] Detectados problemas críticos, iniciando auto-reparación...');
      setIsRepairing(true);

      try {
        const result = await attemptDataRepair(user.id);
        
        if (result.success) {
          console.log('🔧 [AUTO REPAIR] ✅ Reparación exitosa:', result.changes);
          toast({
            title: '✅ Datos sincronizados',
            description: 'Tus datos han sido sincronizados correctamente',
          });
        } else if (result.changes.length > 0) {
          console.log('🔧 [AUTO REPAIR] ⚠️ Reparación parcial:', result);
          toast({
            title: '⚠️ Sincronización parcial',
            description: `${result.changes.length} cambios aplicados, ${result.errors.length} errores`,
            variant: 'destructive'
          });
        } else {
          console.error('🔧 [AUTO REPAIR] ❌ Reparación fallida:', result.errors);
        }
      } catch (error) {
        console.error('🔧 [AUTO REPAIR] Error fatal:', error);
      } finally {
        setIsRepairing(false);
        setHasAttemptedRepair(true);
      }
    };

    // Ejecutar después de un pequeño delay para permitir que los datos se carguen
    const timer = setTimeout(performAutoRepair, 2000);
    return () => clearTimeout(timer);
  }, [user?.id, integrityReport.summary.critical, hasAttemptedRepair, isRepairing, toast]);

  return {
    isRepairing,
    hasAttemptedRepair,
    integrityReport
  };
};
