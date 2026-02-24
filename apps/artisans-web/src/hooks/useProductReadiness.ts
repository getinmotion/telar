import { useMemo } from 'react';

interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

interface Product {
  id?: string;
  weight?: number | null;
  dimensions?: ProductDimensions | null;
  moderation_status?: string | null;
  shipping_data_complete?: boolean;
  ready_for_checkout?: boolean;
}

interface Shop {
  bank_data_status?: string;
  id_contraparty?: string | null;
}

export interface ProductReadiness {
  /** True if weight and all dimensions (length, width, height) are valid and > 0 */
  shippingDataComplete: boolean;
  /** True if product is approved, shop has bank data, and shipping data is complete */
  readyForCheckout: boolean;
  /** Missing fields for shipping data */
  missingShippingFields: string[];
  /** Missing requirements for checkout */
  missingCheckoutRequirements: string[];
}

/**
 * Hook to calculate product readiness flags
 * - shippingDataComplete: producto tiene peso y dimensiones completas
 * - readyForCheckout: producto puede venderse (moderación + banco + envío)
 */
export const useProductReadiness = (
  product: Product | null | undefined,
  shop: Shop | null | undefined
): ProductReadiness => {
  return useMemo(() => {
    const missingShippingFields: string[] = [];
    const missingCheckoutRequirements: string[] = [];

    // Calculate shipping data completeness
    const hasWeight = product?.weight != null && product.weight > 0;
    const hasLength = product?.dimensions?.length != null && product.dimensions.length > 0;
    const hasWidth = product?.dimensions?.width != null && product.dimensions.width > 0;
    const hasHeight = product?.dimensions?.height != null && product.dimensions.height > 0;

    if (!hasWeight) missingShippingFields.push('peso');
    if (!hasLength) missingShippingFields.push('largo');
    if (!hasWidth) missingShippingFields.push('ancho');
    if (!hasHeight) missingShippingFields.push('alto');

    const shippingDataComplete = hasWeight && hasLength && hasWidth && hasHeight;

    // Calculate checkout readiness
    const isApproved = product?.moderation_status === 'approved' || 
                       product?.moderation_status === 'approved_with_edits';
    
    // Check bank data status - support both new field and legacy id_contraparty
    const hasBankData = shop?.bank_data_status === 'complete' || 
                        (shop?.id_contraparty != null && shop.id_contraparty !== '');

    if (!isApproved) {
      missingCheckoutRequirements.push('Producto debe estar aprobado por moderación');
    }
    if (!hasBankData) {
      missingCheckoutRequirements.push('Datos bancarios de la tienda deben estar completos');
    }
    if (!shippingDataComplete) {
      missingCheckoutRequirements.push('Datos de envío del producto deben estar completos');
    }

    const readyForCheckout = isApproved && hasBankData && shippingDataComplete;

    return {
      shippingDataComplete,
      readyForCheckout,
      missingShippingFields,
      missingCheckoutRequirements,
    };
  }, [product, shop]);
};

/**
 * Calculate shipping data completeness without React hook (for use in non-component contexts)
 */
export const calculateShippingDataComplete = (product: Product | null | undefined): boolean => {
  if (!product) return false;
  
  const hasWeight = product.weight != null && product.weight > 0;
  const hasLength = product.dimensions?.length != null && product.dimensions.length > 0;
  const hasWidth = product.dimensions?.width != null && product.dimensions.width > 0;
  const hasHeight = product.dimensions?.height != null && product.dimensions.height > 0;

  return hasWeight && hasLength && hasWidth && hasHeight;
};

/**
 * Calculate checkout readiness without React hook (for use in non-component contexts)
 */
export const calculateReadyForCheckout = (
  product: Product | null | undefined,
  shop: Shop | null | undefined
): boolean => {
  if (!product || !shop) return false;

  const isApproved = product.moderation_status === 'approved' || 
                     product.moderation_status === 'approved_with_edits';
  
  const hasBankData = shop.bank_data_status === 'complete' || 
                      (shop.id_contraparty != null && shop.id_contraparty !== '');

  const shippingDataComplete = calculateShippingDataComplete(product);

  return isApproved && hasBankData && shippingDataComplete;
};
