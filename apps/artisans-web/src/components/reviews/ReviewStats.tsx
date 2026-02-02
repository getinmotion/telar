import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { ReviewStats as ReviewStatsType } from '@/types/reviews';

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  const { average_rating, total_reviews, rating_distribution } = stats;

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPercentage = (count: number) => {
    return total_reviews > 0 ? (count / total_reviews) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Calificaciones y Reseñas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">{average_rating.toFixed(1)}</div>
            {renderStars(Math.round(average_rating))}
            <p className="text-muted-foreground">
              Basado en {total_reviews} {total_reviews === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = rating_distribution[rating] || 0;
              const percentage = getPercentage(count);
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};