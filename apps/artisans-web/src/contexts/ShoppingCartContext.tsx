import React, { createContext, useContext } from 'react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { CartItem, CartSummary } from '@/types/cart';

interface ShoppingCartContextType {
  cartItems: CartItem[];
  summary: CartSummary;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, price?: number) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const ShoppingCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cartMethods = useShoppingCart();

  return (
    <ShoppingCartContext.Provider value={cartMethods}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a ShoppingCartProvider');
  }
  return context;
};