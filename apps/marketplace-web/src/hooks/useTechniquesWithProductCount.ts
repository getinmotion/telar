import { useQuery } from '@tanstack/react-query';
import {
  getTechniquesWithProductCount,
  type TechniqueWithProductCount,
} from '@/services/taxonomy.actions';

export function useTechniquesWithProductCount() {
  return useQuery<TechniqueWithProductCount[]>({
    queryKey: ['techniques', 'with-product-count'],
    queryFn: getTechniquesWithProductCount,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
