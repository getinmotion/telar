import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getQueueScoresBatch, type QueueScoreApi } from '@/services/moderation.actions';

export function useQueueScores(itemIds: string[]) {
  const { user } = useAuth();
  return useQuery<Record<string, QueueScoreApi>>({
    queryKey: ['queue-scores', user?.id, ...itemIds.sort()],
    queryFn: () => getQueueScoresBatch(itemIds, user?.id),
    enabled: itemIds.length > 0,
    staleTime: 60_000,
  });
}

export function useQueueScore(itemId: string | undefined) {
  const { user } = useAuth();
  return useQuery<QueueScoreApi | null>({
    queryKey: ['queue-score', user?.id, itemId],
    queryFn: async () => {
      if (!itemId) return null;
      const map = await getQueueScoresBatch([itemId], user?.id);
      return map[itemId] ?? null;
    },
    enabled: !!itemId,
    staleTime: 60_000,
  });
}
