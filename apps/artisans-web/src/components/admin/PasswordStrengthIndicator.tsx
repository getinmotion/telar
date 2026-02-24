import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  className 
}) => {
  const calculateStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let score = 0;
    
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (score <= 2) return { strength: 1, label: 'Débil', color: 'bg-red-500' };
    if (score <= 4) return { strength: 2, label: 'Media', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Fuerte', color: 'bg-green-500' };
  };

  if (!password) return null;
  
  const { strength, label, color } = calculateStrength(password);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Fortaleza de la contraseña:</span>
        <span className={cn(
          'font-medium',
          strength === 1 && 'text-red-400',
          strength === 2 && 'text-yellow-400', 
          strength === 3 && 'text-green-400'
        )}>
          {label}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              level <= strength ? color : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
};