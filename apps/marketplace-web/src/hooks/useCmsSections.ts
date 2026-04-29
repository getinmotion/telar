import { useQuery } from '@tanstack/react-query';
import { getCmsSections, type CmsSection } from '@/services/cms-sections.actions';

export function useCmsSections(pageKey: string) {
  return useQuery<CmsSection[]>({
    queryKey: ['cms-sections', pageKey],
    queryFn: () => getCmsSections(pageKey),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
