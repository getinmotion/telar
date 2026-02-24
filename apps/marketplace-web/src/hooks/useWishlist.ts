import { useEffect, useState } from 'react';
import * as WishlistActions from '@/services/wishlist.actions';
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

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const wishlistData = await WishlistActions.getUserWishlist(user.id);
      const ids = new Set(wishlistData.map(item => item.productId));
      setWishlistItems(ids);
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
        await WishlistActions.removeFromWishlist(user.id, productId);

        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Eliminado de favoritos');
      } else {
        await WishlistActions.addToWishlist({
          userId: user.id,
          productId: productId
        });

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
