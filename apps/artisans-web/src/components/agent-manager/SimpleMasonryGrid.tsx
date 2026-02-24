
import React from 'react';

interface SimpleMasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

export const SimpleMasonryGrid: React.FC<SimpleMasonryGridProps> = ({
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
        xl:grid-cols-4
        gap-6 
        auto-rows-max
        w-full
        ${className}
      `}
      style={{
        gridAutoFlow: 'dense'
      }}
    >
      {children}
    </div>
  );
};
