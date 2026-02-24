import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrustBadge } from '@/types/reviews';

export const useTrustBadges = () => {
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrustBadges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trust_badges')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBadges(data as TrustBadge[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading trust badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrustBadges();
  }, []);

  return {
    badges,
    loading,
    error,
    refetch: fetchTrustBadges
  };
};