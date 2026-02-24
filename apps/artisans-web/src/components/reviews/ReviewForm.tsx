import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useReviews } from '@/hooks/useReviews';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const { addReview } = useReviews(productId);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    try {
      setIsSubmitting(true);
      await addReview({
        product_id: productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        verified_purchase: false // TODO: Check if user actually purchased the product
      });

      toast.success('Reseña enviada exitosamente');
      setRating(0);
      setTitle('');
      setComment('');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al enviar la reseña');
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const isHovered = hoveredRating >= starValue;
          const isSelected = rating >= starValue;
          
          return (
            <button
              key={i}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onMouseEnter={() => setHoveredRating(starValue)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(starValue)}
            >
              <Star
                className={`h-6 w-6 ${
                  isSelected || isHovered
                    ? 'text-yellow-400 fill-current'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Escribir Reseña</h3>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Calificación *
            </label>
            <div className="flex items-center gap-2">
              {renderStarRating()}
              <span className="text-sm text-muted-foreground ml-2">
                {rating > 0 && `${rating} de 5 estrellas`}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Título (opcional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumen de tu experiencia"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentario (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más sobre tu experiencia con este producto..."
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/1000 caracteres
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};