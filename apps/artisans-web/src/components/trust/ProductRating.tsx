import React from 'react';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface ProductRatingProps {
  productId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProductRating: React.FC<ProductRatingProps> = ({ 
  productId, 
  showCount = true, 
  size = 'sm',
  className 
}) => {
  const { stats, loading } = useReviews(productId);

  if (loading || !stats || stats.total_reviews === 0) {
    return null;
  }

  const starSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderStars = () => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSize[size]} ${
              i < Math.round(stats.average_rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {renderStars()}
      <span className={`${textSize[size]} font-medium`}>
        {stats.average_rating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`${textSize[size]} text-muted-foreground`}>
          ({stats.total_reviews})
        </span>
      )}
    </div>
  );
};