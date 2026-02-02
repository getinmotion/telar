import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface BruviStyleHeroProps {
  shopName: string;
  description?: string;
  heroImage?: string;
  logoUrl?: string;
  onViewProducts: () => void;
  onKnowArtisan: () => void;
}

export const BruviStyleHero: React.FC<BruviStyleHeroProps> = ({
  shopName,
  description,
  heroImage,
  logoUrl,
  onViewProducts,
  onKnowArtisan
}) => {
  return (
    <section className="relative bg-cream-100 overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content - Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:space-y-8"
          >
            {logoUrl && (
              <motion.img
                src={logoUrl}
                alt={shopName}
                className="h-16 w-auto object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              />
            )}
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Arte hecho a mano desde{' '}
                <span className="text-primary">{shopName}</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                {description || 'Piezas únicas creadas con tradición, técnica y alma.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={onViewProducts}
                className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
              >
                Ver piezas disponibles
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={onKnowArtisan}
                className="rounded-full px-8 border-2 border-foreground/20 hover:border-foreground/40"
              >
                Conoce al artesano
              </Button>
            </div>
          </motion.div>

          {/* Image - Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] lg:aspect-square rounded-3xl overflow-hidden shadow-elegant">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={`Taller ${shopName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center">
                  <span className="text-6xl">🏺</span>
                </div>
              )}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
