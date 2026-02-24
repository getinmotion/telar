
import React from 'react';

interface ModernAgentsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernAgentsGrid: React.FC<ModernAgentsGridProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={`
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        gap-6 
        sm:gap-8 
        auto-rows-max
        w-full
        px-2
        sm:px-0
        ${className}
      `}
    >
      {children}
    </div>
  );
};
