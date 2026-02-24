import React from 'react';

interface PoweredByGetInMotionProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PoweredByGetInMotion: React.FC<PoweredByGetInMotionProps> = ({ 
  variant = 'dark', 
  size = 'sm',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const textColorClasses = {
    light: 'text-white/80 hover:text-white',
    dark: 'text-muted-foreground hover:text-foreground'
  };

  return (
    <a
      href="https://getinmotion.io"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 py-1 px-2 rounded-lg transition-all duration-200 hover:bg-muted/30 ${textColorClasses[variant]} ${className}`}
      aria-label="Powered by GetInMotion"
    >
      <span className={`${textSizeClasses[size]} font-body`}>
        Powered by
      </span>
      <img 
        src="/logo_gim.svg" 
        alt="GetInMotion" 
        className={`${sizeClasses[size]} w-auto transition-transform duration-200 hover:scale-105`}
      />
    </a>
  );
};
