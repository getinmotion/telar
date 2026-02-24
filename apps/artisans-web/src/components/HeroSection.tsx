import React from 'react';
import { heroTranslations } from './hero/heroTranslations';
import { FeatureCards } from './hero/FeatureCards';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import artisanHero from '@/assets/artisan-hero.png';
import { DiagonalStripedText } from './DiagonalStripedText';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface HeroSectionProps {
  language: 'en' | 'es';
}

export const HeroSection = ({ language }: HeroSectionProps) => {
  const t = heroTranslations[language];

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  // Slides configuration - Zeroo style
  const slides = [
    {
      tagline: 'Empieza ahora, sorpréndete',
      title: 'Haz Crecer Tu Oficio Artesanal',
      subtitle: 'Herramientas digitales pensadas para artesanos como tú',
      cta: 'Únete Ahora',
      image: artisanHero,
    },
    {
      tagline: 'Crece con confianza',
      title: 'Gestiona Tu Negocio Artesanal',
      subtitle: 'Todo en un solo lugar, simple y poderoso',
      cta: 'Comienza Ahora',
      image: artisanHero,
    },
    {
      tagline: 'Tu éxito, nuestra misión',
      title: 'Lleva Tu Arte Al Siguiente Nivel',
      subtitle: 'Conecta con clientes y haz crecer tu comunidad',
      cta: 'Descubre Más',
      image: artisanHero,
    },
  ];

  return (
    <div className="w-full relative overflow-hidden">
      {/* Artisan Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-40 pointer-events-none" />
      
      {/* Hero Carousel */}
      <div className="relative w-full h-[65vh] lg:h-[75vh]">
        <Carousel
          plugins={[plugin.current]}
          className="w-full h-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-[65vh] lg:h-[75vh]">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-[65vh] lg:h-[75vh]">
                <div className="relative w-full h-[65vh] lg:h-[75vh]">
                  {/* Layer 1: Background Image - Full Width */}
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={slide.image}
                      alt="Artesana trabajando con dedicación y maestría"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>
                  
                  {/* Layer 2: Artisan Overlay with Content */}
                  <div 
                    className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-primary flex items-center justify-center px-6 md:px-12 lg:px-20 z-10"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 90% 30%, 85% 70%, 100% 100%, 0 100%)'
                    }}
                  >
                    <div className="max-w-2xl text-center lg:text-left space-y-6">
                      {/* Tagline with artisan badge */}
                      <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-full px-4 py-2 border border-border/20">
                        <span className="text-xs md:text-sm font-semibold text-primary-foreground tracking-wider uppercase">
                          ✨ {slide.tagline}
                        </span>
                      </div>
                      
                      {/* Main headline - Artisan style */}
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight drop-shadow-lg">
                        {slide.title}
                      </h1>
                      
                      {/* Subtitle */}
                      <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/95 font-light leading-relaxed">
                        {slide.subtitle}
                      </p>
                      
                      {/* CTA Button - Artisan style */}
                      <div className="flex justify-center lg:justify-start mt-8 gap-4">
                        <Button 
                          asChild
                          className="bg-background text-primary hover:bg-primary-subtle hover:text-primary-foreground px-8 py-6 text-base md:text-lg rounded-full shadow-elegant hover:shadow-hover transition-all duration-300 hover:scale-105"
                        >
                          <a href="#product-explanation">
                            {slide.cta}
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </a>
                        </Button>
                      </div>
                      
                      {/* Artisan decoration element */}
                      <div className="hidden lg:block absolute bottom-8 left-0 w-32 h-1 bg-background/30 rounded-full" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Controls - Artisan style */}
          <div className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12 flex gap-3 z-20">
            <CarouselPrevious className="static translate-y-0 bg-background/90 backdrop-blur-sm hover:bg-background border border-primary/20 text-primary shadow-card hover:shadow-hover transition-all" />
            <CarouselNext className="static translate-y-0 bg-background/90 backdrop-blur-sm hover:bg-background border border-primary/20 text-primary shadow-card hover:shadow-hover transition-all" />
          </div>
        </Carousel>
      </div>
      
      {/* Feature Cards Section - Artisan design */}
      <div className="w-full py-16 md:py-24 bg-gradient-subtle" id="product-explanation" data-section="value-proposition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Artisan style */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
              {t.whatIsMotion}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t.motionDescription}
            </p>
          </div>
          
          <FeatureCards 
            motionPurpose={t.motionPurpose}
            creativePlatform={t.creativePlatform}
            creativePlatformDesc={t.creativePlatformDesc}
            businessSuite={t.businessSuite}
            businessSuiteDesc={t.businessSuiteDesc}
            timeProtector={t.timeProtector}
            timeProtectorDesc={t.timeProtectorDesc}
            growthPartner={t.growthPartner}
            growthPartnerDesc={t.growthPartnerDesc}
          />
        </div>
      </div>
    </div>
  );
};