import { useQuery } from '@tanstack/react-query';
import { fetchNewsletterContent } from '@/lib/storyblokClient';
import { NewsletterContent } from '@/types/storyblok';

export function useNewsletterContent() {
  return useQuery({
    queryKey: ['storyblok', 'newsletter'],
    queryFn: async () => {
      const response = await fetchNewsletterContent();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as NewsletterContent | null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
