
import React from 'react';
import './masonry.css';

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`masonry-grid ${className}`}>
      {children}
    </div>
  );
};
