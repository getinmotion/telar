import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useReviews } from '@/hooks/useReviews';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare,
  User,
  Verified
} from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { ReviewStats } from './ReviewStats';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { reviews, stats, loading, markHelpful } = useReviews(productId);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && <ReviewStats stats={stats} />}

      {/* Review Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-semibold">
                {reviews.length} {reviews.length === 1 ? 'Reseña' : 'Reseñas'}
              </span>
            </div>
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
            >
              Escribir Reseña
            </Button>
          </div>

          {showReviewForm && (
            <div className="mt-6 pt-6 border-t">
              <ReviewForm 
                productId={productId}
                onSuccess={() => setShowReviewForm(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Usuario</span>
                        {review.verified_purchase && (
                          <Badge variant="success" className="text-xs">
                            <Verified className="h-3 w-3 mr-1" />
                            Compra verificada
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {renderStars(review.rating)}
                        <span>•</span>
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h4 className="font-semibold">{review.title}</h4>
                )}

                {review.comment && (
                  <p className="text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markHelpful(review.id)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Útil ({review.helpful_count})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin reseñas aún</h3>
              <p className="text-muted-foreground mb-4">
                Sé el primero en compartir tu opinión sobre este producto.
              </p>
              <Button onClick={() => setShowReviewForm(true)}>
                Escribir Primera Reseña
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};