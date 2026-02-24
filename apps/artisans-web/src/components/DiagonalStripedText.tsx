import React from 'react';

interface DiagonalStripedTextProps {
  text: string;
  imageSrc: string;
  className?: string;
}

export const DiagonalStripedText: React.FC<DiagonalStripedTextProps> = ({
  text,
  imageSrc,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Base text layer - solid black */}
      <h1 
        className="text-7xl sm:text-8xl md:text-8xl lg:text-9xl font-black text-foreground leading-[0.85] tracking-tight"
        style={{ position: 'relative' }}
      >
        {text}
      </h1>
      
      {/* Image text layer with diagonal stripes mask */}
      <h1 
        className="absolute inset-0 text-7xl sm:text-8xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tight"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          maskImage: 'repeating-linear-gradient(-25deg, transparent, transparent 12px, black 12px, black 24px)',
          WebkitMaskImage: 'repeating-linear-gradient(-25deg, transparent, transparent 12px, black 12px, black 24px)',
        }}
      >
        {text}
      </h1>
    </div>
  );
};
