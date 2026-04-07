import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getProductAnalytics, ProductAnalyticsData } from '@/services/analytics.actions';

export const useProductAnalytics = () => {
  const [data, setData] = useState<ProductAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProductAnalytics();
      setData(result);
    } catch {
      toast.error('Error al cargar analytics de productos');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetchAnalytics };
};
