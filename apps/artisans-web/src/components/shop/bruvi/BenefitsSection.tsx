import React from 'react';
import { motion } from 'framer-motion';
import { Hand, Leaf, Sparkles } from 'lucide-react';

const benefits = [
  {
    icon: Hand,
    title: 'Hecho a mano',
    description: 'Cada pieza lleva horas de dedicación y técnica.'
  },
  {
    icon: Leaf,
    title: 'Materiales auténticos',
    description: 'Insumos locales seleccionados con cuidado.'
  },
  {
    icon: Sparkles,
    title: 'Series limitadas',
    description: 'Piezas únicas o producciones pequeñas.'
  }
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="py-16 bg-cream-200/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {benefit.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
