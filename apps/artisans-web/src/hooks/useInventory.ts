import { useState } from 'react';
import { toast } from 'sonner';
import { Product as LegacyProduct } from '@/types/artisan';
import {
  getProductById,
  createProduct as createProductAction,
  updateProduct as updateProductAction,
} from '@/services/products.actions';
import {
  deleteProductNew,
  deleteProductsNewBulk,
  getProductsNewByStoreId,
  mapProductResponseToLegacy,
  getProductNewById,
} from '@/services/products-new.actions';
import {
  getVariantsByProductId,
  getLowStockVariants,
  createVariant as createVariantAction,
  updateVariant as updateVariantAction,
  adjustVariantStock,
} from '@/services/productVariants.actions';
import { getMovementsByVariantId } from '@/services/inventoryMovements.actions';

export interface MarketplaceLink {
  url: string;
  item_id?: string;
  asin?: string;
  price?: number;
  stock?: number;
  sync_enabled?: boolean;
  last_sync?: string;
}

export interface MarketplaceLinks {
  amazon?: MarketplaceLink;
  mercadolibre?: MarketplaceLink;
  other?: Array<{
    platform: string;
    url: string;
    price?: number;
  }>;
}

// Extender LegacyProduct con campos específicos de inventario
export interface Product extends LegacyProduct {
  made_to_order?: boolean;
  lead_time_days?: number;
  production_time_hours?: number;
  requires_customization?: boolean;
  marketplace_links?: MarketplaceLinks;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  option_values?: any;
  price?: number;
  cost?: number;
  stock: number;
  min_stock: number;
  status: string;
}

export interface Material {
  id: string;
  user_id: string;
  name: string;
  unit?: string;
  cost_per_unit?: number;
  current_stock?: number;
  min_stock?: number;
}

export interface InventoryMovement {
  id: string;
  product_variant_id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  reason?: string;
  ref_id?: string;
  created_at: string;
}

