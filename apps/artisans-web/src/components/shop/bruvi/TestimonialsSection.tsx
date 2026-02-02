import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  shopName: string;
}

// Default testimonials when no real reviews exist
const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'María González',
    city: 'Bogotá',
    rating: 5,
    comment: 'Hermosa pieza, se nota el amor y dedicación en cada detalle. Llegó perfectamente empacada.'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    city: 'Medellín',
    rating: 5,
    comment: 'Calidad excepcional. Es exactamente lo que esperaba y más. Definitivamente volveré a comprar.'
  },
  {
    id: '3',
    name: 'Ana Martínez',
    city: 'Cali',
    rating: 4,
    comment: 'Me encantó el producto. El artesano fue muy amable y me explicó todo sobre la técnica.'
  }
];

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${i < rating ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`}
    />
  ));
};

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  shopName
}) => {
  const displayTestimonials = testimonials && testimonials.length > 0 
    ? testimonials 
    : defaultTestimonials;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Lo que dicen quienes ya compraron
          </h2>
          <p className="text-muted-foreground">
            Experiencias reales de clientes de {shopName}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayTestimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/30 relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
              
              <div className="flex gap-1 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-foreground mb-4 leading-relaxed">
                "{testimonial.comment}"
              </p>
              
              <div className="pt-4 border-t border-border/50">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.city}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
