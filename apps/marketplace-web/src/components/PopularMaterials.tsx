import { useEffect, useState } from "react";
import { telarClient } from "@/lib/telarClient";
import { Button } from "@/components/ui/button";
import { getMaterialEmoji } from "@/lib/craftUtils";

interface PopularMaterialsProps {
  onMaterialClick: (material: string) => void;
}

interface MaterialCount {
  material: string;
  count: number;
}

export const PopularMaterials = ({ onMaterialClick }: PopularMaterialsProps) => {
  const [materials, setMaterials] = useState<MaterialCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setError(null);
      const { data, error } = await telarClient
        .from('marketplace_products')
        .select('materials');

      if (error) {
        console.error('[PopularMaterials] Database error:', error);
        throw new Error(`Error al cargar materiales: ${error.message}`);
      }

      

      // Agrupar y contar materiales
      const counts: Record<string, number> = {};
      data?.forEach(item => {
        if (item.materials && Array.isArray(item.materials)) {
          item.materials.forEach((material: string) => {
            counts[material] = (counts[material] || 0) + 1;
          });
        }
      });

      // Convertir a array y ordenar por popularidad
      const sorted = Object.entries(counts)
        .map(([material, count]) => ({ material, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setMaterials(sorted);
    } catch (error: any) {
      console.error('[PopularMaterials] Error:', error);
      setError(error?.message || 'No se pudieron cargar los materiales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Cargando materiales...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
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
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            Los materiales aparecerán aquí una vez que haya productos con materiales clasificados
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Materiales Naturales</h2>
          <p className="text-lg text-muted-foreground">
            Explora productos por los materiales tradicionales con los que están hechos
          </p>
        </div>
        
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
      </div>
    </section>
  );
};
