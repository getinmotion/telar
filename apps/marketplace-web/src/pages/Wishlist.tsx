import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { telarClient } from "@/lib/telarClient";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  store_name?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  free_shipping?: boolean;
}

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      
      // 1. Get wishlist product IDs for the user
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user!.id);

      if (wishlistError) throw wishlistError;

      const productIds = wishlistData?.map(item => item.product_id) || [];

      // 2. Fetch product details from marketplace_products view (only approved products)
      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await telarClient
          .from('marketplace_products')
          .select('*')
          .in('id', productIds);

        if (productsError) throw productsError;

        // Mapear productos a formato marketplace
        const { mapProductToMarketplace } = await import('@/lib/productMapper');
        const mappedProducts = (productsData || []).map(mapProductToMarketplace);
        
        setWishlistProducts(mappedProducts);
      } else {
        setWishlistProducts([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container mx-auto px-6 py-24">
            <div className="text-center max-w-md mx-auto">
              <Heart className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-3">Inicia sesión para ver tus favoritos</h2>
              <p className="text-muted-foreground mb-8">
                Guarda productos que te gusten para encontrarlos fácilmente
              </p>
              <Button asChild size="lg">
                <Link to="/auth">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-6 py-12">
          
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="h-8 w-8 fill-primary text-primary" />
              <h1 className="text-5xl font-bold">Mis Favoritos</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'producto' : 'productos'} guardados
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando favoritos...</p>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-24">
              <Heart className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-2">No tienes favoritos aún</h2>
              <p className="text-muted-foreground mb-8">
                Empieza a guardar productos que te gusten
              </p>
              <Button asChild size="lg">
                <Link to="/productos">Explorar Productos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
