import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import slidePottery from '@/assets/login-slide-pottery.png';
import slideBasketry from '@/assets/login-slide-basketry.png';
import slideWeaving from '@/assets/login-slide-weaving.png';
import slideJewelry from '@/assets/login-slide-jewelry.png';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

// Preload the first slide image for LCP optimization
const preloadFirstImage = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = slidePottery;
  link.fetchPriority = 'high';
  document.head.appendChild(link);
};

// Execute preload immediately on module load
if (typeof window !== 'undefined') {
  preloadFirstImage();
}
const onboardingSlides = [
  {
    step: 1,
    title: "Crea tu tienda en minutos",
    subtitle: "Sin conocimientos técnicos necesarios",
    image: slidePottery
  },
  {
    step: 2,
    title: "IA que entiende tu arte",
    subtitle: "Genera descripciones y precios automáticamente",
    image: slideBasketry
  },
  {
    step: 3,
    title: "Gestiona tu inventario",
    subtitle: "Control total de tus productos y materiales",
    image: slideWeaving
  },
  {
    step: 4,
    title: "Crece con TELAR",
    subtitle: "Herramientas diseñadas para artesanos",
    image: slideJewelry
  }
];

export const LoginOnboardingSlider = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="w-full h-full rounded-[24px] overflow-hidden relative">
      <Carousel
        setApi={setApi}
        className="w-full h-full"
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true
          }) as any,
        ]}
      >
        <CarouselContent className="-ml-0 h-full">
          {onboardingSlides.map((slide, index) => (
            <CarouselItem key={index} className="pl-0 h-full">
              <div className="h-full w-full relative">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt=""
                    role="presentation"
                    width={744}
                    height={1024}
                    className="w-full h-full object-cover"
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding={index === 0 ? "sync" : "async"}
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                  <h2 className="text-[34px] font-bold text-white mb-4 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-[17px] text-white/90 drop-shadow">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {onboardingSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                current === index 
                  ? "bg-white w-6" 
                  : "bg-white/50 hover:bg-white/70 w-2"
              )}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>

        <CarouselPrevious className="left-4 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 h-10 w-10" />
        <CarouselNext className="right-4 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 h-10 w-10" />
      </Carousel>
    </div>
  );
};
