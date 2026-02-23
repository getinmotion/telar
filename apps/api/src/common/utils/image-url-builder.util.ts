import { ConfigService } from '@nestjs/config';

/**
 * Utility to build full CDN URLs from relative image paths
 *
 * This utility transforms relative paths stored in the database
 * (e.g., "/images/brand-assets/uuid/file.jpg") into full CDN URLs
 * (e.g., "https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/brand-assets/uuid/file.jpg")
 *
 * Benefits:
 * - Environment flexibility (different CDN domains for dev/staging/prod)
 * - Easy CDN provider changes without database migration
 * - Smaller database storage (no repeated domain strings)
 * - Better security (can add signed URLs later)
 */
export class ImageUrlBuilder {
  private static cdnBaseUrl: string;

  /**
   * Initialize with environment configuration
   * Must be called once at app startup (in main.ts)
   */
  static configure(configService: ConfigService): void {
    this.cdnBaseUrl = configService.get<string>(
      'CDN_BASE_URL',
      'https://telar-stg-bucket.s3.us-east-1.amazonaws.com',
    );
  }

  /**
   * Build full CDN URL from relative path
   * @param relativePath - Path stored in database (e.g., "/images/file.jpg")
   * @returns Full CDN URL or null if path is null/invalid
   *
   * @example
   * ImageUrlBuilder.buildUrl("/images/brand-assets/uuid/logo.jpg")
   * // Returns: "https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/brand-assets/uuid/logo.jpg"
   *
   * @example
   * ImageUrlBuilder.buildUrl(null)
   * // Returns: null
   */
  static buildUrl(relativePath: string | null): string | null {
    if (!relativePath) return null;

    // Handle already-full URLs (backward compatibility during migration)
    if (
      relativePath.startsWith('http://') ||
      relativePath.startsWith('https://')
    ) {
      return relativePath;
    }

    // Ensure path starts with /
    const path = relativePath.startsWith('/')
      ? relativePath
      : `/${relativePath}`;

    return `${this.cdnBaseUrl}${path}`;
  }

  /**
   * Build URLs for array of paths
   * @param paths - Array of relative paths
   * @returns Array of full CDN URLs (nulls filtered out)
   *
   * @example
   * ImageUrlBuilder.buildUrls(["/images/img1.jpg", "/images/img2.jpg"])
   * // Returns: ["https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/img1.jpg", ...]
   */
  static buildUrls(paths: string[] | null): string[] {
    if (!paths || paths.length === 0) return [];
    return paths.map((p) => this.buildUrl(p)).filter(Boolean) as string[];
  }

  /**
   * Transform JSONB object with nested image URLs
   * Used for complex objects like hero_config, artisan_profile, etc.
   *
   * @param obj - JSONB object from database
   * @returns Transformed object with full CDN URLs
   *
   * @example
   * // Transform hero_config with slides
   * ImageUrlBuilder.transformObject({
   *   slides: [{ imageUrl: "/images/hero1.jpg" }]
   * })
   * // Returns: {
   * //   slides: [{ imageUrl: "https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/hero1.jpg" }]
   * // }
   */
  static transformObject(obj: any): any {
    if (!obj) return obj;

    // Deep clone to avoid mutation
    const transformed = JSON.parse(JSON.stringify(obj));

    // Transform hero_config.slides[].imageUrl (actual field name from data)
    if (transformed.slides && Array.isArray(transformed.slides)) {
      transformed.slides = transformed.slides.map((slide) => ({
        ...slide,
        imageUrl: this.buildUrl(slide.imageUrl),
      }));
    }

    // Transform artisan_profile single image
    if (transformed.artisanPhoto) {
      transformed.artisanPhoto = this.buildUrl(transformed.artisanPhoto);
    }

    // Transform artisan_profile image arrays (actual field names from data)
    if (transformed.familyPhotos) {
      transformed.familyPhotos = this.buildUrls(transformed.familyPhotos);
    }
    if (transformed.workingPhotos) {
      transformed.workingPhotos = this.buildUrls(transformed.workingPhotos);
    }
    if (transformed.workshopPhotos) {
      transformed.workshopPhotos = this.buildUrls(transformed.workshopPhotos);
    }
    if (transformed.communityPhotos) {
      transformed.communityPhotos = this.buildUrls(transformed.communityPhotos);
    }

    return transformed;
  }
}
