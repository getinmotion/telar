import { useEffect } from 'react';
import { telarClient } from '@/lib/telarClient';

interface UseRealtimeSyncOptions {
  onProductChange?: () => void;
  onShopChange?: () => void;
}

export const useRealtimeSync = ({ onProductChange, onShopChange }: UseRealtimeSyncOptions) => {
  useEffect(() => {
    // Suscribirse a cambios en productos
    const productsChannel = telarClient
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          if (onProductChange) {
            onProductChange();
          }
        }
      )
      .subscribe();

    // Suscribirse a cambios en tiendas
    const shopsChannel = telarClient
      .channel('shops-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artisan_shops'
        },
        (payload) => {
          if (onShopChange) {
            onShopChange();
          }
        }
      )
      .subscribe();

    // Cleanup al desmontar
    return () => {
      telarClient.removeChannel(productsChannel);
      telarClient.removeChannel(shopsChannel);
    };
  }, [onProductChange, onShopChange]);
};
