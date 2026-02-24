import React from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  name: string;
  city?: string;
  rating: number;
  comment: string;
  date?: string;
  helpful_count?: number;
}

interface ProductReviewsSectionProps {
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  onWriteReview?: () => void;
}

const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`${sizeClass} ${i < rating ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`}
    />
  ));
};

// Default reviews when none exist
const defaultReviews: Review[] = [
  {
    id: '1',
    name: 'Laura Hernández',
    city: 'Bogotá',
    rating: 5,
    comment: 'Hermosa pieza, superó mis expectativas. Se nota el trabajo artesanal en cada detalle.',
    helpful_count: 12
  },
  {
    id: '2',
    name: 'Juan Pablo Castro',
    city: 'Cartagena',
    rating: 5,
    comment: 'Excelente calidad y muy bien empacado. El artesano fue muy amable en resolver mis dudas.',
    helpful_count: 8
  }
];

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  reviews,
  averageRating = 4.8,
  totalReviews,
  onWriteReview
}) => {
  const displayReviews = reviews && reviews.length > 0 ? reviews : defaultReviews;
  const reviewCount = totalReviews || displayReviews.length;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-foreground">{averageRating}</span>
                <div className="flex gap-0.5">
                  {renderStars(Math.round(averageRating), 'lg')}
                </div>
              </div>
              <p className="text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>

            <Button
              onClick={onWriteReview}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            >
              Escribir una reseña
            </Button>
          </motion.div>

          {/* Reviews List */}
          <div className="space-y-6">
            {displayReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{review.name}</span>
                      {review.city && (
                        <span className="text-sm text-muted-foreground">· {review.city}</span>
                      )}
                    </div>
                  </div>
                  {review.date && (
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  )}
                </div>

                <p className="text-foreground leading-relaxed mb-4">
                  {review.comment}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">¿Te fue útil esta reseña?</span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Sí {review.helpful_count && review.helpful_count > 0 && `(${review.helpful_count})`}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    No
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
