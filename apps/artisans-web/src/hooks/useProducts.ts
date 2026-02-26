import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/artisan';
import { useToast } from '@/hooks/use-toast';
import { EventBus } from '@/utils/eventBus';
import {
  getProductsByShopId,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from '@/services/products.actions';

export const useProducts = (shopId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getProductsByShopId(shopId);
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const createProduct = async (productData: Record<string, any>) => {
    if (!shopId) throw new Error('Shop ID required');

    try {
      setLoading(true);
      const data = await apiCreateProduct({ ...productData, shop_id: shopId });

      setProducts(prev => [data, ...prev]);
      EventBus.publish('inventory.updated', { productId: data.id, action: 'created' });

      toast({
        title: '¡Producto creado!',
        description: 'Tu producto ha sido agregado al catálogo.',
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'No se pudo crear el producto. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: string, updates: Record<string, any>) => {
    try {
      setLoading(true);
      const data = await apiUpdateProduct(productId, updates);

      setProducts(prev => prev.map(p => (p.id === productId ? data : p)));
      EventBus.publish('inventory.updated', { productId, action: 'updated' });

      toast({
        title: 'Producto actualizado',
        description: 'Los cambios han sido guardados exitosamente.',
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      await apiDeleteProduct(productId);

      setProducts(prev => prev.filter(p => p.id !== productId));
      EventBus.publish('inventory.updated', { productId, action: 'deleted' });

      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado del catálogo.',
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts,
  };
};
