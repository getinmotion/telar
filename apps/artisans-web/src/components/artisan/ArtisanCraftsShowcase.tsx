import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Craft {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

const crafts: Craft[] = [
  { 
    id: 'ceramic', 
    name: 'Cerámica', 
    emoji: '🏺', 
    description: 'Alfarería, cerámica utilitaria y decorativa',
    color: 'from-primary to-primary/80'
  },
  { 
    id: 'textile', 
    name: 'Textiles', 
    emoji: '🧵', 
    description: 'Tejidos, bordados y tapices tradicionales',
    color: 'from-accent to-primary'
  },
  { 
    id: 'woodwork', 
    name: 'Madera', 
    emoji: '🪵', 
    description: 'Carpintería, tallado y muebles artesanales',
    color: 'from-accent/80 to-primary/80'
  },
  { 
    id: 'leather', 
    name: 'Cuero', 
    emoji: '👜', 
    description: 'Marroquinería, bolsos y accesorios',
    color: 'from-accent to-accent/80'
  },
  { 
    id: 'jewelry', 
    name: 'Joyería', 
    emoji: '💍', 
    description: 'Bisutería fina y joyería artesanal',
    color: 'from-secondary to-primary'
  },
  { 
    id: 'fiber', 
    name: 'Fibras Naturales', 
    emoji: '🌾', 
    description: 'Cestería, tejido en fibras vegetales',
    color: 'from-primary/80 to-accent/80'
  }
];

export const ArtisanCraftsShowcase: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-primary">
            Apoyamos todas las técnicas artesanales
          </h2>
          <p className="text-xl text-primary/90 max-w-3xl mx-auto">
            Desde cerámica hasta joyería, nuestra plataforma está diseñada para adaptarse a las necesidades específicas de cada oficio artesanal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crafts.map((craft) => (
            <Card 
              key={craft.id} 
              className="group hover:shadow-xl transition-all duration-300 border-2 border-border hover:border-primary/30 overflow-hidden"
            >
              <CardContent className="p-6">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${craft.color} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {craft.emoji}
                </div>
                <h3 className="text-2xl font-bold text-center mb-2 text-primary">
                  {craft.name}
                </h3>
                <p className="text-center text-primary/80">
                  {craft.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-primary/90 italic">
            ¿Tu técnica no está en la lista? ¡También trabajamos con técnicas mixtas y oficios especializados!
          </p>
        </div>
      </div>
    </section>
  );
};