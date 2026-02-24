import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface StorytellingBlockProps {
  shopName: string;
  story?: string;
  imageUrl?: string;
  onKnowMore: () => void;
}

export const StorytellingBlock: React.FC<StorytellingBlockProps> = ({
  shopName,
  story,
  imageUrl,
  onKnowMore
}) => {
  const defaultStory = `Este taller nace de una tradición familiar que honra las manos, el tiempo y la historia. Cada pieza es una continuación de ese legado.`;

  return (
    <section className="py-20 bg-cream-200/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Image - Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Artesano de ${shopName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
                  <span className="text-8xl">👨‍🎨</span>
                </div>
              )}
            </div>
            
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/30 rounded-full blur-3xl -z-10" />
          </motion.div>

          {/* Content - Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <div className="inline-block">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Nuestra Historia
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              El corazón detrás de este taller
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {story || defaultStory}
            </p>

            <Button
              size="lg"
              variant="outline"
              onClick={onKnowMore}
              className="group rounded-full px-8 border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
            >
              Conocer más
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
