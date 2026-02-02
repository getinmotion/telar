import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, CartSummary } from '@/types/cart';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
  });
  const { toast } = useToast();

  // Get or create session ID for anonymous users
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            id,
            name,
            images,
            shop_id,
            inventory,
            active
          )
        `);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { data, error } = await query;

      if (error) throw error;

      setCartItems(data || []);
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
  }, [getSessionId, toast]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1, price: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);
      
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      const cartData: any = {
        product_id: productId,
        quantity,
        price,
      };

      if (user) {
        cartData.user_id = user.id;
      } else {
        cartData.session_id = getSessionId();
      }

      const { error } = await supabase
        .from('cart_items')
        .insert(cartData);

      if (error) throw error;

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
  }, [cartItems, fetchCartItems, getSessionId, toast]);

  // Update quantity
  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

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
  }, [toast]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

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
  }, [toast]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase.from('cart_items').delete();
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { error } = await query;

      if (error) throw error;

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
  }, [getSessionId, toast]);

  // Calculate summary
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

  // Merge guest cart with user cart on login
  const mergeGuestCart = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sessionId = localStorage.getItem('cart_session_id');
      if (!sessionId) return;

      // Get guest cart items
      const { data: guestItems, error: guestError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('session_id', sessionId);

      if (guestError || !guestItems?.length) return;

      // Update guest items to user items
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ user_id: user.id, session_id: null })
        .eq('session_id', sessionId);

      if (updateError) throw updateError;

      // Remove session ID from localStorage
      localStorage.removeItem('cart_session_id');
      
      await fetchCartItems();
    } catch (error: any) {
      console.error('Error merging guest cart:', error);
    }
  }, [fetchCartItems]);

  // Initial load
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