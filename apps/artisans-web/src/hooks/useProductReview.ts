/**
 * useProductReview Hook
 * Manages state and API calls for the Product Review page.
 * Fetches products by store using the products-new API and taxonomy data.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { telarApi } from '@/integrations/api/telarApi';
import type {
  ProductResponse,
  CreateProductsNewDto,
} from '@/services/products-new.types';

export interface StoreOption {
  id: string;
  name: string;
  shopSlug?: string;
}

export const useProductReview = () => {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Fetch all stores from the API
   */
  const fetchStores = useCallback(async () => {
    setLoadingStores(true);
    try {
      const response = await telarApi.get<StoreOption[]>('/stores');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error al cargar tiendas');
    } finally {
      setLoadingStores(false);
    }
  }, []);

  /**
   * Fetch products for a specific store
   */
  const fetchProductsByStore = useCallback(async (storeId: string) => {
    setLoadingProducts(true);
    setSelectedProduct(null);
    try {
      const response = await telarApi.get<ProductResponse[]>(
        `/products-new/store/${storeId}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  /**
   * Fetch a single product with all layers
   */
  const fetchProductDetail = useCallback(async (productId: string) => {
    try {
      const response = await telarApi.get<ProductResponse>(
        `/products-new/${productId}`
      );
      setSelectedProduct(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching product detail:', error);
      toast.error('Error al cargar detalle del producto');
      return null;
    }
  }, []);

  /**
   * Update a product (uses upsert endpoint POST /products-new)
   */
  const updateProduct = useCallback(
    async (dto: CreateProductsNewDto): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await telarApi.post<ProductResponse>(
          '/products-new',
          dto
        );
        setSelectedProduct(response.data);

        // Update the product in the list
        setProducts((prev) =>
          prev.map((p) => (p.id === response.data.id ? response.data : p))
        );

        toast.success('Producto actualizado correctamente');
        return true;
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error('Error al actualizar producto');
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    // State
    stores,
    products,
    selectedProduct,
    loadingStores,
    loadingProducts,
    saving,

    // Actions
    fetchStores,
    fetchProductsByStore,
    fetchProductDetail,
    updateProduct,
    setSelectedProduct,
  };
};
