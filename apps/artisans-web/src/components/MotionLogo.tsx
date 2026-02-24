
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logoIcon from '@/assets/logo-icon.svg';
import logoHorizontal from '@/assets/logo-horizontal.svg';
import logoVertical from '@/assets/logo-vertical.svg';

interface MotionLogoProps {
  variant?: 'auto' | 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MotionLogo: React.FC<MotionLogoProps> = ({ 
  variant = 'auto', 
  className = '',
  size = 'md'
}) => {
  const { user } = useAuth();
  
  // Select logo variant based on size
  const logoSrc = size === 'sm' ? logoIcon : logoHorizontal;
  
  // Set size based on prop
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-16 w-auto'
  };
  
  // Navigate to dashboard if authenticated, otherwise to home
  const targetRoute = user ? '/dashboard' : '/';
  
  return (
    <Link to={targetRoute} className={`inline-flex items-center ${className}`}>
      <img 
        src={logoSrc}
        alt="TELAR Logo" 
        className={`${sizeClasses[size]} hover:scale-105 transition-transform duration-200`}
      />
    </Link>
  );
};
