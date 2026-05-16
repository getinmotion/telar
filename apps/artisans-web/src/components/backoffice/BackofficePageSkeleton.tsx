/**
 * BackofficePageSkeleton
 * Fallback de Suspense mientras se carga un chunk lazy del backoffice.
 */
import React from 'react';

export const BackofficePageSkeleton: React.FC = () => (
  <div className="p-6 space-y-4 animate-pulse">
    <div className="h-8 bg-muted rounded w-1/3" />
    <div className="h-4 bg-muted rounded w-1/2" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 bg-muted rounded-lg" />
      ))}
    </div>
    <div className="h-64 bg-muted rounded-lg mt-4" />
  </div>
);
