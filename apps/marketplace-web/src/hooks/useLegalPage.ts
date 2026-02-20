import { useQuery } from '@tanstack/react-query';
import { fetchLegalPage } from '@/lib/storyblokClient';
import { LegalPage } from '@/types/storyblok';

export function useLegalPage(slug: string) {
  return useQuery({
    queryKey: ['storyblok', 'legal-page', slug],
    queryFn: async () => {
      const response = await fetchLegalPage(slug);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as LegalPage | null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
