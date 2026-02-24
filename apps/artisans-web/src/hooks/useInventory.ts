import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketplaceLink {
  url: string;
  item_id?: string;
  asin?: string; // Amazon ASIN
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

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  images?: any[];
  active: boolean;
  inventory?: number;
  sku?: string;
  made_to_order?: boolean;
  lead_time_days?: number;
  production_time_hours?: number;
  requires_customization?: boolean;
  marketplace_links?: MarketplaceLinks;
  moderation_status?: string;
  created_at: string;
  updated_at: string;
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

  // ============= PRODUCTS =============
  
  const fetchProducts = async (shopId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (shopId) {
        query = query.eq('shop_id', shopId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Producto creado exitosamente');
      return data as Product;
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error('Error al crear producto');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .update(updates as any)
        .eq('id', productId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Producto actualizado');
      return data as Product;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success('Producto eliminado');
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============= VARIANTS =============
  
  const fetchVariants = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProductVariant[];
    } catch (error: any) {
      console.error('Error fetching variants:', error);
      return [];
    }
  };

  const createVariant = async (variantData: any) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([variantData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Variante creada');
      return data as ProductVariant;
    } catch (error: any) {
      console.error('Error creating variant:', error);
      toast.error('Error al crear variante');
      return null;
    }
  };

  const updateVariant = async (variantId: string, updates: Partial<ProductVariant>) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', variantId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Variante actualizada');
      return data as ProductVariant;
    } catch (error: any) {
      console.error('Error updating variant:', error);
      toast.error('Error al actualizar variante');
      return null;
    }
  };

  // ============= STOCK MOVEMENTS =============
  
  const adjustStock = async (
    variantId: string, 
    qty: number, 
    type: 'IN' | 'OUT' | 'ADJUST',
    reason?: string
  ) => {
    try {
      setLoading(true);
      
      // Create movement record
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          product_variant_id: variantId,
          type,
          qty,
          reason
        });
      
      if (movementError) throw movementError;
      
      // Update variant stock
      const { data: variant, error: fetchError } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', variantId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newStock = type === 'OUT' 
        ? variant.stock - qty 
        : type === 'IN' 
        ? variant.stock + qty 
        : qty;
      
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock: newStock })
        .eq('id', variantId);
      
      if (updateError) throw updateError;
      
      toast.success('Stock actualizado');
      return true;
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast.error('Error al ajustar stock');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async (variantId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('product_variant_id', variantId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as InventoryMovement[];
    } catch (error: any) {
      console.error('Error fetching movements:', error);
      return [];
    }
  };

  // ============= MATERIALS =============
  
  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Material[];
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      return [];
    }
  };

  const createMaterial = async (materialData: any) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([materialData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Material creado');
      return data as Material;
    } catch (error: any) {
      console.error('Error creating material:', error);
      toast.error('Error al crear material');
      return null;
    }
  };

  // ============= LOW STOCK ALERTS =============
  
  const fetchLowStockVariants = async (shopId?: string) => {
    try {
      // Fetch all variants and filter in JS since we can't use dynamic column comparison
      let query = supabase
        .from('product_variants')
        .select(`
          *,
          products!inner(shop_id, name, active)
        `)
        .eq('status', 'active');
      
      if (shopId) {
        query = query.eq('products.shop_id', shopId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter where stock <= min_stock
      const lowStock = (data || []).filter(v => v.stock <= v.min_stock);
      return lowStock;
    } catch (error: any) {
      console.error('Error fetching low stock:', error);
      return [];
    }
  };

  // ============= DIRECT PRODUCT STOCK ADJUSTMENT =============
  
  const adjustProductStock = async (
    productId: string,
    change: number,
    channel: string,
    notes?: string
  ) => {
    try {
      setLoading(true);
      
      // Get current product
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('inventory')
        .eq('id', productId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentInventory = product.inventory ?? 0;
      const newInventory = Math.max(0, currentInventory + change);
      
      // Update product inventory
      const { error: updateError } = await supabase
        .from('products')
        .update({ inventory: newInventory })
        .eq('id', productId);
      
      if (updateError) throw updateError;
      
      // Create movement record (storing in inventory_movements for history)
      // Note: This requires a variant_id but we're tracking at product level
      // In a real scenario, you might want a separate table for product-level movements
      
      toast.success(change > 0 ? 'Stock agregado' : 'Stock reducido');
      return true;
    } catch (error: any) {
      console.error('Error adjusting product stock:', error);
      toast.error('Error al ajustar stock');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateProduct = async (productId: string): Promise<Product | null> => {
    try {
      setLoading(true);
      
      // Fetch the original product with all fields
      const { data: original, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (fetchError || !original) {
        throw fetchError || new Error('Producto no encontrado');
      }
      
      // Generate new SKU
      const timestamp = Date.now().toString(36);
      const newSku = original.sku 
        ? `${original.sku}-copy-${timestamp}`
        : `copy-${timestamp}`;
      
      // Create duplicate with modified fields
      const duplicateData = {
        shop_id: original.shop_id,
        name: `${original.name} (Copia)`,
        description: original.description,
        short_description: original.short_description,
        category: original.category,
        subcategory: original.subcategory,
        category_id: original.category_id,
        price: original.price,
        compare_price: original.compare_price,
        images: original.images,
        tags: original.tags,
        materials: original.materials,
        techniques: original.techniques,
        weight: original.weight,
        dimensions: original.dimensions,
        production_time: original.production_time,
        production_time_hours: original.production_time_hours,
        customizable: original.customizable,
        made_to_order: original.made_to_order,
        lead_time_days: original.lead_time_days,
        requires_customization: original.requires_customization,
        seo_data: original.seo_data,
        // Reset fields for new product
        sku: newSku,
        inventory: 0,
        active: false,
        featured: false,
        moderation_status: 'draft',
        marketplace_links: null,
        shipping_data_complete: false,
        ready_for_checkout: false,
      };
      
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert([duplicateData])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      toast.success('Producto duplicado como borrador');
      return newProduct as Product;
    } catch (error: any) {
      console.error('Error duplicating product:', error);
      toast.error('Error al duplicar producto');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    // Products
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    // Variants
    fetchVariants,
    createVariant,
    updateVariant,
    // Stock
    adjustStock,
    adjustProductStock,
    fetchMovements,
    fetchLowStockVariants,
    // Materials
    fetchMaterials,
    createMaterial
  };
}
