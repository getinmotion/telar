import React from 'react';
import { cn } from '@/lib/utils';
import { useShopTheme } from '@/contexts/ShopThemeContext';

interface ShopSectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'none' | 'subtle' | 'gradient';
  id?: string;
}

export const ShopSection: React.FC<ShopSectionProps> = ({
  children,
  className,
  background = 'none',
  id
}) => {
  const { getPrimaryColor } = useShopTheme();

  const getBackgroundStyle = () => {
    const primaryColor = getPrimaryColor(0);
    
    switch (background) {
      case 'subtle':
        return {
          backgroundColor: `${primaryColor}08`
        };
      case 'gradient':
        return {
          background: `linear-gradient(to bottom, ${primaryColor}05, transparent)`
        };
      default:
        return {};
    }
  };

  return (
    <section
      id={id}
      className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}
      style={getBackgroundStyle()}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
};
