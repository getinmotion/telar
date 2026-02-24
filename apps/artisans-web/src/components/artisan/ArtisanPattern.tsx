import React from 'react';

interface ArtisanPatternProps {
  className?: string;
  variant?: 'weave' | 'clay' | 'textile' | 'geometric';
  opacity?: number;
}

/**
 * Decorative artisan pattern component for Colombian craftsmanship aesthetic
 */
export const ArtisanPattern: React.FC<ArtisanPatternProps> = ({ 
  className = '', 
  variant = 'weave',
  opacity = 0.1 
}) => {
  const patterns = {
    weave: (
      <svg className={className} style={{ opacity }}>
        <defs>
          <pattern id="weave" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="20" cy="20" r="3" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weave)" />
      </svg>
    ),
    clay: (
      <svg className={className} style={{ opacity }}>
        <defs>
          <pattern id="clay" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="8" fill="currentColor" opacity="0.3" />
            <circle cx="45" cy="45" r="8" fill="currentColor" opacity="0.3" />
            <path d="M0 30q30-15 60 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#clay)" />
      </svg>
    ),
    textile: (
      <svg className={className} style={{ opacity }}>
        <defs>
          <pattern id="textile" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <line x1="0" y1="15" x2="30" y2="15" stroke="currentColor" strokeWidth="1" />
            <line x1="15" y1="0" x2="15" y2="30" stroke="currentColor" strokeWidth="1" />
            <circle cx="15" cy="15" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#textile)" />
      </svg>
    ),
    geometric: (
      <svg className={className} style={{ opacity }}>
        <defs>
          <pattern id="geometric" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M25 0L50 25L25 50L0 25Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="25" cy="25" r="5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geometric)" />
      </svg>
    ),
  };

  return patterns[variant];
};
