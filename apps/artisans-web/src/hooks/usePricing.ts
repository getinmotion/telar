import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CostCalculation {
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  suggestedPrice: number;
  margin: number;
}

interface PricingParams {
  productId?: string;
  variantId?: string;
  laborHours?: number;
  hourlyRate?: number;
  overheadPercentage?: number;
  marginPercentage?: number;
}

export function usePricing() {
  const [loading, setLoading] = useState(false);

  /**
   * Calculate material costs from BOM
   */
  const calculateMaterialCost = async (productId: string, variantId?: string): Promise<number> => {
    try {
      let query = supabase
        .from('bom')
        .select(`
          qty_per_unit,
          materials!inner(cost_per_unit)
        `);
      
      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.eq('product_id', productId).is('variant_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const totalCost = data.reduce((sum, item: any) => {
        const materialCost = item.materials?.cost_per_unit || 0;
        const qty = item.qty_per_unit || 0;
        return sum + (materialCost * qty);
      }, 0);
      
      return totalCost;
    } catch (error: any) {
      console.error('Error calculating material cost:', error);
      return 0;
    }
  };

  /**
   * Calculate labor cost based on production time
   */
  const calculateLaborCost = async (
    productId: string, 
    hourlyRate: number = 15000 // Default COP hourly rate
  ): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('production_time_hours')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      const hours = data?.production_time_hours || 0;
      return hours * hourlyRate;
    } catch (error: any) {
      console.error('Error calculating labor cost:', error);
      return 0;
    }
  };

  /**
   * Full cost calculation with suggested pricing
   */
  const calculateFullCost = async (params: PricingParams): Promise<CostCalculation | null> => {
    try {
      setLoading(true);
      
      const {
        productId,
        variantId,
        hourlyRate = 15000,
        overheadPercentage = 15,
        marginPercentage = 40
      } = params;
      
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      // Calculate material cost
      const materialsCost = await calculateMaterialCost(productId, variantId);
      
      // Calculate labor cost
      const laborCost = await calculateLaborCost(productId, hourlyRate);
      
      // Calculate overhead (percentage of materials + labor)
      const directCosts = materialsCost + laborCost;
      const overheadCost = directCosts * (overheadPercentage / 100);
      
      // Total cost
      const totalCost = directCosts + overheadCost;
      
      // Suggested price with margin
      const suggestedPrice = totalCost / (1 - marginPercentage / 100);
      
      // Actual margin amount
      const margin = suggestedPrice - totalCost;
      
      return {
        materialsCost,
        laborCost,
        overheadCost,
        totalCost,
        suggestedPrice: Math.ceil(suggestedPrice / 1000) * 1000, // Round to nearest 1000
        margin
      };
    } catch (error: any) {
      console.error('Error calculating full cost:', error);
      toast.error('Error al calcular costos');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update product/variant price
   */
  const updatePrice = async (
    productId: string,
    price: number,
    variantId?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (variantId) {
        // Update variant price
        const { error } = await supabase
          .from('product_variants')
          .update({ price })
          .eq('id', variantId);
        
        if (error) throw error;
      } else {
        // Update product price
        const { error } = await supabase
          .from('products')
          .update({ price })
          .eq('id', productId);
        
        if (error) throw error;
      }
      
      toast.success('Precio actualizado');
      return true;
    } catch (error: any) {
      console.error('Error updating price:', error);
      toast.error('Error al actualizar precio');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate margin for existing price
   */
  const calculateMargin = (cost: number, price: number): number => {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  /**
   * Calculate markup for existing price
   */
  const calculateMarkup = (cost: number, price: number): number => {
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };

  /**
   * Suggest price based on different margin strategies
   */
  const suggestPriceStrategies = (totalCost: number) => {
    return {
      conservative: {
        margin: 30,
        price: Math.ceil((totalCost / 0.7) / 1000) * 1000
      },
      moderate: {
        margin: 40,
        price: Math.ceil((totalCost / 0.6) / 1000) * 1000
      },
      aggressive: {
        margin: 50,
        price: Math.ceil((totalCost / 0.5) / 1000) * 1000
      },
      premium: {
        margin: 60,
        price: Math.ceil((totalCost / 0.4) / 1000) * 1000
      }
    };
  };

  return {
    loading,
    calculateMaterialCost,
    calculateLaborCost,
    calculateFullCost,
    updatePrice,
    calculateMargin,
    calculateMarkup,
    suggestPriceStrategies
  };
}
