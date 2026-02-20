import { useEffect, useState } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCraftIcon } from "@/lib/craftUtils";
import { normalizeCraft, findCraftInTags } from "@/lib/normalizationUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ExploreByTradeProps {
  onTradeClick: (craft: string) => void;
}

interface TradeCount {
  craft: string;
  count: number;
}

/**
 * Términos adicionales que NO deben aparecer como oficios en la UI
 * Complementa la lista de INVALID_CRAFT_TERMS en normalizationUtils
 */
const UI_EXCLUDED_TERMS = new Set([
  'sin especificar',
  'other',
  'otros',
  'n/a',
  'none',
  'unknown',
  // Categorías de marketplace que podrían filtrarse
  'decoración del hogar',
  'decoracion del hogar',
  'vajillas y cocina',
  'textiles y moda',
  'bolsos y carteras',
  'joyería y accesorios',
  'joyeria y accesorios',
  'muebles',
  'arte y esculturas',
  'cuidado personal',
  // Términos genéricos
  'hecho a mano',
  'artesanía',
  'artesania',
  'hogar',
  'vestuario',
  'pintura artesanal',
]);

export const ExploreByTrade = ({ onTradeClick }: ExploreByTradeProps) => {
  const { products, fetchActiveProducts } = useProducts();
  const [trades, setTrades] = useState<TradeCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      processTrades();
    }
  }, [products]);

  const fetchTrades = async () => {
    try {
      setError(null);
      await fetchActiveProducts();
    } catch (error: any) {
      setError(error?.message || 'No se pudieron cargar los oficios');
      setLoading(false);
    }
  };

  const processTrades = () => {
    try {
      const counts: Record<string, number> = {};

      products.forEach(item => {
        let normalizedCraft = normalizeCraft(item.craft, {
          tags: item.tags,
          productName: item.name
        });

        if (normalizedCraft === 'Sin especificar' && item.tags?.length) {
          const craftFromTags = findCraftInTags(item.tags);
          if (craftFromTags) {
            normalizedCraft = craftFromTags;
          }
        }

        const normalizedLower = normalizedCraft.toLowerCase();
        if (
          normalizedCraft !== 'Sin especificar' &&
          !UI_EXCLUDED_TERMS.has(normalizedLower)
        ) {
          counts[normalizedCraft] = (counts[normalizedCraft] || 0) + 1;
        }
      });

      const sorted = Object.entries(counts)
        .map(([craft, count]) => ({ craft, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

      setTrades(sorted);
    } catch (error: any) {
      setError(error?.message || 'Error al procesar oficios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={cn("bg-muted/30", isMobile ? "py-10" : "py-20")}>
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Cargando oficios artesanales...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cn("bg-muted/30", isMobile ? "py-10" : "py-20")}>
        <div className="container mx-auto px-6 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-2xl mx-auto">
            <p className="text-destructive font-semibold mb-2">Error al cargar oficios</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={fetchTrades} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (trades.length === 0) {
    return (
      <section className={cn("bg-muted/30", isMobile ? "py-10" : "py-20")}>
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            Los oficios artesanales aparecerán aquí una vez que haya productos clasificados
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("bg-muted/30", isMobile ? "py-10" : "py-20")}>
      <div className="container mx-auto px-6">
        <div className={cn("text-center", isMobile ? "mb-6" : "mb-12")}>
          <h2 className={cn("font-bold mb-2", isMobile ? "text-xl" : "text-3xl mb-4")}>
            Explora por Oficio Artesanal
          </h2>
          <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-lg")}>
            Descubre la maestría de nuestros artesanos
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
              {trades.map(({ craft, count }) => {
                const Icon = getCraftIcon(craft);
                return (
                  <CarouselItem 
                    key={craft} 
                    className="pl-2 basis-1/3"
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-border/50 h-full"
                      onClick={() => onTradeClick(craft)}
                    >
                      <CardContent className="p-3 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-medium text-xs mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {craft}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {count} {count === 1 ? 'prod.' : 'prods.'}
                        </p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselDots />
          </Carousel>
        ) : (
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trades.map(({ craft, count }) => {
              const Icon = getCraftIcon(craft);
              return (
                <Card 
                  key={craft}
                  className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border-border/50"
                  onClick={() => onTradeClick(craft)}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {craft}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
