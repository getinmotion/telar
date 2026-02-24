import React from 'react';
import { cn } from '@/lib/utils';
import { useShopTheme } from '@/contexts/ShopThemeContext';
import { motion } from 'framer-motion';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className,
  ...props
}) => {
  const { getPrimaryColor, getSecondaryColor } = useShopTheme();

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-300';

  const getVariantStyle = () => {
    const primaryColor = getPrimaryColor(0);
    const secondaryColor = getSecondaryColor(0);

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryColor,
          color: 'white',
          boxShadow: `0 4px 14px 0 ${primaryColor}40`
        };
      case 'secondary':
        return {
          backgroundColor: secondaryColor,
          color: 'white',
          boxShadow: `0 4px 14px 0 ${secondaryColor}40`
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: primaryColor,
          border: `2px solid ${primaryColor}`
        };
    }
  };

  if (href) {
    return (
      <motion.a
        href={href}
        className={cn(baseClasses, sizeClasses[size], className)}
        style={getVariantStyle()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={cn(baseClasses, sizeClasses[size], className)}
      style={getVariantStyle()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type}
    >
      {children}
    </motion.button>
  );
};
