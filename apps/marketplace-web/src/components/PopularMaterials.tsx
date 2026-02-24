import { useEffect, useState } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { Button } from "@/components/ui/button";
import { getMaterialEmoji } from "@/lib/craftUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface PopularMaterialsProps {
  onMaterialClick: (material: string) => void;
}

interface MaterialCount {
  material: string;
  count: number;
}

export const PopularMaterials = ({ onMaterialClick }: PopularMaterialsProps) => {
  const { products, fetchActiveProducts } = useProducts();
  const [materials, setMaterials] = useState<MaterialCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      processMaterials();
    }
  }, [products]);

  const fetchMaterials = async () => {
    try {
      setError(null);
      await fetchActiveProducts();
    } catch (error: any) {
      setError(error?.message || 'No se pudieron cargar los materiales');
      setLoading(false);
    }
  };

  const processMaterials = () => {
    try {
      const counts: Record<string, number> = {};

      products.forEach(item => {
        if (item.materials && Array.isArray(item.materials)) {
          item.materials.forEach((material: string) => {
            counts[material] = (counts[material] || 0) + 1;
          });
        }
      });

      const sorted = Object.entries(counts)
        .map(([material, count]) => ({ material, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setMaterials(sorted);
    } catch (error: any) {
      setError(error?.message || 'Error al procesar materiales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={cn("bg-background", isMobile ? "py-10" : "py-16")}>
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Cargando materiales...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cn("bg-background", isMobile ? "py-10" : "py-16")}>
        <div className="container mx-auto px-6 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-destructive font-semibold mb-2">Error al cargar materiales</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={fetchMaterials} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (materials.length === 0) {
    return (
      <section className={cn("bg-background", isMobile ? "py-10" : "py-16")}>
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            Los materiales aparecerán aquí una vez que haya productos con materiales clasificados
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("bg-background", isMobile ? "py-10" : "py-16")}>
      <div className="container mx-auto px-6">
        <div className={cn("text-center", isMobile ? "mb-6" : "mb-12")}>
          <h2 className={cn("font-bold", isMobile ? "text-xl mb-2" : "text-3xl mb-4")}>
            Materiales Naturales
          </h2>
          <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-lg")}>
            Explora productos por los materiales tradicionales con los que están hechos
          </p>
        </div>
        
        {isMobile ? (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {materials.map(({ material, count }) => (
                <CarouselItem 
                  key={material} 
                  className="pl-2 basis-1/3"
                >
                  <div 
                    className="text-center cursor-pointer group"
                    onClick={() => onMaterialClick(material)}
                  >
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <span className="text-2xl">{getMaterialEmoji(material)}</span>
                    </div>
                    <p className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {material}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{count}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselDots />
          </Carousel>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {materials.map(({ material, count }) => (
              <div 
                key={material}
                className="text-center cursor-pointer group"
                onClick={() => onMaterialClick(material)}
              >
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <span className="text-3xl">{getMaterialEmoji(material)}</span>
                </div>
                <p className="text-sm font-medium group-hover:text-primary transition-colors mb-1">
                  {material}
                </p>
                <p className="text-xs text-muted-foreground">{count}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
