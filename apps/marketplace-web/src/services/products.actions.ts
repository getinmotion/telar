/**
 * Products Service
 * Servicio para gestión de productos del marketplace con el backend NestJS
 */

import { telarApiPublic, telarApi } from '@/integrations/api/telarApi';
import { toastError } from '@/utils/toast.utils';
import type {
  Product,
  ProductsResponse,
  ProductsFilters,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/products.types';

/**
 * Obtener productos de marketplace con filtros y paginación
 *
 * Soporta búsqueda, filtros por categoría, región, tipo de artesanía y más.
 * Incluye paginación y ordenamiento personalizado.
 * Retorna productos enriquecidos con stock, rating, y datos de tienda.
 *
 * @param {ProductsFilters} filters - Filtros opcionales para la búsqueda
 * @returns {Promise<ProductsResponse>} Listado paginado de productos con metadata
 *
 * @endpoint GET /products/marketplace
 *
 * @example
 * // Obtener todos los productos (página 1, límite 20)
 * const products = await getProducts();
 *
 * @example
 * // Filtros de marketplace
 * const products = await getProducts({
 *   category: 'Textiles',
 *   region: 'Caribe',
 *   craftType: 'wayuu',
 *   featured: true,
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'created_at',
 *   order: 'DESC'
 * });
 */
export const getProducts = async (
  filters?: ProductsFilters
): Promise<ProductsResponse> => {
  try {
    const response = await telarApiPublic.get<ProductsResponse>('/products/marketplace', {
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener el detalle de un producto de marketplace por su ID
 *
 * Retorna el producto con datos enriquecidos: stock calculado desde variantes,
 * rating promedio, información completa de la tienda, etc.
 *
 * @param {string} id - ID del producto (UUID)
 * @returns {Promise<Product>} Detalle completo del producto enriquecido
 *
 * @endpoint GET /products/marketplace/:id
 *
 * @example
 * const product = await getProductById('123e4567-e89b-12d3-a456-426614174000');
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await telarApiPublic.get<Product>(`/products/marketplace/${id}`);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener productos activos de marketplace
 *
 * Alias de getProducts() sin filtros, retorna todos los productos activos.
 *
 * @returns {Promise<ProductsResponse>} Response con productos activos
 *
 * @endpoint GET /products/marketplace
 *
 * @example
 * const activeProducts = await getActiveProducts();
 */
export const getActiveProducts = async (): Promise<ProductsResponse> => {
  try {
    const response = await telarApiPublic.get<ProductsResponse>('/products/marketplace');
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener productos destacados del marketplace
 *
 * Retorna solo productos marcados como "featured" con datos enriquecidos.
 *
 * @returns {Promise<Product[]>} Lista de productos destacados
 *
 * @endpoint GET /products/marketplace/featured
 *
 * @example
 * const featuredProducts = await getFeaturedProducts();
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await telarApiPublic.get<Product[]>('/products/marketplace/featured');
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener productos de marketplace de una tienda específica
 *
 * Retorna todos los productos de una tienda con datos enriquecidos.
 *
 * @param {string} shopId - ID de la tienda (UUID)
 * @returns {Promise<Product[]>} Lista de productos de la tienda
 *
 * @endpoint GET /products/marketplace/shop/:shopId
 *
 * @example
 * const shopProducts = await getProductsByShop('shop-uuid');
 */
export const getProductsByShop = async (shopId: string): Promise<Product[]> => {
  try {
    const response = await telarApiPublic.get<Product[]>(`/products/marketplace/shop/${shopId}`);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener productos de un usuario específico (requiere autenticación)
 *
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<Product[]>} Lista de productos del usuario
 *
 * @endpoint GET /products/user/:userId
 *
 * @example
 * const userProducts = await getProductsByUser('user-uuid');
 */
export const getProductsByUser = async (userId: string): Promise<Product[]> => {
  try {
    const response = await telarApi.get<Product[]>(`/products/user/${userId}`);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Crear un nuevo producto (requiere autenticación y permisos de admin)
 *
 * @param {CreateProductRequest} data - Datos del producto a crear
 * @returns {Promise<Product>} Producto creado
 *
 * @endpoint POST /products
 *
 * @example
 * const newProduct = await createProduct({
 *   name: 'Vasija de cerámica',
 *   price: 45000,
 *   categoryId: 'category-id',
 *   shopId: 'shop-id'
 * });
 */
export const createProduct = async (
  data: CreateProductRequest
): Promise<Product> => {
  try {
    const response = await telarApi.post<Product>('/products', data);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Actualizar un producto existente (requiere autenticación y permisos)
 *
 * @param {string} id - ID del producto a actualizar
 * @param {UpdateProductRequest} data - Datos a actualizar
 * @returns {Promise<Product>} Producto actualizado
 *
 * @endpoint PATCH /products/:id
 *
 * @example
 * const updated = await updateProduct('product-id', { price: 50000 });
 */
export const updateProduct = async (
  id: string,
  data: UpdateProductRequest
): Promise<Product> => {
  try {
    const response = await telarApi.patch<Product>(`/products/${id}`, data);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Eliminar un producto (hard delete - requiere autenticación y permisos de admin)
 *
 * @param {string} id - ID del producto a eliminar (UUID)
 * @returns {Promise<{ message: string }>} Mensaje de confirmación
 *
 * @endpoint DELETE /products/:id
 *
 * @example
 * const result = await deleteProduct('product-id');
 * // result: { message: "Producto con ID xxx eliminado exitosamente" }
 */
export const deleteProduct = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await telarApi.delete<{ message: string }>(
      `/products/${id}`
    );
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
