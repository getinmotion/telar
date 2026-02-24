import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid md:grid-cols-2 xl:grid-cols-3 gap-8 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card 
          key={index}
          className="group bg-gradient-card backdrop-blur-sm border-0 shadow-card animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-0 overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
            
            {/* Content skeleton */}
            <div className="p-6 space-y-4">
              {/* Product name */}
              <Skeleton className="h-6 w-3/4" />
              
              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              
              {/* Price and button */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ProductSkeletonSingle: React.FC = () => {
  return (
    <Card className="group bg-gradient-card backdrop-blur-sm border-0 shadow-card animate-pulse">
      <CardContent className="p-0 overflow-hidden">
        {/* Image skeleton */}
        <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
        
        {/* Content skeleton */}
        <div className="p-6 space-y-4">
          {/* Badge skeleton */}
          <div className="flex justify-end">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          {/* Product name */}
          <Skeleton className="h-6 w-3/4" />
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
          
          {/* Price and actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};