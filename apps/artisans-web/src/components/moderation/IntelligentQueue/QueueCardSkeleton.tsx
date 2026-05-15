import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const QueueCardSkeleton: React.FC = () => (
  <div className="rounded-lg border bg-card p-4 space-y-3">
    <div className="flex gap-3">
      <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-7 w-20 rounded-md" />
      <Skeleton className="h-7 w-20 rounded-md" />
    </div>
  </div>
);
