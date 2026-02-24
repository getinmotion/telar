import { useEffect, useState } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/products.types";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
  storeName?: string;
}

export const RelatedProducts = ({ currentProductId, category, storeName }: RelatedProductsProps) => {
  const { products: contextProducts, fetchProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, category, storeName]);

  useEffect(() => {
    if (contextProducts?.length > 0) {
      const mappedProducts = contextProducts
        .map(p => ({...p}))
        .slice(0, 4);

      setProducts(mappedProducts);
      setLoading(false);
    }
  }, [contextProducts]);

  const fetchRelatedProducts = async () => {
    try {
      await fetchProducts({
        category: category,
        exclude: currentProductId,
        limit: 4,
      });
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => {
            const imageUrl = product.imageUrl || (Array.isArray((product as any).images) ? (product as any).images[0] : undefined);
            return (
              <ProductCard 
                key={product.id} 
                {...product} 
                imageUrl={imageUrl}
                materials={product.materials}
                techniques={product.techniques}
                craft={product.craft}
                canPurchase={(product as any).canPurchase ?? false}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
