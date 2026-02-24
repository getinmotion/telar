import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Box, Clock, Ruler, Scale } from 'lucide-react';

interface ProductAboutSectionProps {
  description?: string;
  technique?: string;
  materials?: string[];
  productionTime?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weight?: number | null;
}

export const ProductAboutSection: React.FC<ProductAboutSectionProps> = ({
  description,
  technique,
  materials,
  productionTime,
  dimensions,
  weight
}) => {
  const technicalDetails = [
    {
      icon: Palette,
      label: 'Técnica',
      value: technique || 'Artesanal tradicional'
    },
    {
      icon: Box,
      label: 'Materiales',
      value: materials?.length ? materials.join(', ') : 'Materiales locales'
    },
    {
      icon: Clock,
      label: 'Tiempo de elaboración',
      value: productionTime || '3-5 días'
    },
    {
      icon: Ruler,
      label: 'Medidas',
      value: dimensions && (dimensions.length || dimensions.width || dimensions.height)
        ? `${dimensions.length || '-'}×${dimensions.width || '-'}×${dimensions.height || '-'} cm`
        : 'Consultar'
    },
    {
      icon: Scale,
      label: 'Peso',
      value: weight ? `${weight >= 1000 ? (weight / 1000).toFixed(1) + ' kg' : weight + ' g'}` : 'Consultar'
    }
  ];

  return (
    <section className="py-16 bg-cream-200/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Acerca de esta pieza
              </h2>
              
              {description && (
                <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>

            {/* Technical Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {technicalDetails.map((detail, index) => (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-xl p-5 text-center shadow-card border border-border/30"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                    <detail.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {detail.label}
                  </p>
                  <p className="font-medium text-foreground text-sm line-clamp-2">
                    {detail.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
