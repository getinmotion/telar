import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { telarClient } from '@/lib/telarClient';
import { Skeleton } from './ui/skeleton';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplaceCategories';
import { normalizeArtisanText } from '@/lib/normalizationUtils';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedCategoriesProps {
  onCategoryClick?: (category: string) => void;
}

interface CategoryData {
  category: string;
  product_count: number;
}

export const FeaturedCategories = ({ onCategoryClick }: FeaturedCategoriesProps) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryNames = MARKETPLACE_CATEGORIES.map(c => c.name);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Consultar desde la vista marketplace_products (ya filtrada por moderación)
      const { data: products, error } = await telarClient
        .from('marketplace_products')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      // Contar productos por cada categoría de marketplace (ya vienen mapeadas de la vista)
      const categoryCounts: Record<string, number> = {};
      
      // Normalizar conteo case-insensitive
      (products || []).forEach((p: any) => {
        if (p.category) {
          const normalizedCat = p.category.toLowerCase().trim();
          // Encontrar categoría que coincida y usar su nombre canónico
          const matchedCatName = categoryNames.find(
            catName => catName.toLowerCase().trim() === normalizedCat
          );
          if (matchedCatName) {
            categoryCounts[matchedCatName] = (categoryCounts[matchedCatName] || 0) + 1;
          }
        }
      });

      // Crear array de categorías con conteos
      const categoriesWithCount = categoryNames.map(cat => ({
        category: cat,
        product_count: categoryCounts[cat] || 0,
      }));

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = MARKETPLACE_CATEGORIES.find(c => c.name === categoryName);
    if (!category) return null;
    const IconComponent = Icons[category.icon] as LucideIcon;
    return IconComponent ? <IconComponent className="h-8 w-8" /> : null;
  };

  // Bento layout solo aplica desde md: - en mobile todas las cards son uniformes
  const bentoLayout: Record<string, string> = {
    "Joyería y Accesorios": "md:col-span-2 md:row-span-2",
    "Decoración del Hogar": "md:col-span-1 md:row-span-2", 
    "Textiles y Moda": "md:col-span-1 md:row-span-2",
    "Bolsos y Carteras": "md:col-span-2 md:row-span-1",
    "Vajillas y Cocina": "md:col-span-2 md:row-span-1",
    "Muebles": "md:col-span-1 md:row-span-1",
    "Arte y Esculturas": "md:col-span-1 md:row-span-1"
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Explora por Categoría
          </h2>
          <p className="text-xl text-muted-foreground">
            Encuentra artesanías únicas organizadas por categoría
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 md:auto-rows-[200px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="aspect-square md:aspect-auto rounded-lg overflow-hidden">
              <div className="w-full h-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
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
          {categories.map((cat) => {
            const categoryData = MARKETPLACE_CATEGORIES.find(c => c.name === cat.category);
            const imageUrl = categoryData?.imageUrl || '';
            const gridClass = bentoLayout[cat.category] || "col-span-1 row-span-1";
            
            return (
              <div
                key={cat.category}
                onClick={() => onCategoryClick && onCategoryClick(cat.category)}
                className={cn(
                  "group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300",
                  "hover:shadow-xl hover:scale-[1.02]",
                  "aspect-square md:aspect-auto", // Cuadrado en mobile, flexible en desktop
                  gridClass
                )}
              >
                <div className="absolute inset-0">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={cat.category}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted animate-pulse" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                
                <div className="relative h-full flex flex-col justify-end p-3 md:p-6 text-white">
                  <div className="mb-2 md:mb-3 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit">
                    {getCategoryIcon(cat.category)}
                  </div>
                  <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2 line-clamp-2">
                    {cat.category}
                  </h3>
                  <p className="text-xs md:text-sm text-white/80">
                    {cat.product_count} {cat.product_count === 1 ? 'producto' : 'productos'}
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
