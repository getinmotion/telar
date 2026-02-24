import React from 'react';
import { cn } from '@/lib/utils';

interface ArtisanCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'clay';
  hoverable?: boolean;
}

/**
 * Artisan-styled card component with Colombian craftsmanship aesthetic
 */
export const ArtisanCard: React.FC<ArtisanCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverable = true,
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';
  
  const variants = {
    default: 'bg-card border border-primary/10 shadow-card',
    elevated: 'bg-gradient-card shadow-elegant',
    glass: 'bg-card/60 backdrop-blur-xl border border-border shadow-glass',
    clay: 'bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 shadow-card',
  };

  const hoverStyles = hoverable 
    ? 'hover:shadow-hover hover:scale-[1.02] hover:-translate-y-1 cursor-pointer' 
    : '';

  return (
    <div className={cn(baseStyles, variants[variant], hoverStyles, className)}>
      {children}
    </div>
  );
};
