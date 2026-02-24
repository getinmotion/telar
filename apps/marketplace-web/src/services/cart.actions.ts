/**
 * Cart Service
 * Servicio para gestión del carrito de compras con el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  SyncGuestCartRequest,
  SyncGuestCartResponse,
  Cart,
  CartItemDetailed,
  AddCartItemRequest,
  UpdateCartItemRequest,
  DeleteCartItemResponse,
  UpdateCartStatusRequest,
} from '@/types/cart.types';

/**
 * Sincronizar carrito de invitado con usuario autenticado
 *
 * Cuando un usuario invitado se autentica, este endpoint sincroniza
 * los items del carrito local (localStorage) con el carrito del usuario
 * en la base de datos.
 *
 * Si el usuario ya tiene items en su carrito, se mergean con los del invitado.
 * Si no existe un carrito para el usuario, se crea uno nuevo.
 *
 * @param {SyncGuestCartRequest} data - Datos para sincronización
 * @param {string} data.buyerUserId - ID del usuario autenticado (UUID)
 * @param {CartItemToSync[]} data.items - Items del carrito a sincronizar
 * @returns {Promise<SyncGuestCartResponse>} Response con el ID del carrito
 *
 * @endpoint POST /cart/sync-guest
 *
 * @example
 * // Sincronizar carrito después del login
 * const localItems = [
 *   { productId: 'product-uuid', quantity: 2 },
 *   { productId: 'product-uuid-2', variantId: 'variant-uuid', quantity: 1 }
 * ];
 * const result = await syncGuestCart({
 *   buyerUserId: user.id,
 *   items: localItems
 * });
 * console.log('Cart ID:', result.cartId);
 *
 * @example
 * // Crear carrito vacío para gift cards only
 * const result = await syncGuestCart({
 *   buyerUserId: user.id,
 *   items: [] // Array vacío creará un carrito vacío
 * });
 */
