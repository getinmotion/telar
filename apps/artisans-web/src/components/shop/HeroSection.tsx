import React from 'react';
import { LazyImage } from './LazyImage';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundImage
}) => {
  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      <LazyImage
        src={backgroundImage}
        alt="Hero background"
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-light mb-4 tracking-wide">
            {title}
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};