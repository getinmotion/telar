import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CmsAction, CmsRequestDto } from './dto/cms-request.dto';

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);
  private readonly accessToken: string;
  private readonly apiUrl = 'https://api.storyblok.com/v2/cdn';
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes
  private readonly timeout = 8000; // 8 seconds

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const accessToken = this.configService.get<string>('CMS_KEY');
    if (!accessToken) {
      throw new Error('CMS_KEY (Storyblok access token) not configured');
    }
    this.accessToken = accessToken;
    this.logger.log('✅ Storyblok CMS Service initialized');
  }

  /**
   * Procesar request del CMS según la action
   */
  async processRequest(dto: CmsRequestDto): Promise<any> {
    this.logger.log(`CMS Action: ${dto.action}, Slug: ${dto.slug || 'N/A'}`);

    switch (dto.action) {
      case CmsAction.HERO_SLIDES:
        return this.getHeroSlides();

      case CmsAction.EDITORIAL_STORIES:
        return this.getEditorialStories();

      case CmsAction.STATS:
        return this.getStats();

      case CmsAction.NEWSLETTER:
        return this.getNewsletter();

      case CmsAction.CATEGORIES:
        return this.getCategories();

      case CmsAction.BLOG_ARTICLES:
        return this.getBlogArticles(dto.page, dto.per_page);

      case CmsAction.BLOG_ARTICLE:
        if (!dto.slug) {
          throw new BadRequestException(
            'Slug is required for blog-article action',
          );
        }
        return this.getBlogArticle(dto.slug);

      case CmsAction.LEGAL_PAGE:
        if (!dto.slug) {
          throw new BadRequestException(
            'Slug is required for legal-page action',
          );
        }
        return this.getLegalPage(dto.slug);

      case CmsAction.PAGE_HEADER:
        if (!dto.slug) {
          throw new BadRequestException(
            'Slug is required for page-header action',
          );
        }
        return this.getPageHeader(dto.slug);

      default:
        throw new BadRequestException(`Unknown action: ${dto.action}`);
    }
  }

  /**
   * Fetch data from Storyblok API with caching
   */
  private async fetchFromStoryblok(
    endpoint: string,
    params: Record<string, string> = {},
  ): Promise<any> {
    const cacheKey = `storyblok:${endpoint}:${JSON.stringify(params)}`;

    // Try cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for: ${endpoint}`);
      return cached;
    }

    // Build URL
    const searchParams = new URLSearchParams({
      token: this.accessToken,
      version: 'published',
      ...params,
    });
    const url = `${this.apiUrl}${endpoint}?${searchParams.toString()}`;

    this.logger.log(`Fetching from Storyblok: ${endpoint}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      // Handle 404 gracefully
      if (response.status === 404) {
        this.logger.log(
          `Content not found: ${endpoint} - returning empty data`,
        );
        const emptyData = { story: null, stories: [] };
        await this.cacheManager.set(cacheKey, emptyData, this.cacheTTL);
        return emptyData;
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Storyblok API error: ${response.status} - ${errorText}`,
        );
        throw new Error(`Storyblok API error: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      await this.cacheManager.set(cacheKey, data, this.cacheTTL);

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.error(`Storyblok request timeout for ${endpoint}`);
      } else {
        this.logger.error(
          `Storyblok fetch failed for ${endpoint}:`,
          error.message,
        );
      }
      // Return empty data on error (graceful degradation)
      return { story: null, stories: [] };
    }
  }

  /**
   * Helper: Get content field with case-insensitive lookup
   */
  private getContentField(content: any, fieldName: string): any {
    if (!content) return null;

    // Try exact match first
    if (content[fieldName] !== undefined) return content[fieldName];

    // Try case-insensitive match
    const lowerField = fieldName.toLowerCase();
    const key = Object.keys(content).find(
      (k) => k.toLowerCase() === lowerField,
    );
    return key ? content[key] : null;
  }

  /**
   * Helper: Normalize Storyblok image object
   */
  private normalizeImage(img: any): any {
    if (!img) return null;
    return {
      filename: img.Filename || img.filename || '',
      alt: img.Alt || img.alt || '',
      name: img.Name || img.name || '',
      focus: img.Focus || img.focus || '',
      title: img.Title || img.title || '',
      copyright: img.Copyright || img.copyright || '',
    };
  }

  /**
   * Helper: Normalize Storyblok link object
   */
  private normalizeLink(rawLink: any): any {
    if (!rawLink) return null;

    if (typeof rawLink === 'string') {
      return {
        linktype: 'url',
        url: rawLink,
        cached_url: rawLink,
      };
    }

    return {
      id: rawLink.Id || rawLink.id || '',
      url: rawLink.Url || rawLink.url || '',
      linktype: rawLink.Linktype || rawLink.linktype || 'url',
      cached_url:
        rawLink.Cached_url ||
        rawLink.cached_url ||
        rawLink.Url ||
        rawLink.url ||
        '',
      target: rawLink.Target || rawLink.target || '_self',
    };
  }

  /**
   * Get hero slides from home page
   */
  private async getHeroSlides(): Promise<any[]> {
    const data = await this.fetchFromStoryblok('/stories/home');
    const body = data.story?.content?.body || [];

    return body
      .filter((block: any) => block.component === 'hero_slide')
      .filter(
        (block: any) => block.Is_active === true || block.is_active === true,
      )
      .map((block: any) => ({
        title: block.Title || block.title || '',
        subtitle: block.Subtitle || block.subtitle || '',
        image: this.normalizeImage(block.Image || block.image),
        cta_text: block.Cta_text || block.cta_text || '',
        cta_link: this.normalizeLink(block.Cta_link || block.cta_link),
        overlay_opacity: block.Overlay_opacity || block.overlay_opacity || 30,
        order: parseInt(block.Order || block.order || '0', 10),
      }))
      .sort((a: any, b: any) => a.order - b.order);
  }

  /**
   * Get editorial stories from home page
   */
  private async getEditorialStories(): Promise<any[]> {
    const data = await this.fetchFromStoryblok('/stories/home');
    const body = data.story?.content?.body || [];

    return body
      .filter((block: any) => block.component === 'editorial_story')
      .map((block: any) => ({
        title: block.Title || block.title || '',
        description: block.Description || block.description || '',
        image: block.Image || block.image || null,
        link: block.Link || block.link || '',
        order: parseInt(block.Order || block.order || '0', 10),
      }))
      .sort((a: any, b: any) => a.order - b.order);
  }

  /**
   * Get stats from home page
   */
  private async getStats(): Promise<any[]> {
    const data = await this.fetchFromStoryblok('/stories/home');
    const body = data.story?.content?.body || [];

    const statBlocks = body.filter(
      (block: any) => block.component === 'stat_item',
    );

    return statBlocks
      .filter((block: any) => block.Value || block.value) // Only include filled stats
      .map((block: any) => ({
        value: block.Value || block.value || '',
        label: block.Label || block.label || '',
        icon: block.Icon || block.icon || '',
        icon_color: block.Icon_color || block.icon_color || '',
        order: parseInt(block.Order || block.order || '0', 10),
      }))
      .sort((a: any, b: any) => a.order - b.order);
  }

  /**
   * Get newsletter configuration from home page
   */
  private async getNewsletter(): Promise<any> {
    const data = await this.fetchFromStoryblok('/stories/home');
    const body = data.story?.content?.body || [];
    const newsletterBlock = body.find(
      (block: any) => block.component === 'newsletter',
    );

    if (!newsletterBlock) return null;

    return {
      title: newsletterBlock.Title || newsletterBlock.title || null,
      description:
        newsletterBlock.Description || newsletterBlock.description || null,
      placeholder:
        newsletterBlock.Placeholder ||
        newsletterBlock.placeholder ||
        newsletterBlock.Input_placeholder ||
        newsletterBlock.input_placeholder ||
        null,
      button_text:
        newsletterBlock.Button_text || newsletterBlock.button_text || null,
      disclaimer:
        newsletterBlock.Disclaimer || newsletterBlock.disclaimer || null,
      icon: this.normalizeImage(newsletterBlock.Icon || newsletterBlock.icon),
      subtitle: newsletterBlock.Subtitle || newsletterBlock.subtitle || null,
    };
  }

  /**
   * Get marketplace categories
   */
  private async getCategories(): Promise<any[]> {
    const data = await this.fetchFromStoryblok('/stories', {
      starts_with: 'categories/',
      per_page: '100',
    });

    return (data.stories || [])
      .map((story: any) => {
        const content = story.content || {};
        const rawImage = content.Image || content.image;
        const keywordsStr = content.Keywords || content.keywords || '';
        const normalizedImage = this.normalizeImage(rawImage);

        return {
          _uid: story.uuid || '',
          component: 'marketplace_category',
          name: content.Name || content.name || story.name || '',
          slug: story.slug || '',
          description: content.Description || content.description || '',
          icon: content.Icon || content.icon || '',
          color: content.Color || content.color || '',
          image: normalizedImage,
          imageUrl: normalizedImage?.filename || '',
          keywords: keywordsStr
            ? keywordsStr
                .split(',')
                .map((k: string) => k.trim().toLowerCase())
                .filter(Boolean)
            : [],
          order: parseInt(content.Order || content.order || '0', 10),
          is_featured:
            content.Is_featured === true || content.is_featured === true,
        };
      })
      .sort((a: any, b: any) => a.order - b.order);
  }

  /**
   * Normalize a blog_article Storyblok content block into the shape the
   * frontend expects. Tolerates PascalCase field names and the two possible
   * cover/excerpt field spellings used by different Content Type versions.
   */
  private normalizeBlogArticle(story: any): any {
    const c = story.content || {};
    const rawCover =
      c.Cover_image || c.cover_image || c.Cover || c.cover || null;
    const tagsField = c.Tags || c.tags || '';
    const tags = Array.isArray(tagsField)
      ? tagsField
      : typeof tagsField === 'string'
        ? tagsField
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

    return {
      _uid: c._uid || story.uuid || '',
      component: c.component || 'blog_article',
      title: c.Title || c.title || story.name || '',
      slug: story.slug,
      full_slug: story.full_slug,
      description: c.Excerpt || c.excerpt || c.Description || c.description || '',
      cover: this.normalizeImage(rawCover),
      author_name: c.Author_name || c.author_name || '',
      author_avatar: this.normalizeImage(c.Author_avatar || c.author_avatar),
      category: c.Category || c.category || '',
      tags,
      reading_time: parseInt(
        c.Reading_time || c.reading_time || '0',
        10,
      ) || undefined,
      content: c.Content || c.content || null,
      first_published_at: story.first_published_at,
      published_at: story.published_at,
    };
  }

  /**
   * Get blog articles with pagination
   */
  private async getBlogArticles(page = 1, perPage = 10): Promise<any> {
    const data = await this.fetchFromStoryblok('/stories', {
      starts_with: 'blog/',
      per_page: String(perPage),
      page: String(page),
      sort_by: 'first_published_at:desc',
    });

    return {
      articles:
        data.stories?.map((story: any) => this.normalizeBlogArticle(story)) ||
        [],
      total: data.total || 0,
      per_page: data.per_page || perPage,
      page: page,
    };
  }

  /**
   * Get single blog article by slug
   */
  private async getBlogArticle(slug: string): Promise<any> {
    const data = await this.fetchFromStoryblok(`/stories/blog/${slug}`, {
      resolve_relations: '',
    });

    if (!data.story) return null;

    return this.normalizeBlogArticle(data.story);
  }

  /**
   * Get legal page by slug
   */
  private async getLegalPage(slug: string): Promise<any> {
    const data = await this.fetchFromStoryblok(`/stories/legal/${slug}`, {
      resolve_relations: '',
    });

    if (!data.story) return null;

    return {
      ...data.story.content,
      slug: data.story.slug,
      full_slug: data.story.full_slug,
    };
  }

  /**
   * Get page header by slug
   */
  private async getPageHeader(slug: string): Promise<any> {
    const data = await this.fetchFromStoryblok(`/stories/ui/headers/${slug}`, {
      resolve_relations: '',
    });

    return data.story?.content || null;
  }
}
