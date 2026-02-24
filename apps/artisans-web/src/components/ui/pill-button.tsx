import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  active?: boolean;
  icon?: LucideIcon;
  variant?: 'default' | 'neon' | 'outlined';
}

export const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ children, active, icon: Icon, variant = 'default', className, ...props }, ref) => {
    const baseStyles = "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300";
    
    const variantStyles = {
      default: cn(
        "border",
        active 
          ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-elegant)]" 
          : "bg-background border-border text-foreground hover:border-primary/60 hover:bg-primary/10"
      ),
      neon: cn(
        active 
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" 
          : "bg-primary/10 text-primary hover:bg-primary/20"
      ),
      outlined: cn(
        "border-2",
        active 
          ? "border-primary bg-primary/10 text-primary" 
          : "border-border bg-background text-foreground hover:border-primary"
      )
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          active && "scale-105",
          className
        )}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </button>
    );
  }
);

PillButton.displayName = 'PillButton';
