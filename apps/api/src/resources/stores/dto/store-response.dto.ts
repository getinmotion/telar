import { Store, ArtisanShop } from '../entities';

/**
 * DTO de respuesta que combina datos de shop.stores con public.artisan_shops
 * Estructura la información de la tienda nueva + datos legacy
 */
export class StoreResponseDto {
  // Datos principales de shop.stores
  id: string;
  userId: string;
  name: string;
  slug: string;
  story?: string;
  legacyId?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Datos relacionados
  contacts?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    addressLine?: string;
    department?: string;
    municipality?: string;
  };

  awards?: Array<{
    id: string;
    title: string;
    year?: number;
    issuer?: string;
  }>;

  badges?: Array<{
    id: string;
    badgeId: string;
    awardedAt: Date;
    validUntil?: Date;
  }>;

  // Datos legacy de public.artisan_shops (si existe legacyId)
  legacy?: {
    shopName: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    craftType?: string;
    region?: string;
    certifications: any[];
    contactInfo: Record<string, any>;
    socialLinks: Record<string, any>;
    active: boolean;
    featured: boolean;
    marketplaceApproved: boolean;
    publishStatus: string;
    brandClaim?: string;
    heroConfig: Record<string, any>;
    aboutContent: Record<string, any>;
    contactConfig: Record<string, any>;
    department?: string;
    municipality?: string;
  };

  /**
   * Factory method para crear DTO desde entidades
   */
  static fromEntities(store: Store, legacyShop?: ArtisanShop): StoreResponseDto {
    const response: StoreResponseDto = {
      id: store.id,
      userId: store.userId,
      name: store.name,
      slug: store.slug,
      story: store.story,
      legacyId: store.legacyId,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };

    // Agregar relaciones si existen
    if (store.contacts) {
      response.contacts = {
        email: store.contacts.email,
        phone: store.contacts.phone,
        whatsapp: store.contacts.whatsapp,
        addressLine: store.contacts.addressLine,
        department: store.contacts.department,
        municipality: store.contacts.municipality,
      };
    }

    if (store.awards?.length > 0) {
      response.awards = store.awards.map((award) => ({
        id: award.id,
        title: award.title,
        year: award.year,
        issuer: award.issuer,
      }));
    }

    if (store.badges?.length > 0) {
      response.badges = store.badges.map((badge) => ({
        id: badge.id,
        badgeId: badge.badgeId,
        awardedAt: badge.awardedAt,
        validUntil: badge.validUntil,
      }));
    }

    // Agregar datos legacy si existen
    if (legacyShop) {
      response.legacy = {
        shopName: legacyShop.shopName,
        description: legacyShop.description,
        logoUrl: legacyShop.logoUrl,
        bannerUrl: legacyShop.bannerUrl,
        craftType: legacyShop.craftType,
        region: legacyShop.region,
        certifications: legacyShop.certifications,
        contactInfo: legacyShop.contactInfo,
        socialLinks: legacyShop.socialLinks,
        active: legacyShop.active,
        featured: legacyShop.featured,
        marketplaceApproved: legacyShop.marketplaceApproved,
        publishStatus: legacyShop.publishStatus,
        brandClaim: legacyShop.brandClaim,
        heroConfig: legacyShop.heroConfig,
        aboutContent: legacyShop.aboutContent,
        contactConfig: legacyShop.contactConfig,
        department: legacyShop.department,
        municipality: legacyShop.municipality,
      };
    }

    return response;
  }
}
