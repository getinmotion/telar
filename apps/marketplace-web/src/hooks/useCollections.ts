import { useQuery } from '@tanstack/react-query';
import {
  listCollections,
  getCollectionBySlug,
  type Collection,
  type ListCollectionsResponse,
} from '@/services/collections.actions';

export function useCollections(params: { limit?: number; offset?: number } = {}) {
  return useQuery<ListCollectionsResponse>({
    queryKey: ['collections', params],
    queryFn: () => listCollections(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCollection(slug: string) {
  return useQuery<Collection>({
    queryKey: ['collection', slug],
    queryFn: () => getCollectionBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
