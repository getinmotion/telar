import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWishlist = () => {
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

  //
  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistItems(new Set());
      } else {
        const ids = new Set(data?.map(item => item.product_id) || []);
        setWishlistItems(ids);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems(new Set());
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return;
    }

    setLoading(true);
    try {
      const isInList = wishlistItems.has(productId);

      if (isInList) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Eliminado de favoritos');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;

        setWishlistItems(prev => new Set(prev).add(productId));
        toast.success('Agregado a favoritos');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.has(productId);

  return { isInWishlist, toggleWishlist, loading };
};
