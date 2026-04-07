import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { getProductsNew, type ProductsNewPaginatedResponse } from '@/services/products-new.actions';
import type { CategoryWithChildren } from '@/services/taxonomy.actions';

// ── Fallback images (local assets) ───────────────────
import joyeriaImg from '@/assets/categories/joyeria.png';
import decoracionImg from '@/assets/categories/decoracion.png';
import textilesImg from '@/assets/categories/textiles.png';
import bolsosImg from '@/assets/categories/bolsos.png';
import vajillasImg from '@/assets/categories/vajillas.png';
import mueblesImg from '@/assets/categories/muebles.png';
import arteImg from '@/assets/categories/arte.png';

const FALLBACK_IMAGES: Record<string, string> = {
  'joyeria-y-accesorios': joyeriaImg,
  'decoracion-del-hogar': decoracionImg,
  'textiles-y-moda': textilesImg,
  'bolsos-y-carteras': bolsosImg,
  'vajillas-y-cocina': vajillasImg,
  'muebles': mueblesImg,
  'arte-y-esculturas': arteImg,
  // Name-based fallbacks
  'joyería y accesorios': joyeriaImg,
  'decoración del hogar': decoracionImg,
  'textiles y moda': textilesImg,
  'bolsos y carteras': bolsosImg,
  'vajillas y cocina': vajillasImg,
  'arte y esculturas': arteImg,
};

function getCategoryImage(cat: { slug: string; name: string; imageUrl: string | null }): string {
  if (cat.imageUrl) return cat.imageUrl;
  return FALLBACK_IMAGES[cat.slug] ?? FALLBACK_IMAGES[cat.name.toLowerCase()] ?? decoracionImg;
}

// Grid uniforme - todas las categorías del mismo tamaño

// Slugs to exclude from home featured
const EXCLUDED_SLUGS = ['cuidado-personal'];

export const FeaturedCategories = () => {
  const navigate = useNavigate();
  const { categoryHierarchy, loading: loadingTaxonomy } = useTaxonomy();
  const [productCounts, setProductCounts] = useState<Map<string, number>>(new Map());
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Only show top-level (parent) categories, excluding some
  const featuredCategories = useMemo(() => {
    return categoryHierarchy.filter(
      (cat) => cat.isActive && !EXCLUDED_SLUGS.includes(cat.slug)
    );
  }, [categoryHierarchy]);

  // Fetch product counts per parent category
  useEffect(() => {
    if (featuredCategories.length === 0) return;
    let cancelled = false;

    const fetchCounts = async () => {
      setLoadingCounts(true);
      try {
        // Fetch a big page to count per category
        const res: ProductsNewPaginatedResponse = await getProductsNew({ page: 1, limit: 500 });

        if (cancelled) return;

        // Build a set of all category IDs per parent (parent + its subcategories)
        const parentIdMap = new Map<string, Set<string>>();
        featuredCategories.forEach((parent) => {
          const ids = new Set<string>([parent.id]);
          parent.subcategories.forEach((sub) => ids.add(sub.id));
          parentIdMap.set(parent.id, ids);
        });

        // Count products per parent category
        const counts = new Map<string, number>();
        res.data.forEach((product) => {
          for (const [parentId, catIds] of parentIdMap) {
            if (catIds.has(product.categoryId)) {
              counts.set(parentId, (counts.get(parentId) || 0) + 1);
            }
          }
        });

        setProductCounts(counts);
      } catch {
        // Silent fail — counts show 0
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    };

    fetchCounts();
    return () => { cancelled = true; };
  }, [featuredCategories]);

  const loading = loadingTaxonomy || loadingCounts;

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-left mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold">Explora por Categoría</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 md:auto-rows-[200px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="aspect-square md:aspect-auto rounded-lg overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (featuredCategories.length === 0) return null;

  const handleCategoryClick = (cat: CategoryWithChildren) => {
    navigate(`/productos?categoria=${cat.slug}`);
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-left mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Explora por Categoría
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {featuredCategories.map((cat) => {
            const imageUrl = getCategoryImage(cat);
            const count = productCounts.get(cat.id) || 0;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  'group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300',
                  'hover:shadow-xl hover:scale-[1.02]',
                  'aspect-square',
                )}
              >
                <div className="absolute inset-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted animate-pulse" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                <div className="relative h-full flex flex-col justify-end p-3 md:p-6 text-white">
                  <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2 line-clamp-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs md:text-sm text-white/80">
                    {count} {count === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
