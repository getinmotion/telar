import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { telarClient } from "@/lib/telarClient";
import { mapProductToMarketplace } from "@/lib/productMapper";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[];
  store_name?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  free_shipping?: boolean;
  stock?: number;
  category?: string;
}

export const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setError(null);
      
      const { data, error } = await telarClient
        .from('marketplace_products')
        .select('id, name, description, price, image_url, images, store_name, rating, reviews_count, is_new, free_shipping, category')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        throw new Error(`Error al cargar productos destacados: ${error.message}`);
      }
      
      setProducts((data || []).map(mapProductToMarketplace));
    } catch (error: any) {
      setError(error?.message || 'No se pudieron cargar los productos destacados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-2xl mx-auto">
            <p className="text-destructive font-semibold mb-2">Error al cargar productos destacados</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={fetchFeaturedProducts} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Productos Destacados
          </h2>
          <p className="text-xl text-muted-foreground">
            Lo mejor de nuestra comunidad de artesanos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageUrl = product.image_url || (Array.isArray((product as any).images) ? (product as any).images[0] : undefined);
            return (
              <ProductCard key={product.id} {...product} image_url={imageUrl} />
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="group h-12 px-10"
            onClick={() => navigate('/productos')}
          >
            Ver Todos los Productos
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
