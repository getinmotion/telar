import { useEffect, useState } from 'react';
import { useProducts } from '@/contexts/ProductsContext';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories';
import { Skeleton } from './ui/skeleton';
import { mapArtisanCategory } from '@/lib/productMapper';

interface FeaturedCategoriesProps {
  onCategoryClick?: (category: string) => void;
}

interface CategoryData {
  category: string;
  product_count: number;
}

export const FeaturedCategories = ({ onCategoryClick }: FeaturedCategoriesProps) => {
  const { products, fetchActiveProducts } = useProducts();
  const [productCounts, setProductCounts] = useState<Map<string, number>>(new Map());
  const [loadingCounts, setLoadingCounts] = useState(true);
  const { categories, loading: loadingCategories } = useMarketplaceCategories();

  useEffect(() => {
    fetchProductCounts();
  }, []);

  useEffect(() => {
    if (products?.length > 0 && categories?.length > 0) {
      processCounts();
    }
  }, [products, categories]);

  const fetchProductCounts = async () => {
    try {
      await fetchActiveProducts();
    } catch (error) {
      setLoadingCounts(false);
    }
  };

  const processCounts = () => {
    try {
      const counts = new Map<string, number>();
      const categoryNames = categories.map(c => c.name).filter(Boolean);

      products.forEach((p) => {
        const categoryName =  mapArtisanCategory(p.category);
        if (categoryName) {
          const normalizedCat = categoryName.toLowerCase().trim();
          const matchedCatName = categoryNames.find(
            catName => catName && catName.toLowerCase().trim() === normalizedCat
          );
          if (matchedCatName) {
            counts.set(matchedCatName, (counts.get(matchedCatName) || 0) + 1);
          }
        }
      });

      setProductCounts(counts);
    } catch (error) {
      // Silent fail for category counts
    } finally {
      setLoadingCounts(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent ? <IconComponent className="h-8 w-8" /> : null;
  };

  // Bento layout - solo aplica desde md
  const bentoLayout: Record<string, string> = {
    "Joyería y Accesorios": "md:col-span-2 md:row-span-2",
    "Decoración del Hogar": "md:col-span-1 md:row-span-2", 
    "Textiles y Moda": "md:col-span-1 md:row-span-2",
    "Bolsos y Carteras": "md:col-span-2 md:row-span-1",
    "Vajillas y Cocina": "md:col-span-2 md:row-span-1",
    "Muebles": "md:col-span-1 md:row-span-1",
    "Arte y Esculturas": "md:col-span-1 md:row-span-1"
  };

  const loading = loadingCategories || loadingCounts;

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explora por Categoría</h2>
          <p className="text-xl text-muted-foreground">
            Encuentra artesanías únicas organizadas por categoría
          </p>
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

  // Excluir "Cuidado Personal" de los destacados en home
  const excludedFromFeatured = ["Cuidado Personal"];
  const featuredCategories = categories.filter(cat => !excludedFromFeatured.includes(cat.name));

  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explora por Categoría
          </h2>
          <p className="text-xl text-muted-foreground">
            Encuentra artesanías únicas organizadas por categoría
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 md:auto-rows-[200px]">
          {featuredCategories.map((cat) => {
            const imageUrl = cat.imageUrl || '';
            const gridClass = bentoLayout[cat.name] || "col-span-1 row-span-1";
            const count = productCounts.get(cat.name) || 0;
            
            return (
              <div
                key={cat.name}
                onClick={() => onCategoryClick && onCategoryClick(cat.name)}
                className={cn(
                  "group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300",
                  "hover:shadow-xl hover:scale-[1.02]",
                  "aspect-square md:aspect-auto",
                  gridClass
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
                  <div className="mb-2 md:mb-3 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit">
                    {getCategoryIcon(cat.icon)}
                  </div>
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