export function useInventory() {
  const [loading, setLoading] = useState(false);

  // ============= PRODUCTS (NestJS) =============

  const fetchProducts = async (shopId?: string): Promise<Product[]> => {
    try {
      setLoading(true);
      if (!shopId) return [];
      // Usar products-new endpoint
      const productsNew = await getProductsNewByStoreId(shopId);
      // Mapear a formato legacy para compatibilidad
      const legacyProducts = productsNew.map(mapProductResponseToLegacy);
      return legacyProducts as Product[];
    } catch {
      toast.error('Error al cargar productos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any): Promise<Product | null> => {
    try {
      setLoading(true);
      const data = await createProductAction(productData);
      return data as unknown as Product;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Product>
  ): Promise<Product | null> => {
    try {
      setLoading(true);

      // Si se está actualizando solo el inventory, usar products-new con variants
      if (updates.inventory !== undefined && Object.keys(updates).length === 1) {
        // Obtener el producto con sus variantes
        const product = await getProductNewById(productId);
        if (!product || !product.variants || product.variants.length === 0) {
          throw new Error('Producto no encontrado o sin variantes');
        }

        const firstVariant = product.variants[0];
        const newInventory = updates.inventory;

        // Usar operation 'set' para establecer el inventario exacto
        await adjustVariantStock(firstVariant.id, newInventory, 'set');

        // Retornar producto actualizado en formato legacy
        const updatedProduct = await getProductNewById(productId);
        if (updatedProduct) {
          return mapProductResponseToLegacy(updatedProduct) as Product;
        }
        return null;
      }

      // Para otros updates, usar endpoint legacy
      const data = await updateProductAction(productId, updates as any);
      return data as unknown as Product;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      await deleteProductNew(productId);
      toast.success('Producto eliminado correctamente');
      return true;
    } catch (error) {
      toast.error('Error al eliminar el producto');
      console.error('Error eliminando producto:', error);
      return false;
    }
  };

  const bulkDeleteProducts = async (ids: string[]): Promise<boolean> => {
    try {
      await deleteProductsNewBulk(ids);
      toast.success(`${ids.length} productos eliminados correctamente`);
      return true;
    } catch (error) {
      toast.error('Error al eliminar los productos');
      console.error('Error eliminando productos en bloque:', error);
      return false;
    }
  };

  const adjustProductStock = async (
    productId: string,
    change: number,
    _channel: string,
    _notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const product = await getProductById(productId);
      if (!product) throw new Error('Producto no encontrado');

      const currentInventory = product.inventory ?? 0;
      const newInventory = Math.max(0, currentInventory + change);

      await updateProductAction(productId, { inventory: newInventory } as any);
      return true;
    } catch {
      toast.error('Error al ajustar stock');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateProduct = async (productId: string): Promise<Product | null> => {
    try {
      setLoading(true);
      const original = await getProductById(productId);
      if (!original) throw new Error('Producto no encontrado');

      const timestamp = Date.now().toString(36);
      const newSku = original.sku
        ? `${original.sku}-copy-${timestamp}`
        : `copy-${timestamp}`;

      const duplicateData = {
        shop_id: original.shop_id,
        name: `${original.name} (Copia)`,
        description: original.description,
        short_description: (original as any).short_description,
        category: original.category,
        subcategory: (original as any).subcategory,
        price: original.price,
        compare_price: (original as any).compare_price,
        images: original.images,
        tags: (original as any).tags,
        materials: (original as any).materials,
        techniques: (original as any).techniques,
        weight: (original as any).weight,
        dimensions: (original as any).dimensions,
        production_time: (original as any).production_time,
        customizable: (original as any).customizable,
        seo_data: (original as any).seo_data,
        sku: newSku,
        inventory: 0,
        active: false,
        featured: false,
        moderation_status: 'draft',
        shipping_data_complete: false,
        ready_for_checkout: false,
      };

      const newProduct = await createProductAction(duplicateData);
      return newProduct as unknown as Product;
    } catch {
      toast.error('Error al duplicar producto');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ============= VARIANTS (NestJS) =============

  const fetchVariants = async (productId: string): Promise<ProductVariant[]> => {
    try {
      const data = await getVariantsByProductId(productId);
      return data as unknown as ProductVariant[];
    } catch {
      return [];
    }
  };

  const createVariant = async (variantData: any): Promise<ProductVariant | null> => {
    try {
      const data = await createVariantAction(variantData);
      return data as unknown as ProductVariant;
    } catch {
      return null;
    }
  };

  const updateVariant = async (
    variantId: string,
    updates: Partial<ProductVariant>
  ): Promise<ProductVariant | null> => {
    try {
      const data = await updateVariantAction(variantId, updates as any);
      return data as unknown as ProductVariant;
    } catch {
      return null;
    }
  };

  // ============= STOCK DE VARIANTES (NestJS) =============
  // Mapeo: IN → add | OUT → subtract | ADJUST → set

  const adjustStock = async (
    variantId: string,
    qty: number,
    type: 'IN' | 'OUT' | 'ADJUST',
    _reason?: string
  ): Promise<boolean> => {
    const operationMap: Record<string, 'add' | 'subtract' | 'set'> = {
      IN: 'add',
      OUT: 'subtract',
      ADJUST: 'set',
    };
    try {
      setLoading(true);
      await adjustVariantStock(variantId, qty, operationMap[type]);
      return true;
    } catch {
      toast.error('Error al ajustar stock');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async (variantId: string): Promise<InventoryMovement[]> => {
    try {
      const data = await getMovementsByVariantId(variantId);
      return data as unknown as InventoryMovement[];
    } catch {
      return [];
    }
  };

  const fetchLowStockVariants = async (shopId?: string) => {
    try {
      const variants = await getLowStockVariants();

      if (!shopId) return variants;

      // Filtrar por tienda: obtenemos los productos del shop y cruzamos
      const shopProducts = await getProductsNewByStoreId(shopId);
      const shopProductIds = new Set(shopProducts.map((p) => p.id));
      return variants.filter((v) => shopProductIds.has(v.product_id));
    } catch {
      return [];
    }
  };

  // ============= MATERIALS (TODO: pendiente de resource NestJS) =============

  return {
    loading,
    // Products (NestJS)
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    duplicateProduct,
    adjustProductStock,
    // Variants (NestJS)
    fetchVariants,
    createVariant,
    updateVariant,
    // Stock (NestJS)
    adjustStock,
    fetchMovements,
    fetchLowStockVariants,
  };
}
