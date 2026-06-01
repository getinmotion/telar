import { useQuery } from '@tanstack/react-query';
import { getQueueScoresBatch, type QueueScoreApi } from '@/services/moderation.actions';

export function useQueueScores(itemIds: string[]) {
  return useQuery<Record<string, QueueScoreApi>>({
    queryKey: ['queue-scores', ...itemIds.sort()],
    queryFn: () => getQueueScoresBatch(itemIds),
    enabled: itemIds.length > 0,
    staleTime: 60_000,
  });
}

export function useQueueScore(itemId: string | undefined) {
  return useQuery<QueueScoreApi | null>({
    queryKey: ['queue-score', itemId],
    queryFn: async () => {
      if (!itemId) return null;
      const map = await getQueueScoresBatch([itemId]);
      return map[itemId] ?? null;
    },
    enabled: !!itemId,
    staleTime: 60_000,
  });
}
