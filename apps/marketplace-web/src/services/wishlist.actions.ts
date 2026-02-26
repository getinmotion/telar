/**
 * Wishlist Service
 * Servicio para gestión de wishlist con el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import { toastError } from '@/utils/toast.utils';
import type {
  WishlistItem,
  WishlistItemWithUser,
  AddToWishlistRequest,
  CreateWishlistResponse,
} from '@/types/wishlist.types';

/**
 * Obtener wishlist del usuario actual con productos completos
 *
 * Retorna la lista de productos favoritos del usuario con todos los detalles
 * incluyendo información de la tienda.
 *
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<WishlistItem[]>} Lista de items en wishlist con productos
 *
 * @endpoint GET /wishlist/user/:userId
 *
 * @example
 * const wishlist = await getUserWishlist(user.id);
 */
export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const response = await telarApi.get<WishlistItem[]>(`/wishlist/user/${userId}`);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener todos los wishlists (Admin)
 *
 * Retorna todos los items de wishlist de todos los usuarios.
 * Este endpoint requiere permisos de administrador.
 *
 * @returns {Promise<WishlistItemWithUser[]>} Lista de todos los items con usuario y producto
 *
 * @endpoint GET /wishlist
 *
 * @example
 * const allWishlists = await getAllWishlists();
 */
export const getAllWishlists = async (): Promise<WishlistItemWithUser[]> => {
  try {
    const response = await telarApi.get<WishlistItemWithUser[]>('/wishlist');
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Agregar producto a wishlist
 *
 * Agrega un producto a la lista de favoritos del usuario.
 * Previene duplicados automáticamente en el backend.
 *
 * @param {AddToWishlistRequest} data - userId y productId
 * @returns {Promise<CreateWishlistResponse>} Item de wishlist creado
 *
 * @endpoint POST /wishlist
 *
 * @example
 * const wishlistItem = await addToWishlist({
 *   userId: user.id,
 *   productId: 'product-uuid'
 * });
 */
export const addToWishlist = async (
  data: AddToWishlistRequest
): Promise<CreateWishlistResponse> => {
  try {
    const response = await telarApi.post<CreateWishlistResponse>('/wishlist', data);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Eliminar producto de wishlist
 *
 * Remueve un producto específico de la lista de favoritos del usuario.
 *
 * @param {string} userId - ID del usuario (UUID)
 * @param {string} productId - ID del producto a eliminar (UUID)
 * @returns {Promise<void>}
 *
 * @endpoint DELETE /wishlist/user/:userId/product/:productId
 *
 * @example
 * await removeFromWishlist(user.id, 'product-uuid');
 */
export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    await telarApi.delete(`/wishlist/user/${userId}/product/${productId}`);
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
