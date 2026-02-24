import React from 'react';
import { motion } from 'framer-motion';
import { Check, Heart } from 'lucide-react';

const impactPoints = [
  'Comercio justo',
  'Técnicas artesanales',
  'Materiales responsables'
];

export const ImpactSection: React.FC = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/10 mb-4">
              <Heart className="w-8 h-8" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Impacto real
            </h2>
            
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Cada compra apoya el oficio local y permite que este taller siga creando piezas únicas.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-6">
              {impactPoints.map((point, index) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 bg-primary-foreground/10 rounded-full px-6 py-3"
                >
                  <Check className="w-5 h-5 text-secondary" />
                  <span className="font-medium">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
