import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '@/lib/storyblokClient';
import { StatItem } from '@/types/storyblok';

export function useStats() {
  return useQuery({
    queryKey: ['storyblok', 'stats'],
    queryFn: async () => {
      const response = await fetchStats();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as StatItem[] | null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
