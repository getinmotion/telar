import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ExploreProductCard } from "@/components/ExploreProductCard";
import {
  getProductsNew,
  type ProductNewCore,
} from "@/services/products-new.actions";

// Seeded random for consistent shuffle during the day
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Distributed shuffle to avoid consecutive products from same store
const distributedShuffle = <T extends { storeName?: string }>(
  array: T[],
  seed: number,
): T[] => {
  if (array.length === 0) return array;

  const grouped = array.reduce(
    (acc, item) => {
      const key = item.storeName || "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );

  Object.values(grouped).forEach((group) => {
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
  });

  const sortedGroups = Object.values(grouped).sort(
    (a, b) => b.length - a.length,
  );
  const result: T[] = [];
  let groupIndex = 0;

  while (sortedGroups.some((g) => g.length > 0)) {
    const group = sortedGroups[groupIndex % sortedGroups.length];
    if (group.length > 0) {
      result.push(group.shift()!);
    }
    groupIndex++;
  }

  return result;
};

// Prioritized shuffle: purchasable products first, then non-purchasable
const prioritizedDistributedShuffle = <
  T extends { storeName?: string; canPurchase?: boolean },
>(
  array: T[],
  seed: number,
): T[] => {
  const purchasable = array.filter((item) => item.canPurchase === true);
  const notPurchasable = array.filter((item) => item.canPurchase !== true);

  const shuffledPurchasable = distributedShuffle(purchasable, seed);
  const shuffledNotPurchasable = distributedShuffle(notPurchasable, seed + 1);

  return [...shuffledPurchasable, ...shuffledNotPurchasable];
};

export const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [displayProducts, setDisplayProducts] = useState<ProductNewCore[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomSeed] = useState(() => Math.floor(Date.now() / 86400000));

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductsNew({ page: 1, limit: 50 });
      const products = response.data;

      const prioritizedProducts = prioritizedDistributedShuffle(
        products.map((p) => ({
          ...p,
          storeName: p.artisanShop?.shopName,
        })),
        randomSeed,
      );

      setDisplayProducts(prioritizedProducts.slice(0, 3));
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-editorial-bg py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <Skeleton className="h-20 w-96 mb-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#e5e1d8] aspect-[3/4] mb-6 rounded-sm" />
                <div className="h-4 bg-[#e5e1d8] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#e5e1d8] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!loading && displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-editorial-bg py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl md:text-5xl leading-[0.85] font-serif text-charcoal tracking-tight">
            CREACIONES <br />
            <span className="italic text-primary">DESTACADAS</span>
          </h2>
          <button
            onClick={() => navigate("/productos")}
            className="text-charcoal/70 hover:text-primary underline transition-colors text-sm font-sans"
          >
            ver colección completa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
          {displayProducts.map((product, idx) => (
            <ExploreProductCard
              key={product.id}
              product={product}
              className={
                idx % 3 === 1
                  ? "md:mt-12"
                  : idx % 3 === 2
                    ? "md:-mt-6"
                    : ""
              }
            />
          ))}
        </div>

        {/* Botón "Ver Todos los Productos" eliminado - ahora se usa el link en el header */}
      </div>
    </section>
  );
};
