/**
 * Stores Module - Barrel Export
 * Re-exporta todos los tipos relacionados con tiendas
 */

// Core types
export type {
  Store,
  StoreArtisanalProfile,
  StoreContacts,
  StoreAward,
  StoreBadge,
} from './store.types';

// Response types
export type { StoreResponse } from './store-response.types';

// Legacy types
export type { LegacyShopData } from './store-legacy.types';

// Mapped types - Proper migration from StoreResponse
export type {
  ArtisanShop,
  PrivacyLevel,
  CreationStatus,
  PublishStatus,
  BankDataStatus,
  MarketplaceApprovalStatus,
  ContactInfo,
  SocialLinks,
  SeoData,
  DataClassification,
  HeroConfig,
  AboutContent,
  ContactConfig,
  ArtisanProfile,
} from './artisan-shop.types';
