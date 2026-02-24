// Storyblok CMS Types

export interface StoryblokImage {
  filename: string;
  alt?: string;
  name?: string;
  focus?: string;
  title?: string;
  copyright?: string;
}

export interface StoryblokLink {
  id?: string;
  url?: string;
  linktype?: 'url' | 'story' | 'asset' | 'email';
  fieldtype?: string;
  cached_url?: string;
  target?: '_self' | '_blank';
}

export interface HeroSlide {
  _uid: string;
  component: 'hero_slide';
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: StoryblokLink;
  image: StoryblokImage;
  overlay_opacity?: number;
}

export interface EditorialStory {
  _uid: string;
  component: 'editorial_story';
  title: string;
  description: string;
  image: StoryblokImage;
  link: StoryblokLink;
}

export interface StatItem {
  _uid: string;
  component: 'stat_item';
  value: string;
  label: string;
  icon: string; // Icon name: 'sparkles' | 'users' | 'map-pin' | 'star'
  icon_color?: string;
}

export interface MarketplaceCategory {
  _uid: string;
  component: 'marketplace_category';
  name: string;
  slug: string;
  description?: string;
  image: StoryblokImage;
  imageUrl?: string; // Resolved image URL for convenience
  icon?: string;
  color?: string;
  keywords?: string[];
  order?: number;
  is_featured?: boolean;
}

export interface NewsletterContent {
  _uid: string;
  component: 'newsletter';
  title: string;
  description: string;
  placeholder: string;
  button_text: string;
  disclaimer: string;
  icon?: StoryblokImage;
  subtitle?: string;
}

export interface RichTextContent {
  type: string;
  content?: RichTextContent[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  attrs?: Record<string, any>;
}

export interface BlogArticle {
  _uid: string;
  component: 'blog_article';
  title: string;
  slug: string;
  full_slug?: string;
  description: string;
  cover: StoryblokImage;
  author_name: string;
  author_avatar?: StoryblokImage;
  category: string;
  reading_time?: number;
  content: RichTextContent;
  first_published_at?: string;
  published_at?: string;
}

export interface BlogArticleListResponse {
  articles: BlogArticle[];
  total: number;
  per_page: number;
  page: number;
}

export interface LegalPage {
  _uid: string;
  component: 'legal_page';
  title: string;
  last_updated?: string;
  content: RichTextContent;
  slug?: string;
  full_slug?: string;
}

export interface PageHeader {
  _uid: string;
  component: 'page_header';
  title: string;
  description?: string;
  background_image?: StoryblokImage;
}

// Helper function to get Storyblok image URL
// Returns filename directly - Storyblok URLs are already optimized
export function getStoryblokImageUrl(
  image: StoryblokImage | string | undefined,
  _options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'png' | 'jpg';
    fit?: 'crop' | 'contain' | 'cover';
    focus?: string;
  }
): string {
  if (!image) return '';
  
  const filename = typeof image === 'string' ? image : image.filename;
  return filename || '';
}

// Helper to resolve Storyblok links
export function resolveStoryblokLink(link: StoryblokLink | undefined): string {
  if (!link) return '#';
  
  if (link.linktype === 'url') {
    return link.url || link.cached_url || '#';
  }
  
  if (link.linktype === 'story') {
    return '/' + (link.cached_url || link.url || '').replace(/^\//, '');
  }
  
  if (link.linktype === 'email') {
    return `mailto:${link.url || link.cached_url || ''}`;
  }
  
  return link.url || link.cached_url || '#';
}
