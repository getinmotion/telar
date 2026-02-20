import { useQuery } from '@tanstack/react-query';
import { fetchHeroSlides } from '@/lib/storyblokClient';
import { HeroSlide } from '@/types/storyblok';

export function useHeroSlides() {
  return useQuery({
    queryKey: ['storyblok', 'hero-slides'],
    queryFn: async () => {
      const response = await fetchHeroSlides();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as HeroSlide[] | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
