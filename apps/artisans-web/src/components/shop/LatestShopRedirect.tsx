import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingBag } from 'lucide-react';

export const LatestShopRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestShop = async () => {
      try {
        const { data: shop, error } = await supabase
          .from('artisan_shops')
          .select('shop_slug')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching latest shop:', error);
          setError('No se encontraron tiendas activas');
          return;
        }

        if (shop?.shop_slug) {
          navigate(`/tienda/${shop.shop_slug}`, { replace: true });
        } else {
          setError('No se encontraron tiendas activas');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al buscar la tienda más reciente');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestShop();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="text-center space-y-4">
          <div className="relative">
            <ShoppingBag className="w-16 h-16 text-primary/20 mx-auto" />
            <Loader2 className="w-8 h-8 text-primary animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground">Buscando la tienda más reciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Tienda no encontrada</h2>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={() => navigate('/tiendas')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver todas las tiendas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};