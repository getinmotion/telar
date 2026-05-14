/**
 * Store Response Types - Respuesta completa del backend
 * Combina shop.stores + relaciones + datos legacy
 */

import type {
  StoreContacts,
  StoreAward,
  StoreBadge,
} from './store.types';
import type { LegacyShopData } from './store-legacy.types';

/**
 * Respuesta combinada del backend /stores
 * Incluye:
 * - Datos de shop.stores (nuevos)
 * - Relaciones normalizadas (contacts, awards, badges)
 * - Datos legacy de public.artisan_shops (si existe legacyId)
 */
export interface StoreResponse {
  // Datos principales de shop.stores
  id: string;
  userId: string;
  name: string;
  slug: string;
  story?: string;
  legacyId?: string;
  createdAt: string;
  updatedAt?: string;

  // Relaciones normalizadas
  contacts?: StoreContacts;
  awards?: StoreAward[];
  badges?: StoreBadge[];

  // Datos legacy (puede venir como 'legacy' o 'legacyShop' según backend)
  legacy?: LegacyShopData;
  legacyShop?: LegacyShopData;
}
