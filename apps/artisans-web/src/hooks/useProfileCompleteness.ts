/**
 * useProfileCompleteness
 * 
 * Hook para verificar si el perfil del usuario tiene todos los datos obligatorios.
 * Retorna información sobre campos faltantes para mostrar el modal de completar perfil.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';

interface ProfileCompletenessData {
  isComplete: boolean;
  isLoading: boolean;
  missingFields: {
    whatsapp: boolean;
    department: boolean;
    city: boolean;
  };
  currentData: {
    whatsapp?: string;
    department?: string;
    city?: string;
  };
  refresh: () => Promise<void>;
}

export const useProfileCompleteness = (): ProfileCompletenessData => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [missingFields, setMissingFields] = useState({
    whatsapp: false,
    department: false,
    city: false
  });
  const [currentData, setCurrentData] = useState<{
    whatsapp?: string;
    department?: string;
    city?: string;
  }>({});

  const checkCompleteness = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Obtener perfil desde NestJS backend
      const profile = await getUserProfileByUserId(user.id);

      const whatsappMissing = !profile?.whatsappE164 || profile.whatsappE164 === '+57' || profile.whatsappE164.length < 13;
      const departmentMissing = !profile?.department || profile.department.trim() === '';
      const cityMissing = !profile?.city || profile.city.trim() === '';

      setMissingFields({
        whatsapp: whatsappMissing,
        department: departmentMissing,
        city: cityMissing
      });

      setCurrentData({
        whatsapp: profile?.whatsappE164 || '+57',
        department: profile?.department || '',
        city: profile?.city || ''
      });

    } catch (error) {
      console.error('Error in useProfileCompleteness:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkCompleteness();
  }, [checkCompleteness]);

  const isComplete = !missingFields.whatsapp && !missingFields.department && !missingFields.city;

  return {
    isComplete,
    isLoading,
    missingFields,
    currentData,
    refresh: checkCompleteness
  };
};
