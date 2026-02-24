import React from 'react';
import { cn } from '@/lib/utils';

interface ArtisanBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'earth' | 'golden' | 'clay';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component with artisan styling
 */
export const ArtisanBadge: React.FC<ArtisanBadgeProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  const baseStyles = 'inline-flex items-center gap-2 font-medium rounded-full transition-all duration-300';
  
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary-foreground border border-secondary/20',
    earth: 'bg-muted text-muted-foreground border border-muted',
    golden: 'bg-accent/10 text-accent-foreground border border-accent/20',
    clay: 'bg-primary/10 text-primary border border-primary/20',
  };

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
