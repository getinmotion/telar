import { useQuery } from '@tanstack/react-query';
import {
  getCmsTerritories,
  getCmsTerritoryBySlug,
  type CmsTerritory,
} from '@/services/territories.actions';

export function useCmsTerritories() {
  return useQuery<CmsTerritory[]>({
    queryKey: ['cms-territories'],
    queryFn: getCmsTerritories,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCmsTerritory(slug: string | undefined) {
  return useQuery<CmsTerritory | null>({
    queryKey: ['cms-territory', slug],
    queryFn: () => (slug ? getCmsTerritoryBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
