/**
 * Wishlist Types
 * Tipos para el módulo de wishlist del marketplace
 */

import type { Product } from './products.types';

/**
 * Usuario básico en wishlist
 */
export interface WishlistUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Item individual de wishlist
 */
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

/**
 * Item de wishlist con información del usuario (para admin)
 */
export interface WishlistItemWithUser extends WishlistItem {
  user: WishlistUser;
}

/**
 * Request para agregar producto a wishlist
 */
export interface AddToWishlistRequest {
  userId: string;
  productId: string;
}

/**
 * Response de crear wishlist item
 */
export interface CreateWishlistResponse {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}
