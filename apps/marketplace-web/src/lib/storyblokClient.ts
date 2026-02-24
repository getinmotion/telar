import { supabase } from '@/integrations/supabase/client';
import {
  BlogArticle,
  BlogArticleListResponse,
  EditorialStory,
  HeroSlide,
  LegalPage,
  NewsletterContent,
  StatItem,
} from '@/types/storyblok';

type StoryblokResponse<T> = { data: T | null; error: string | null };

async function callCMS<T>(
  action: string,
  params?: Record<string, unknown>
): Promise<StoryblokResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke('storyblok-cms', {
      body: { action, ...params },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data?.data ?? data) as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: message };
  }
}

export function fetchHeroSlides(): Promise<StoryblokResponse<HeroSlide[]>> {
  return callCMS<HeroSlide[]>('hero-slides');
}

export function fetchEditorialStories(): Promise<StoryblokResponse<EditorialStory[]>> {
  return callCMS<EditorialStory[]>('editorial-stories');
}

export function fetchStats(): Promise<StoryblokResponse<StatItem[]>> {
  return callCMS<StatItem[]>('stats');
}

export function fetchNewsletterContent(): Promise<StoryblokResponse<NewsletterContent>> {
  return callCMS<NewsletterContent>('newsletter');
}

export function fetchBlogArticles(
  page: number = 1,
  perPage: number = 10
): Promise<StoryblokResponse<BlogArticleListResponse>> {
  return callCMS<BlogArticleListResponse>('blog-articles', { page, per_page: perPage });
}

export function fetchBlogArticle(slug: string): Promise<StoryblokResponse<BlogArticle>> {
  return callCMS<BlogArticle>('blog-article', { slug });
}

export function fetchLegalPage(slug: string): Promise<StoryblokResponse<LegalPage>> {
  return callCMS<LegalPage>('legal-page', { slug });
}