export const syncGuestCart = async (
  data: SyncGuestCartRequest
): Promise<SyncGuestCartResponse> => {
  try {
    const response = await telarApi.post<SyncGuestCartResponse>(
      '/cart/sync-guest',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('[CartActions] Error syncing guest cart:', error);
    throw error;
  }
};

/**
 * Obtener carrito OPEN activo del comprador
 *
 * Retorna el carrito con estado 'open' del usuario autenticado.
 * Si el usuario no tiene un carrito activo, retornará un 404.
 *
 * @param {string} buyerUserId - ID del usuario comprador (UUID)
 * @returns {Promise<Cart>} Carrito activo con información del comprador y tienda de contexto
 *
 * @endpoint GET /cart/buyer/:buyerUserId/open
 *
 * @example
 * const cart = await getOpenCart(user.id);
 * console.log('Cart ID:', cart.id, 'Status:', cart.status);
 */
export const getOpenCart = async (buyerUserId: string): Promise<Cart> => {
  try {
    const response = await telarApi.get<Cart>(
      `/cart/buyer/${buyerUserId}/open`
    );
    return response.data;
  } catch (error: any) {
    console.error('[CartActions] Error getting open cart:', error);
    throw error;
  }
};

/**
 * Obtener items del carrito
 *
 * Retorna todos los items de un carrito específico con información
 * enriquecida del producto y tienda vendedora.
 *
 * @param {string} cartId - ID del carrito (UUID)
 * @returns {Promise<CartItemDetailed[]>} Array de items con producto y tienda
 *
 * @endpoint GET /cart-items/cart/:cartId
 *
 * @example
 * const items = await getCartItems(cart.id);
 * items.forEach(item => {
 *   const price = parseFloat(item.unitPriceMinor) / 100;
 *   console.log(`${item.product.name}: $${price} x ${item.quantity}`);
 * });
 */
export const getCartItems = async (
  cartId: string
): Promise<CartItemDetailed[]> => {
  try {
    const response = await telarApi.get<CartItemDetailed[]>(
      `/cart-items/cart/${cartId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('[CartActions] Error getting cart items:', error);
    throw error;
  }
};

/**
 * Agregar item al carrito
 *
 * Agrega un nuevo item al carrito o incrementa la cantidad si ya existe.
 * El backend valida que el carrito esté en estado 'open' y maneja
 * el merge automático de cantidades para items duplicados.
 *
 * @param {AddCartItemRequest} data - Datos del item a agregar
 * @returns {Promise<CartItemDetailed>} Item agregado con información enriquecida
 *
 * @endpoint POST /cart-items
 *
 * @example
 * const newItem = await addCartItem({
 *   cartId: cart.id,
 *   productId: product.id,
 *   sellerShopId: product.shopId,
 *   quantity: 2,
 *   currency: 'COP',
 *   unitPriceMinor: '5000000', // $50,000
 *   priceSource: 'PRODUCT_BASE',
 *   metadata: { variantId: 'size-M' }
 * });
 */
export const addCartItem = async (
  data: AddCartItemRequest
): Promise<CartItemDetailed> => {
  try {
    const response = await telarApi.post<CartItemDetailed>('/cart-items', data);
    return response.data;
  } catch (error: any) {
    console.error('[CartActions] Error adding cart item:', error);
    throw error;
  }
};

/**
 * Actualizar item del carrito
 *
 * Actualiza uno o más campos de un item del carrito.
 * Típicamente usado para cambiar la cantidad.
 *
 * @param {string} itemId - ID del item a actualizar (UUID)
 * @param {UpdateCartItemRequest} data - Campos a actualizar (todos opcionales)
 * @returns {Promise<CartItemDetailed>} Item actualizado
 *
 * @endpoint PATCH /cart-items/:itemId
 *
 * @example
 * // Actualizar solo la cantidad
 * const updatedItem = await updateCartItem(itemId, { quantity: 5 });
 *
 * @example
 * // Actualizar cantidad y metadata
 * const updatedItem = await updateCartItem(itemId, {
 *   quantity: 3,
 *   metadata: { variantId: 'size-L' }
 * });
 */
export const updateCartItem = async (
  itemId: string,
  data: UpdateCartItemRequest
): Promise<CartItemDetailed> => {
  try {
    const response = await telarApi.patch<CartItemDetailed>(
      `/cart-items/${itemId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('[CartActions] Error updating cart item:', error);
    throw error;
  }
};

/**
 * Eliminar item del carrito
 *
 * Elimina un item del carrito. El backend valida que el carrito
 * esté en estado 'open' antes de permitir la eliminación.
 *
 * @param {string} itemId - ID del item a eliminar (UUID)
 * @returns {Promise<DeleteCartItemResponse>} Mensaje de confirmación
 *
 * @endpoint DELETE /cart-items/:itemId
 *
 * @example
 * const result = await deleteCartItem(itemId);
 * console.log(result.message); // "Item eliminado exitosamente"
 */
export const deleteCartItem = async (
  itemId: string
): Promise<DeleteCartItemResponse> => {
  try {
    const response = await telarApi.delete<DeleteCartItemResponse>(
      `/cart-items/${itemId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('[CartActions] Error deleting cart item:', error);
    throw error;
  }
};

/**
 * Actualizar estado del carrito
 *
 * Cambia el estado del carrito en su ciclo de vida:
 * - open: Carrito activo, puede modificarse
 * - locked: Carrito bloqueado durante checkout, no puede modificarse
 * - converted: Carrito convertido en orden exitosamente
 * - abandoned: Carrito abandonado por el usuario
 *
 * @param {string} cartId - ID del carrito (UUID)
 * @param {UpdateCartStatusRequest} data - Nuevo estado
 * @returns {Promise<Cart>} Carrito con estado actualizado
 *
 * @endpoint PATCH /cart/:cartId/status
 *
 * @example
 * // Bloquear carrito al iniciar checkout
 * const lockedCart = await updateCartStatus(cart.id, { status: 'locked' });
 *
 * @example
 * // Marcar como convertido después de pago exitoso
 * const convertedCart = await updateCartStatus(cart.id, { status: 'converted' });
 *
 * @example
 * // Reabrir carrito si checkout falla
 * const reopenedCart = await updateCartStatus(cart.id, { status: 'open' });
 */
export const updateCartStatus = async (
  cartId: string,
  data: UpdateCartStatusRequest
): Promise<Cart> => {
  try {
    const response = await telarApi.patch<Cart>(`/cart/${cartId}/status`, data);
    return response.data;
  } catch (error: any) {
    console.error('[CartActions] Error updating cart status:', error);
    throw error;
  }
};
