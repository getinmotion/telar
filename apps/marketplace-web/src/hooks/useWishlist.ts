import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as WishlistActions from '@/services/wishlist.actions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Query compartida: todas las instancias del hook (una por tarjeta) usan la
  // misma queryKey, así que la wishlist se pide una sola vez y queda en cache.
  const { data: wishlistItems = new Set<string>() } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const wishlistData = await WishlistActions.getUserWishlist(user!.id);
      return new Set(wishlistData.map(item => item.productId));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const setWishlistCache = (updater: (prev: Set<string>) => Set<string>) => {
    queryClient.setQueryData<Set<string>>(
      ['wishlist', user?.id],
      prev => updater(prev ?? new Set()),
    );
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

        setWishlistCache(prev => {
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

        setWishlistCache(prev => new Set(prev).add(productId));
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
