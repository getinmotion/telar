import { useEffect, useState } from "react";
import { telarClient } from "@/lib/telarClient";
import { mapProductToMarketplace } from "@/lib/productMapper";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
  storeName?: string;
}

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
  materials?: string[];
  techniques?: string[];
  craft?: string;
}

export const RelatedProducts = ({ currentProductId, category, storeName }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, category, storeName]);

  const fetchRelatedProducts = async () => {
    try {
      let query = telarClient
        .from('marketplace_products')
        .select('id, name, description, price, image_url, images, store_name, rating, reviews_count, is_new, free_shipping, category, materials, techniques, craft')
        .neq('id', currentProductId)
        .limit(8);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts((data || []).map(mapProductToMarketplace));
    } catch (error) {
      // Silent fail for related products
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          Productos Relacionados
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const imageUrl = product.image_url || (Array.isArray((product as any).images) ? (product as any).images[0] : undefined);
            return (
              <ProductCard 
                key={product.id} 
                {...product} 
                image_url={imageUrl}
                materials={product.materials}
                techniques={product.techniques}
                craft={product.craft}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
