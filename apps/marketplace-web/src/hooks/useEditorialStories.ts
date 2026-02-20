import { useQuery } from '@tanstack/react-query';
import { fetchEditorialStories } from '@/lib/storyblokClient';
import { EditorialStory } from '@/types/storyblok';

export function useEditorialStories() {
  return useQuery({
    queryKey: ['storyblok', 'editorial-stories'],
    queryFn: async () => {
      const response = await fetchEditorialStories();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as EditorialStory[] | null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
