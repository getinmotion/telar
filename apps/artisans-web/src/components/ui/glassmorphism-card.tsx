import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GlassmorphismCard = React.forwardRef<HTMLDivElement, GlassmorphismCardProps>(
  ({ className, intensity = 'medium', children, ...props }, ref) => {
    const intensityStyles = {
      light: 'bg-white/40 backdrop-blur-sm border-white/30',
      medium: 'bg-white/60 backdrop-blur-md border-white/40',
      heavy: 'bg-white/80 backdrop-blur-lg border-white/50'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border-2 shadow-glass transition-all duration-300 hover:shadow-glow',
          intensityStyles[intensity],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassmorphismCard.displayName = 'GlassmorphismCard';
