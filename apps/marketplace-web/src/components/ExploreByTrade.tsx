import { useEffect, useState } from "react";
import { telarClient } from "@/lib/telarClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCraftIcon } from "@/lib/craftUtils";
import { normalizeCraft } from "@/lib/normalizationUtils";

interface ExploreByTradeProps {
  onTradeClick: (craft: string) => void;
}

interface TradeCount {
  craft: string;
  count: number;
}

export const ExploreByTrade = ({ onTradeClick }: ExploreByTradeProps) => {
  const [trades, setTrades] = useState<TradeCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setError(null);
      const { data, error } = await telarClient
        .from('marketplace_products')
        .select('*');

      if (error) {
        console.error('[ExploreByTrade] Database error:', error);
        throw new Error(`Error al cargar oficios: ${error.message}`);
      }

      

      // Mapear productos y extraer craft
      const { mapProductToMarketplace } = await import('@/lib/productMapper');
      const mappedProducts = (data || []).map(mapProductToMarketplace);

      // Agrupar y contar oficios con normalización
      const counts: Record<string, number> = {};
      mappedProducts.forEach(item => {
        if (item.craft) {
          const normalized = normalizeCraft(item.craft);
          counts[normalized] = (counts[normalized] || 0) + 1;
        }
      });

      // Convertir a array y ordenar por popularidad
      const sorted = Object.entries(counts)
        .map(([craft, count]) => ({ craft, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

      setTrades(sorted);
    } catch (error: any) {
      console.error('[ExploreByTrade] Error:', error);
      setError(error?.message || 'No se pudieron cargar los oficios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Cargando oficios artesanales...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-muted/30">
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            Los oficios artesanales aparecerán aquí una vez que haya productos clasificados
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explora por Oficio Artesanal</h2>
          <p className="text-lg text-muted-foreground">
            Descubre la maestría de nuestros artesanos por su especialidad
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
      </div>
    </section>
  );
};
