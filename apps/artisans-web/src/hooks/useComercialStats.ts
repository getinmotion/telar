import { useQuery } from '@tanstack/react-query';
import { getComercialStats, ComercialStats } from '@/services/admin-stats.actions';

export const useComercialStats = () => {
  const query = useQuery<ComercialStats>({
    queryKey: ['admin-stats-comercial'],
    queryFn: getComercialStats,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
