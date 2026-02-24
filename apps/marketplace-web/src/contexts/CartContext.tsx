import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import * as ProductsActions from '@/services/products.actions';
import * as CartActions from '@/services/cart.actions';

interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  isGiftCard?: boolean;
  giftCardAmount?: number;
  recipientEmail?: string;
  giftMessage?: string;
  product: {
    name: string;
    price: number;
    image_url: string;
    allows_local_pickup?: boolean;
  };
}

interface LocalCartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  isGiftCard?: boolean;
  giftCardAmount?: number;
  recipientEmail?: string;
  giftMessage?: string;
  product: {
    name: string;
    price: number;
    image_url: string;
    allows_local_pickup?: boolean;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  activeCartId: string | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  addGiftCardToCart: (amount: number, recipientEmail?: string, message?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
  syncGuestCartToUser: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  nonGiftCardTotal: number;
  hasGiftCards: boolean;
  getGiftCardItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'telar_guest_cart';
const GIFT_CARD_SESSION_KEY = 'telar_gift_cards';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCartId, setActiveCartId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Load cart on mount and when user changes
  useEffect(() => {
    const initializeCart = async () => {
      if (user) {
        // Check if there's a guest cart to sync
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const localItems = JSON.parse(stored);
          if (localItems.length > 0) {
            await syncGuestCartToUser();
            return;
          }
        }
        // No guest cart, just fetch user's cart
        fetchCart();
      } else {
        loadLocalCart();
      }
    };
    
    initializeCart();
  }, [user]);

  // Save to localStorage whenever items change (for guests)
  useEffect(() => {
    if (!user && items.length > 0) {
      saveLocalCart(items);
    }
  }, [items, user]);

  const loadLocalCart = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const localItems: LocalCartItem[] = JSON.parse(stored);
        const cartItems: CartItem[] = localItems.map((item, index) => ({
          id: `local-${index}`,
          ...item
        }));
        setItems(cartItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
      setItems([]);
    }
  };

  const saveLocalCart = (cartItems: CartItem[]) => {
    try {
      const localItems: LocalCartItem[] = cartItems.map(({ product_id, variant_id, quantity, product, isGiftCard, giftCardAmount, recipientEmail, giftMessage }) => ({
        product_id,
        variant_id,
        quantity,
        product,
        isGiftCard,
        giftCardAmount,
        recipientEmail,
        giftMessage
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localItems));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const syncGuestCartToUser = async () => {
    if (!user) return;

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      
      // Also check current items state (for gift cards added directly)
      const currentGiftCards = items.filter(item => item.isGiftCard);
      
      const localItems: LocalCartItem[] = stored ? JSON.parse(stored) : [];
      
      // If no local items and no gift cards in state, nothing to sync
      if (localItems.length === 0 && currentGiftCards.length === 0) return;

      // Separate gift cards from regular items
      const regularItems = localItems.filter(item => !item.isGiftCard);
      const giftCardItemsFromStorage = localItems.filter(item => item.isGiftCard);
      
      // Combine gift cards from storage and state
      const allGiftCards = [
        ...giftCardItemsFromStorage,
        ...currentGiftCards.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          isGiftCard: item.isGiftCard,
          giftCardAmount: item.giftCardAmount,
          recipientEmail: item.recipientEmail,
          giftMessage: item.giftMessage,
          product: item.product
        }))
      ];

      // Prepare regular items for sync
      const itemsToSync = regularItems.map(item => ({
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity
      }));

      let cartId = activeCartId;

      // Call the backend to sync regular cart items OR create empty cart for gift-card-only purchases
      if (itemsToSync.length > 0 || (!cartId && allGiftCards.length > 0)) {
        try {
          const response = await CartActions.syncGuestCart({
            buyerUserId: user.id,
            items: itemsToSync.length > 0 ? itemsToSync : [] // Empty array will still create a cart
          });

          // Store the cart_id from the response
          if (response.cartId) {
            cartId = response.cartId;
            setActiveCartId(cartId);
          }
        } catch (error) {
          console.error('Error syncing guest cart:', error);
          toast.error('Error al sincronizar el carrito');
          return;
        }
      }

      // Clear local cart after successful sync
      localStorage.removeItem(CART_STORAGE_KEY);
      
      // Refresh cart from database (preserve cart_id if we have gift cards)
      await fetchCart(allGiftCards.length > 0);
      
      // IMPORTANT: Restore activeCartId after fetchCart if we have gift cards
      // fetchCart may reset it if there are no cart_items in the database
      if (allGiftCards.length > 0 && cartId) {
        setActiveCartId(cartId);
      }
      
      // Add back gift card items to state
      if (allGiftCards.length > 0) {
        setItems(prev => {
          // Filter out existing gift cards to avoid duplicates
          const nonGiftCards = prev.filter(item => !item.isGiftCard);
          return [
            ...nonGiftCards,
            ...allGiftCards.map((item, index) => ({
              id: `giftcard-${Date.now()}-${index}`,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              isGiftCard: item.isGiftCard,
              giftCardAmount: item.giftCardAmount,
              recipientEmail: item.recipientEmail,
              giftMessage: item.giftMessage,
              product: item.product
            }))
          ];
        });
      }
      
      toast.success('Carrito sincronizado');
    } catch (error) {
      console.error('Error syncing guest cart:', error);
      toast.error('Error al sincronizar el carrito');
    }
  };

  const fetchCart = async (preserveCartIdForGiftCards: boolean = false) => {
    if (!user) {
      setItems([]);
      setActiveCartId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get open cart from backend (1 query instead of 3)
      const cart = await CartActions.getOpenCart(user.id);

      // Validate cart status
      if (cart.status !== 'open') {
        console.warn('[CartContext] Cart not open:', cart.status);
        // Keep gift cards if any
        setItems(prev => prev.filter(item => item.isGiftCard));

        const hasGiftCardsInState = items.some(item => item.isGiftCard);
        if (!hasGiftCardsInState) {
          setActiveCartId(null);
        }
        return;
      }

      setActiveCartId(cart.id);

      // Get cart items with enriched product + sellerShop data
      const detailedItems = await CartActions.getCartItems(cart.id);

      if (!detailedItems || detailedItems.length === 0) {
        // Keep gift cards if any
        setItems(prev => prev.filter(item => item.isGiftCard));
        return;
      }

      // Map backend items to local CartItem format
      const mappedItems: CartItem[] = detailedItems.map(item => {
        // Convert unitPriceMinor (string) to price (number)
        // "5000000" → 50000.00
        const price = parseFloat(item.unitPriceMinor) / 100;

        // Get image from enriched product
        const imageUrl = item.product?.images?.[0] || '';

        return {
          id: item.id,
          product_id: item.productId,
          variant_id: item.metadata?.variantId,
          quantity: item.quantity,
          product: {
            name: item.product?.name || 'Producto no disponible',
            price: price,
            image_url: imageUrl,
            allows_local_pickup: item.product?.allowsLocalPickup || false
          }
        };
      });

      // Preserve gift cards from state
      const currentGiftCards = items.filter(item => item.isGiftCard);
      setItems([...mappedItems, ...currentGiftCards]);

    } catch (error: any) {
      if (error.response?.status === 404) {
        // No cart found - new user or cart converted
        console.log('[CartContext] No open cart found');

        // Check if we have gift cards in state and should preserve the activeCartId
        const hasGiftCardsInState = items.some(item => item.isGiftCard);
        if (preserveCartIdForGiftCards && hasGiftCardsInState && activeCartId) {
          // Don't reset activeCartId - gift cards need it for checkout
          setLoading(false);
          return;
        }

        setItems(prev => prev.filter(item => item.isGiftCard)); // Keep gift cards
        if (!hasGiftCardsInState) {
          setActiveCartId(null);
        }
      } else {
        console.error('[CartContext] Error fetching cart:', error);
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number, variantId?: string) => {
    try {
      // Fetch product details from products service
      const product = await ProductsActions.getProductById(productId);

      const imageUrl = product.images?.[0] || '';

      // For guests, add to localStorage
      if (!user) {
        const newItem: CartItem = {
          id: `local-${Date.now()}`,
          product_id: productId,
          variant_id: variantId,
          quantity,
          product: {
            name: product.name,
            price: parseFloat(product.price.toString()),
            image_url: imageUrl
          }
        };

        setItems(prev => [...prev, newItem]);
        toast.success('Producto agregado al carrito');
        openCart();
        return;
      }

      // For authenticated users
      let cartId = activeCartId;

      if (cartId) {
        // Add item to existing cart using backend
        // Backend handles duplicate checking and quantity merging
        const unitPriceMinor = Math.round(parseFloat(product.price.toString()) * 100).toString();

        await CartActions.addCartItem({
          cartId: cartId,
          productId: productId,
          sellerShopId: product.shopId,
          quantity: quantity,
          currency: 'COP',
          unitPriceMinor: unitPriceMinor,
          priceSource: 'product_base',
          metadata: variantId ? { variantId } : undefined
        });
      } else {
        // No active cart, use sync-guest to create cart + item
        const response = await CartActions.syncGuestCart({
          buyerUserId: user.id,
          items: [{
            productId: productId,
            variantId: variantId,
            quantity
          }]
        });

        if (response.cartId) {
          setActiveCartId(response.cartId);
        }
      }

      await fetchCart(true); // Preserve cart ID for gift cards
      toast.success('Producto agregado al carrito');
      openCart();
    } catch (error) {
      console.error('[CartContext] Error adding to cart:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  // Helper to persist gift cards to sessionStorage
  const saveGiftCardsToSession = (giftCards: CartItem[]) => {
    try {
      sessionStorage.setItem(GIFT_CARD_SESSION_KEY, JSON.stringify(giftCards));
    } catch (error) {
      console.error('Error saving gift cards to session:', error);
    }
  };

  // Helper to load gift cards from sessionStorage
  const loadGiftCardsFromSession = (): CartItem[] => {
    try {
      const stored = sessionStorage.getItem(GIFT_CARD_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading gift cards from session:', error);
    }
    return [];
  };

  // Clear gift cards from sessionStorage
  const clearGiftCardsFromSession = () => {
    try {
      sessionStorage.removeItem(GIFT_CARD_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing gift cards from session:', error);
    }
  };

  // Load gift cards from sessionStorage on mount
  useEffect(() => {
    const savedGiftCards = loadGiftCardsFromSession();
    if (savedGiftCards.length > 0) {
      setItems(prev => {
        const nonGiftCards = prev.filter(item => !item.isGiftCard);
        return [...nonGiftCards, ...savedGiftCards];
      });
    }
  }, []);

  // Persist gift cards to sessionStorage whenever items change
  useEffect(() => {
    const giftCards = items.filter(item => item.isGiftCard);
    if (giftCards.length > 0) {
      saveGiftCardsToSession(giftCards);
    } else {
      clearGiftCardsFromSession();
    }
  }, [items]);

  const addGiftCardToCart = async (amount: number, recipientEmail?: string, message?: string) => {
    const giftCardItem: CartItem = {
      id: `giftcard-${Date.now()}`,
      product_id: `giftcard-${amount}`,
      quantity: 1,
      isGiftCard: true,
      giftCardAmount: amount,
      recipientEmail,
      giftMessage: message,
      product: {
        name: `Gift Card ${new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(amount)}`,
        price: amount,
        image_url: '' // Gift cards don't have images
      }
    };

    setItems(prev => [...prev, giftCardItem]);
    toast.success('Gift Card agregada al carrito');
    openCart();
  };

  const removeFromCart = async (itemId: string) => {
    // Check if it's a gift card or local item (handled in state)
    if (itemId.startsWith('giftcard-') || itemId.startsWith('local-')) {
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);

      // Update localStorage for guests
      if (!user) {
        if (updatedItems.length === 0) {
          localStorage.removeItem(CART_STORAGE_KEY);
        } else {
          saveLocalCart(updatedItems);
        }
      }

      toast.success('Producto eliminado del carrito');
      return;
    }

    // For authenticated users with regular products
    try {
      await CartActions.deleteCartItem(itemId);
      await fetchCart(true); // Preserve cart ID for gift cards
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('[CartContext] Error removing from cart:', error);
      toast.error('Error al eliminar del carrito');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    // For gift cards or guests, update local state
    if (itemId.startsWith('giftcard-') || itemId.startsWith('local-') || !user) {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
      return;
    }

    // For authenticated users, update via backend
    try {
      await CartActions.updateCartItem(itemId, { quantity });
      await fetchCart(true); // Preserve cart ID for gift cards
    } catch (error) {
      console.error('[CartContext] Error updating quantity:', error);
      toast.error('Error al actualizar cantidad');
    }
  };

  const clearCart = async () => {
    setItems([]);
  };

  // Reset cart after purchase completion (clears state and activeCartId)
  const resetCart = () => {
    setItems([]);
    setActiveCartId(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    clearGiftCardsFromSession(); // Clear gift cards from sessionStorage
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  // Total excluyendo gift cards - para validación de cupones
  const nonGiftCardTotal = items
    .filter(item => !item.isGiftCard)
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const hasGiftCards = items.some(item => item.isGiftCard);
  
  const getGiftCardItems = () => items.filter(item => item.isGiftCard);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      activeCartId,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      addGiftCardToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      resetCart,
      syncGuestCartToUser,
      totalItems,
      totalPrice,
      nonGiftCardTotal,
      hasGiftCards,
      getGiftCardItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
