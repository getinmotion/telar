import { useState, useCallback } from 'react';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

export interface VariantOption {
  name: string; // "Talla", "Color", "Tamaño", etc.
  values: string[]; // ["S", "M", "L"] or ["Rojo", "Azul"]
}

export interface ProductVariant {
  id: string;
  optionValues: Record<string, string>; // { "Talla": "M", "Color": "Rojo" }
  price: number;
  stock: number;
  sku?: string;
}

export interface WizardState {
  images: File[];
  name: string;
  description: string;
  price: number | null;
  category: string;
  tags: string[];
  shortDescription?: string;
  inventory?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  materials?: string[];
  productionTime?: string;
  comparePrice?: number | null;
  sku?: string;
  customizable?: boolean;
  madeToOrder?: boolean;
  leadTimeDays?: number;
  productionTimeHours?: number;
  requiresCustomization?: boolean;
  allowsLocalPickup?: boolean;
  // Variants
  hasVariants?: boolean;
  variantOptions?: VariantOption[];
  variants?: ProductVariant[];
}

const initialState: WizardState = {
  images: [],
  name: '',
  description: '',
  price: null,
  category: '',
  tags: [],
};

export const useWizardState = (autoRestore: boolean = false) => {
  const userLocalStorage = useUserLocalStorage();
  
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    // Only restore from localStorage if explicitly requested (e.g., continuing a draft)
    if (autoRestore) {
      const saved = userLocalStorage.getItem('ai-product-wizard-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...initialState, ...parsed, images: [] }; // Don't restore images from localStorage
        } catch (error) {
          console.warn('Could not restore wizard state:', error);
        }
      }
    }
    return initialState;
  });

  const updateWizardState = useCallback((updates: Partial<WizardState>) => {
    setWizardState(prev => {
      const newState = { ...prev, ...updates };
      
      // Save to user-namespaced localStorage (excluding images)
      const stateToSave = { ...newState };
      delete stateToSave.images;
      userLocalStorage.setItem('ai-product-wizard-state', JSON.stringify(stateToSave));
      
      return newState;
    });
  }, [userLocalStorage]);

  const resetWizard = useCallback(() => {
    setWizardState(initialState);
    userLocalStorage.removeItem('ai-product-wizard-state');
  }, [userLocalStorage]);

  return {
    wizardState,
    updateWizardState,
    resetWizard,
  };
};