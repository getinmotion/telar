import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Quote, TrendingUp } from 'lucide-react';

interface Story {
  name: string;
  craft: string;
  location: string;
  story: string;
  metric: string;
  initials: string;
  color: string;
}

const stories: Story[] = [
  {
    name: "María González",
    craft: "Cerámica",
    location: "Ráquira, Boyacá",
    story: "Con Get in Motion aprendí a calcular precios que realmente valoran mi trabajo. Ahora vendo en línea y llego a clientes en todo el país sin intermediarios.",
    metric: "3x más ventas en 6 meses",
    initials: "MG",
    color: "bg-gradient-to-br from-primary to-primary/80"
  },
  {
    name: "Carlos Rodríguez",
    craft: "Trabajo en Madera",
    location: "Pasto, Nariño",
    story: "La plataforma me ayudó a organizar mi inventario y planificar producción para temporadas altas. Ya no pierdo ventas por falta de stock ni sobreproduzco.",
    metric: "Reducción de 40% en pérdidas",
    initials: "CR",
    color: "bg-gradient-to-br from-accent to-primary/80"
  },
  {
    name: "Ana Martínez",
    craft: "Textiles Wayuu",
    location: "La Guajira",
    story: "Creé mi tienda digital siguiendo los pasos de Get in Motion. Ahora exporto mis mochilas Wayuu a Estados Unidos y Europa, manteniendo la tradición viva.",
    metric: "Ventas internacionales desde el mes 2",
    initials: "AM",
    color: "bg-gradient-to-br from-accent to-primary"
  }
];

export const ArtisanSuccessStories: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-primary">
            Historias de éxito artesanal
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Artesanos colombianos que han profesionalizado su oficio y crecido su negocio con Get in Motion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-2 border-border hover:border-primary/30">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className={`w-16 h-16 ${story.color} text-primary-foreground text-xl font-bold shadow-lg`}>
                    <AvatarFallback className="bg-transparent">
                      {story.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary">{story.name}</h3>
                    <p className="text-sm text-primary/80">{story.craft}</p>
                    <p className="text-xs text-muted-foreground">{story.location}</p>
                  </div>
                  <Quote className="w-8 h-8 text-primary/30" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-4 leading-relaxed">
                  "{story.story}"
                </p>
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary/90">
                    {story.metric}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground italic">
            * Casos basados en experiencias reales de artesanos colombianos
          </p>
        </div>
      </div>
    </section>
  );
};