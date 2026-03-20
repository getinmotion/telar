import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CartItem, CartSummary } from '@/types/cart';
import { useToast } from '@/hooks/use-toast';
import {
  getOpenCartByBuyerId,
  createCart,
  syncGuestCart,
  SaleContext
} from '@/services/cart.actions';
import {
  getCartItemsByCartId,
  createCartItem,
  updateCartItem,
  deleteCartItem,
  deleteAllCartItems,
  PriceSource,
  priceToMinor,
  priceFromMinor
} from '@/services/cartItems.actions';

// Guest cart item structure (stored in localStorage)
interface GuestCartItem {
  productId: string;
  quantity: number;
  price: number;
  shopId: string;
  productName?: string;
  productImages?: any;
}

const GUEST_CART_KEY = 'telar_guest_cart';

export const useShoppingCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCartId, setCurrentCartId] = useState<string | null>(null);
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
  });
  const { toast } = useToast();

  // ============= Guest Cart Helpers =============

  const getGuestCart = useCallback((): GuestCartItem[] => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading guest cart:', error);
      return [];
    }
  }, []);

  const setGuestCart = useCallback((items: GuestCartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }, []);

  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
      console.error('Error clearing guest cart:', error);
    }
  }, []);

  // ============= Fetch Cart Items =============

  // ✅ MIGRATED: GET /cart/buyer/:buyerUserId/open + GET /cart-items/cart/:cartId
  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        // Guest user: read from localStorage
        const guestItems = getGuestCart();

        // Convert to CartItem format for compatibility
        const items: CartItem[] = guestItems.map(item => ({
          id: `guest-${item.productId}`,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product: item.productName ? {
            id: item.productId,
            name: item.productName,
            images: item.productImages,
            shop_id: item.shopId,
            inventory: 999,
            active: true,
          } : undefined,
        }));

        setCartItems(items);
        setLoading(false);
        return;
      }

      // Authenticated user: fetch from backend
      const cart = await getOpenCartByBuyerId(user.id);

      if (!cart) {
        // No cart exists yet
        setCartItems([]);
        setCurrentCartId(null);
        setLoading(false);
        return;
      }

      setCurrentCartId(cart.id);

      // Fetch cart items
      const items = await getCartItemsByCartId(cart.id);

      // Transform to legacy CartItem format for compatibility
      const transformedItems: CartItem[] = items.map(item => ({
        id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: priceFromMinor(item.unitPriceMinor),
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images,
          shop_id: item.sellerShopId,
          inventory: item.product.stock || 0,
          active: item.product.active,
        } : undefined,
      }));

      setCartItems(transformedItems);
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos del carrito.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, getGuestCart, toast]);

  // ============= Add to Cart =============

  // ✅ MIGRATED: POST /cart + POST /cart-items
  const addToCart = useCallback(async (
    productId: string,
    quantity: number = 1,
    price: number,
    shopId?: string,
    productName?: string,
    productImages?: any
  ) => {
    try {
      if (!user) {
        // Guest user: add to localStorage
        const guestItems = getGuestCart();
        const existingIndex = guestItems.findIndex(item => item.productId === productId);

        if (existingIndex >= 0) {
          // Update quantity
          guestItems[existingIndex].quantity += quantity;
        } else {
          // Add new item
          guestItems.push({
            productId,
            quantity,
            price,
            shopId: shopId || '',
            productName,
            productImages,
          });
        }

        setGuestCart(guestItems);
        await fetchCartItems();

        toast({
          title: "¡Producto agregado!",
          description: "El producto se agregó al carrito exitosamente.",
        });
        return;
      }

      // Authenticated user: check if item already exists
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      // Get or create cart
      let cartId = currentCartId;
      if (!cartId) {
        const cart = await createCart({
          buyerUserId: user.id,
          context: SaleContext.MARKETPLACE,
          currency: 'COP',
        });
        cartId = cart.id;
        setCurrentCartId(cartId);
      }

      if (!shopId) {
        throw new Error('shopId is required for authenticated users');
      }

      // Create cart item
      await createCartItem({
        cartId,
        productId,
        sellerShopId: shopId,
        quantity,
        currency: 'COP',
        unitPriceMinor: priceToMinor(price),
        priceSource: PriceSource.PRODUCT_BASE,
      });

      await fetchCartItems();

      toast({
        title: "¡Producto agregado!",
        description: "El producto se agregó al carrito exitosamente.",
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito.",
        variant: "destructive",
      });
    }
  }, [user, cartItems, currentCartId, getGuestCart, setGuestCart, fetchCartItems, toast]);

  // ============= Update Quantity =============

  // ✅ MIGRATED: PATCH /cart-items/:id
  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      if (!user) {
        // Guest user: update localStorage
        const guestItems = getGuestCart();
        const productId = itemId.replace('guest-', '');
        const itemIndex = guestItems.findIndex(item => item.productId === productId);

        if (itemIndex >= 0) {
          guestItems[itemIndex].quantity = newQuantity;
          setGuestCart(guestItems);

          // Update local state optimistically
          setCartItems(items =>
            items.map(item =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
          );
        }
        return;
      }

      // Authenticated user: update in backend
      await updateCartItem(itemId, { quantity: newQuantity });

      // Update local state optimistically
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad.",
        variant: "destructive",
      });
    }
  }, [user, getGuestCart, setGuestCart, toast]);

  // ============= Remove from Cart =============

  // ✅ MIGRATED: DELETE /cart-items/:id
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      if (!user) {
        // Guest user: remove from localStorage
        const guestItems = getGuestCart();
        const productId = itemId.replace('guest-', '');
        const filtered = guestItems.filter(item => item.productId !== productId);
        setGuestCart(filtered);

        setCartItems(items => items.filter(item => item.id !== itemId));

        toast({
          title: "Producto eliminado",
          description: "El producto se eliminó del carrito.",
        });
        return;
      }

      // Authenticated user: delete from backend
      await deleteCartItem(itemId);

      setCartItems(items => items.filter(item => item.id !== itemId));

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito.",
      });
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto del carrito.",
        variant: "destructive",
      });
    }
  }, [user, getGuestCart, setGuestCart, toast]);

  // ============= Clear Cart =============

  // ✅ MIGRATED: DELETE /cart-items/cart/:cartId/all
  const clearCart = useCallback(async () => {
    try {
      if (!user) {
        // Guest user: clear localStorage
        clearGuestCart();
        setCartItems([]);

        toast({
          title: "Carrito vacío",
          description: "Se eliminaron todos los productos del carrito.",
        });
        return;
      }

      // Authenticated user: clear from backend
      if (currentCartId) {
        await deleteAllCartItems(currentCartId);
      }

      setCartItems([]);

      toast({
        title: "Carrito vacío",
        description: "Se eliminaron todos los productos del carrito.",
      });
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito.",
        variant: "destructive",
      });
    }
  }, [user, currentCartId, clearGuestCart, toast]);

  // ============= Merge Guest Cart =============

  // ✅ MIGRATED: POST /cart/sync-guest
  const mergeGuestCart = useCallback(async () => {
    try {
      if (!user) return;

      const guestItems = getGuestCart();
      if (!guestItems.length) return;

      // Call sync endpoint
      await syncGuestCart({
        buyerUserId: user.id,
        items: guestItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      // Clear guest cart
      clearGuestCart();

      // Refresh cart items
      await fetchCartItems();
    } catch (error: any) {
      console.error('Error merging guest cart:', error);
    }
  }, [user, getGuestCart, clearGuestCart, fetchCartItems]);

  // ============= Calculate Summary =============

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.19; // 19% IVA in Colombia
    const shipping = subtotal > 150000 ? 0 : 15000; // Free shipping over 150k COP
    const total = subtotal + tax + shipping;
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    setSummary({
      subtotal,
      tax,
      shipping,
      total,
      itemCount,
    });
  }, [cartItems]);

  // ============= Initial Load =============

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  return {
    cartItems,
    summary,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartItems,
    mergeGuestCart,
  };
};
