/**
 * Store Types - Nueva arquitectura normalizada
 * Tipos para shop.stores (tabla principal de tiendas)
 */

// ============= Core Store Types =============

export interface Store {
  id: string;
  userId: string;
  name: string;
  slug: string;
  story?: string;
  legacyId?: string; // UUID que apunta a public.artisan_shops (legacy)
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

// ============= Related Entities =============

export interface StoreContacts {
  email?: string;
  phone?: string;
  whatsapp?: string;
  addressLine?: string;
  department?: string;
  municipality?: string;
}

export interface StoreAward {
  id: string;
  title: string;
  year?: number;
  issuer?: string;
}

export interface StoreBadge {
  id: string;
  badgeId: string;
  awardedAt: string;
  validUntil?: string;
}
