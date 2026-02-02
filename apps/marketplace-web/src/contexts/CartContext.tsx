import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { telarClient } from '@/lib/telarClient';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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
  syncGuestCartToUser: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  nonGiftCardTotal: number;
  hasGiftCards: boolean;
  getGiftCardItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'telar_guest_cart';

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
      if (!stored) return;

      const localItems: LocalCartItem[] = JSON.parse(stored);
      if (localItems.length === 0) return;

      // Separate gift cards from regular items
      const regularItems = localItems.filter(item => !item.isGiftCard);
      const giftCardItems = localItems.filter(item => item.isGiftCard);

      // Prepare regular items for the edge function
      const itemsToSync = regularItems.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.product.price
      }));

      // Call the edge function to sync regular cart items
      if (itemsToSync.length > 0) {
        const { data, error } = await supabase.functions.invoke('sync-guest-cart', {
          body: {
            user_id: user.id,
            items: itemsToSync
          }
        });

        if (error) {
          console.error('Error calling sync-guest-cart:', error);
          toast.error('Error al sincronizar el carrito');
          return;
        }

        // Store the cart_id from the response
        if (data?.cart_id) {
          setActiveCartId(data.cart_id);
        }
      }

      // For gift cards, we keep them in local state but mark them
      // They'll be processed separately at checkout

      // Clear local cart after successful sync
      localStorage.removeItem(CART_STORAGE_KEY);
      
      // Refresh cart from database
      await fetchCart();
      
      // Add back gift card items to state
      if (giftCardItems.length > 0) {
        setItems(prev => [
          ...prev,
          ...giftCardItems.map((item, index) => ({
            id: `giftcard-${Date.now()}-${index}`,
            ...item
          }))
        ]);
      }
      
      toast.success('Carrito sincronizado');
    } catch (error) {
      console.error('Error syncing guest cart:', error);
      toast.error('Error al sincronizar el carrito');
    }
  };

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setActiveCartId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get cart items for user where payment not completed (active cart)
      const { data: cartItems, error: cartItemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .is('payment_status', null);

      if (cartItemsError) throw cartItemsError;

      if (!cartItems || cartItems.length === 0) {
        setItems([]);
        setActiveCartId(null);
        return;
      }

      // Get the cart_id from the first item (all items share the same cart_id)
      const currentCartId = cartItems[0].cart_id;
      setActiveCartId(currentCartId);

      // Get product details from marketplace_products view (only approved products)
      const productIds = cartItems.map(item => item.product_id);
      const { data: products, error: productsError } = await telarClient
        .from('marketplace_products')
        .select('id, name, price, images')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Map cart items with product details
      const mappedItems = cartItems.map(item => {
        const product = products?.find(p => p.id === item.product_id);
        const imageUrl = product?.images?.[0] || '';
        return {
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          product: {
            name: product?.name || 'Producto no disponible',
            price: product?.price || 0,
            image_url: imageUrl
          }
        };
      });

      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number, variantId?: string) => {
    try {
      // Fetch product details from marketplace_products view
      const { data: product, error: productError } = await telarClient
        .from('marketplace_products')
        .select('id, name, price, images')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

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
            price: product.price,
            image_url: imageUrl
          }
        };

        setItems(prev => [...prev, newItem]);
        toast.success('Producto agregado al carrito');
        openCart();
        return;
      }

      // For authenticated users, check if there's an active cart_id from existing items
      let cartId = activeCartId;

      if (!cartId) {
        // Check for existing cart items to get cart_id
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('cart_id')
          .eq('user_id', user.id)
          .is('payment_status', null)
          .limit(1)
          .maybeSingle();

        if (existingItem) {
          cartId = existingItem.cart_id;
          setActiveCartId(cartId);
        }
      }

      if (cartId) {
        // Check if this product is already in the cart
        const { data: existingProduct } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cartId)
          .eq('product_id', productId)
          .maybeSingle();

        if (existingProduct) {
          // Update quantity of existing item
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingProduct.quantity + quantity })
            .eq('id', existingProduct.id);

          if (updateError) throw updateError;
        } else {
          // Add new item to existing cart
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              cart_id: cartId,
              user_id: user.id,
              product_id: productId,
              variant_id: variantId,
              quantity
            });

          if (insertError) throw insertError;
        }
      } else {
        // No active cart, use edge function to create cart_id and cart_item
        const { data, error } = await supabase.functions.invoke('sync-guest-cart', {
          body: {
            user_id: user.id,
            items: [{
              product_id: productId,
              variant_id: variantId,
              quantity,
              price: product.price
            }]
          }
        });

        if (error) {
          console.error('Error calling sync-guest-cart:', error);
          throw error;
        }

        if (data?.cart_id) {
          setActiveCartId(data.cart_id);
        }
      }

      await fetchCart();
      toast.success('Producto agregado al carrito');
      openCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al agregar al carrito');
    }
  };

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
    // Check if it's a gift card (handled locally)
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
      // Get the cart_id before deleting
      const { data: cartItem } = await supabase
        .from('cart_items')
        .select('cart_id')
        .eq('id', itemId)
        .single();

      const cartId = cartItem?.cart_id;

      // Delete the cart_item
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      // Check if there are remaining items in the cart
      if (cartId) {
        const { data: remainingItems } = await supabase
          .from('cart_items')
          .select('id')
          .eq('cart_id', cartId);

        if (!remainingItems || remainingItems.length === 0) {
          // No items left, clear active cart
          setActiveCartId(null);
        }
      }

      await fetchCart();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error removing from cart:', error);
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

    // For authenticated users, update in Supabase
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar cantidad');
    }
  };

  const clearCart = async () => {
    setItems([]);
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
