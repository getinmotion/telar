import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  MobileColumnsToggle,
  MobileColumns,
} from "@/components/MobileColumnsToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { mapArtisanCategory } from "@/lib/productMapper";
import { Product } from "@/types/products.types";

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
  const isMobile = useIsMobile();
  const {
    products: contextProducts,
    loading,
    fetchFeaturedProducts,
  } = useProducts();
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [randomSeed] = useState(() => Math.floor(Date.now() / 86400000));
  const [mobileColumns, setMobileColumns] = useState<MobileColumns>(() => {
    const saved = localStorage.getItem("featuredMobileColumns");
    return saved === "1" ? 1 : 2;
  });

  useEffect(() => {
    localStorage.setItem("featuredMobileColumns", String(mobileColumns));
  }, [mobileColumns]);

  useEffect(() => {
    loadFeaturedProducts();
  }, [randomSeed]);

  useEffect(() => {
    if (contextProducts.length > 0) {
      const prioritizedProducts = prioritizedDistributedShuffle(
        contextProducts.map((p) => ({
          ...p
        })),
        randomSeed,
      );
      setDisplayProducts(prioritizedProducts.slice(0, 8));
    }
  }, [contextProducts, randomSeed]);

  const loadFeaturedProducts = async () => {
    try {
      await fetchFeaturedProducts();
    } catch (error) {
      // Error already handled by context with toast
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

  if (!loading && displayProducts.length === 0) {
    return null;
  }

  const isCompactMode = isMobile && mobileColumns === 2;

  return (
    <section
      className={cn("bg-muted/20", isMobile ? "py-12 px-2" : "py-20 px-4")}
    >
      <div className="container mx-auto max-w-7xl">
        <div className={cn("text-center", isMobile ? "mb-8" : "mb-16")}>
          <h2
            className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl mb-2" : "text-4xl lg:text-5xl mb-4",
            )}
          >
            Productos Destacados
          </h2>
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "text-base" : "text-xl",
            )}
          >
            Lo mejor de nuestra comunidad de artesanos
          </p>
        </div>

        {isMobile && (
          <div className="flex justify-end mb-4">
            <MobileColumnsToggle
              columns={mobileColumns}
              onColumnsChange={setMobileColumns}
            />
          </div>
        )}

        <div
          className={cn(
            "grid",
            isMobile ? "gap-3" : "gap-6",
            isMobile
              ? mobileColumns === 1
                ? "grid-cols-1"
                : "grid-cols-2"
              : "md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {displayProducts.map((product) => {
            const imageUrl =
              product.imageUrl ||
              (Array.isArray(product.images) ? product.images[0] : undefined);
            return (
              <ProductCard
                key={product.id}
                {...product}
                imageUrl={imageUrl}
                stock={product.stock | product.inventory}
                canPurchase={product.canPurchase ?? false}
                compactMode={isCompactMode}
              />
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button
            size="lg"
            className="group h-12 px-10"
            onClick={() => navigate("/productos")}
          >
            Ver Todos los Productos
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
