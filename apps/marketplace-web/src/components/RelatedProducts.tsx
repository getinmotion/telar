/**
 * RelatedProducts — Editorial design, reuses ExploreProductCard
 * Fetches from products-new API and renders up to 4 related products
 */

import { useEffect, useState } from "react";
import {
  getProductsNew,
  type ProductFeatured,
} from "@/services/products-new.actions";
import { ExploreProductCard } from "@/components/ExploreProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
  storeName?: string;
  categoryId?: string;
}

export const RelatedProducts = ({
  currentProductId,
  categoryId,
}: RelatedProductsProps) => {
  const [products, setProducts] = useState<ProductFeatured[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        // Fetch products — prefer same category, fallback to all
        const res = await getProductsNew({
          ...(categoryId ? { categoryId } : {}),
          page: 1,
          limit: 20,
        });

        if (cancelled) return;

        const all: ProductFeatured[] = Array.isArray(res)
          ? res
          : res.data ?? [];

        // Exclude current product and take up to 4
        const filtered = all
          .filter((p) => p.id !== currentProductId)
          .slice(0, 4);

        // If we got less than 4 with category filter, fill from general
        if (filtered.length < 4 && categoryId) {
          const generalRes = await getProductsNew({ page: 1, limit: 20 });
          if (!cancelled) {
            const generalAll: ProductFeatured[] = Array.isArray(generalRes)
              ? generalRes
              : generalRes.data ?? [];
            const existingIds = new Set(filtered.map((p) => p.id));
            existingIds.add(currentProductId);
            const extras = generalAll.filter((p) => !existingIds.has(p.id));
            filtered.push(...extras.slice(0, 4 - filtered.length));
          }
        }

        if (!cancelled) {
          setProducts(filtered);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <section className="py-20 px-4" style={{ backgroundColor: "#F7E7D7" }}>
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-[#F3E4D3] rounded mb-12 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-[#F3E4D3] rounded-sm animate-pulse" />
                <div className="h-5 bg-[#F3E4D3] rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-[#F3E4D3] rounded w-1/2 animate-pulse" />
              </div>
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
    <section className="py-20 px-4" style={{ backgroundColor: "#F7E7D7" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <p
            className="text-[9px] font-bold uppercase tracking-[0.3em] mb-3 font-sans"
            style={{ color: "#BC3F1C" }}
          >
            Descubre más
          </p>
          <h2
            className="text-3xl lg:text-4xl font-serif"
            style={{ color: "#1a1a1a" }}
          >
            Piezas que también te pueden inspirar
          </h2>
        </div>

        {/* Product grid — reuses ExploreProductCard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ExploreProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
