import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useShopWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems(new Set());
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shop_wishlist')
        .select('shop_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching shop wishlist:', error);
        setWishlistItems(new Set());
      } else {
        const ids = new Set(data?.map(item => item.shop_id) || []);
        setWishlistItems(ids);
      }
    } catch (error) {
      console.error('Error fetching shop wishlist:', error);
      setWishlistItems(new Set());
    }
  };

  const toggleWishlist = async (shopId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }

    setLoading(true);
    try {
      const isInList = wishlistItems.has(shopId);

      if (isInList) {
        const { error } = await supabase
          .from('shop_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('shop_id', shopId);

        if (error) throw error;

        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(shopId);
          return newSet;
        });
        toast.success('Tienda eliminada de favoritos');
      } else {
        const { error } = await supabase
          .from('shop_wishlist')
          .insert({ user_id: user.id, shop_id: shopId });

        if (error) throw error;

        setWishlistItems(prev => new Set(prev).add(shopId));
        toast.success('Tienda agregada a favoritos');
      }
    } catch (error) {
      console.error('Error toggling shop wishlist:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const isShopInWishlist = (shopId: string) => wishlistItems.has(shopId);

  return { isShopInWishlist, toggleWishlist, loading, wishlistItems };
};
