import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShopTheme } from '@/contexts/ShopThemeContext';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

interface ModernHeroSliderProps {
  slides: HeroSlide[];
  autoplay?: boolean;
  duration?: number;
  brandClaim?: string;
  variant?: 'full' | 'compact';
}

export const ModernHeroSlider: React.FC<ModernHeroSliderProps> = ({
  slides,
  autoplay = true,
  duration = 5000,
  brandClaim,
  variant = 'full'
}) => {
  const { getOverlayGradient, getPrimaryColor } = useShopTheme();
  const heightClass = variant === 'compact' 
    ? 'h-[300px] md:h-[350px]' 
    : 'h-[400px] md:h-[450px] lg:h-[500px]';
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    autoplay ? [Autoplay({ delay: duration, stopOnInteraction: false })] : []
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Asegurar que el primer slide sea visible al montar
  useEffect(() => {
    if (emblaApi && selectedIndex === 0) {
      // Forzar re-render después de que Embla se monte
      const timer = setTimeout(() => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [emblaApi]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden`}>
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="relative flex-[0_0_100%] min-w-0 h-full"
              style={{
                opacity: selectedIndex === index ? 1 : 0.3,
                transition: 'opacity 0.8s ease-out',
                pointerEvents: selectedIndex === index ? 'auto' : 'none'
              }}
            >
              {/* Background Image - z-0 */}
              <img
                src={slide.image}
                alt={slide.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover z-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />

              {/* Gradient Overlay - z-10 */}
              <div
                className="absolute inset-0 z-10"
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.6) 100%)' 
                }}
              />

              {/* Content - z-20 */}
              <div className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="text-white max-w-4xl text-center md:text-left p-8">
                  {brandClaim && index === 0 && (
                    <p className="text-base md:text-lg mb-3 font-light opacity-90">
                      {brandClaim}
                    </p>
                  )}
                  
                  <h1 
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
                    style={{ 
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                    }}
                  >
                    {slide.title}
                  </h1>
                  
                  <p 
                    className="text-base md:text-lg lg:text-xl mb-6 font-light opacity-95 max-w-2xl"
                    style={{ 
                      textShadow: '0 1px 6px rgba(0,0,0,0.8)' 
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {slide.ctaText && slide.ctaLink && (
                    <a
                      href={slide.ctaLink}
                      className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-2xl text-base border-2 border-white/50"
                      style={{
                        textShadow: 'none',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                      }}
                    >
                      {slide.ctaText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <motion.button
            onClick={scrollPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl"
            aria-label="Previous slide"
            whileHover={{ scale: 1.1, x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
          
          <motion.button
            onClick={scrollNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl"
            aria-label="Next slide"
            whileHover={{ scale: 1.1, x: 4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </motion.button>
        </>
      )}

      {/* Enhanced Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`rounded-full transition-all duration-300 ${
                index === selectedIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
