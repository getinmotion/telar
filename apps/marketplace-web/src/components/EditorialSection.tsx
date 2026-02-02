import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const editorialStories = [
  {
    id: 1,
    title: "Tejidos Ancestrales de San Jacinto",
    description: "Descubre la tradición centenaria del tejido de hamacas y mochilas que ha pasado de generación en generación.",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=1000&fit=crop",
    link: "#"
  },
  {
    id: 2,
    title: "Cerámica de Ráquira",
    description: "Explora el arte de la cerámica tradicional colombiana, donde cada pieza cuenta una historia única.",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=1000&fit=crop",
    link: "#"
  },
  {
    id: 3,
    title: "Joyería Artesanal de Mompox",
    description: "Conoce la técnica de la filigrana momposina, declarada Patrimonio Cultural de la Humanidad.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop",
    link: "#"
  }
];

export const EditorialSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Historias de Nuestros Artesanos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada pieza tiene una historia. Conoce las tradiciones y técnicas que hacen únicas nuestras artesanías.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {editorialStories.map((story) => (
            <Card 
              key={story.id}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              {/* Content */}
              <CardContent className="p-6 space-y-4">
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {story.title}
                </h3>
                <p className="text-muted-foreground line-clamp-3">
                  {story.description}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold group/btn"
                  asChild
                >
                  <a href={story.link}>
                    Leer más
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
