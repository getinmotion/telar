
import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroSlideProps {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  imageAlt: string;
  onCtaClick: () => void;
  isLastSlide?: boolean;
}

export const HeroSlide: React.FC<HeroSlideProps> = ({
  title,
  subtitle,
  cta,
  image,
  imageAlt,
  onCtaClick,
  isLastSlide = false
}) => {
  const handleCtaClick = () => {
    // If it's the last slide, use the provided onCtaClick (for waitlist)
    if (isLastSlide) {
      onCtaClick();
      return;
    }
    
    // For other slides, scroll to value proposition section (why choose Motion)
    const valuePropositionSection = document.querySelector('[data-section="value-proposition"]') || 
                                   document.getElementById('value-proposition') ||
                                   document.querySelector('.value-proposition');
    
    if (valuePropositionSection) {
      valuePropositionSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: call the original function
      onCtaClick();
    }
  };

  return (
    <div className="w-full py-16 md:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Content */}
          <div className="max-w-xl text-center md:text-left px-4 md:px-0">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 font-serif tracking-tight">
              {title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-indigo-100 mb-6 md:mb-10 leading-relaxed">
              {subtitle}
            </p>
            <div className="flex justify-center md:justify-start">
              <Button 
                size="lg"
                className={`border-none text-base sm:text-lg ${
                  isLastSlide 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                }`}
                onClick={handleCtaClick}
              >
                {cta}
              </Button>
            </div>
          </div>
          
          {/* Image - Seamless Integration */}
          <div className="relative w-full md:w-1/2 mt-8 md:mt-0">
            {/* Main image without container effects */}
            <div className="relative overflow-hidden">
              <img 
                src={image}
                alt={imageAlt}
                className="w-full h-auto object-cover opacity-90"
              />
            </div>
            
            {/* Subtle musical notes decoration with gentle animation */}
            <div className="absolute -top-4 -right-4 text-pink-300/40 text-4xl opacity-60 rotate-12 animate-pulse" style={{animationDuration: '4s'}}>♪</div>
            <div className="absolute top-1/4 -left-6 text-indigo-300/40 text-3xl opacity-50 -rotate-6 animate-pulse" style={{animationDuration: '5s'}}>♫</div>
            <div className="absolute bottom-8 right-3 text-purple-300/40 text-5xl opacity-60 rotate-3 animate-pulse" style={{animationDuration: '6s'}}>♬</div>
            
            {/* Subtle decorative lines - more integrated */}
            <div className="absolute top-8 right-8 w-16 h-0.5 bg-gradient-to-r from-pink-400/20 to-transparent rotate-45"></div>
            <div className="absolute bottom-16 left-3 w-12 h-0.5 bg-gradient-to-r from-indigo-400/20 to-transparent -rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
