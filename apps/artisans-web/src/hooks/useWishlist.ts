import { useState, useEffect } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';

export const useWishlist = () => {
  const userLocalStorage = useUserLocalStorage();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = userLocalStorage.getItem('wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (error) {
        console.warn('Error loading wishlist:', error);
        setWishlist([]);
      }
    }
  }, [userLocalStorage]);

  const addToWishlist = (productId: string) => {
    const newWishlist = [...wishlist, productId];
    setWishlist(newWishlist);
    userLocalStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const removeFromWishlist = (productId: string) => {
    const newWishlist = wishlist.filter(id => id !== productId);
    setWishlist(newWishlist);
    userLocalStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist
  };
};