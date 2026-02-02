import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

export const useRUTPending = () => {
  const { user } = useAuth();
  const { profile, loading: unifiedLoading } = useUnifiedUserData();
  const [isRUTPending, setIsRUTPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRUTStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Wait for unified data to load
      if (unifiedLoading) {
        return;
      }

      try {
        // ✅ Use cached profile data instead of querying
        setIsRUTPending(profile?.rutPendiente === true || !profile?.rut);
        setIsLoading(false);
      } catch (err) {
        console.error('[useRUTPending] Error:', err);
        setIsRUTPending(false);
        setIsLoading(false);
      }
    };

    checkRUTStatus();

    // Set up real-time subscription for RUT status changes
    if (!user) return;

    const subscription = supabase
      .channel('rut_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('[useRUTPending] Real-time update received:', payload);
        const newData = payload.new as any;
        setIsRUTPending(newData.rut_pendiente === true || !newData.rut);
        setIsLoading(false);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, unifiedLoading, profile]);

  return { isRUTPending, isLoading };
};
