import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import heroTextiles from "@/assets/hero-textiles.png";
import heroJewelry from "@/assets/hero-jewelry.png";
import heroCrafts from "@/assets/hero-crafts.png";
import { useParallax } from "@/hooks/useParallax";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { getStoryblokImageUrl, resolveStoryblokLink, HeroSlide } from "@/types/storyblok";

// Fallback slides when CMS content is not available
const FALLBACK_SLIDES = [
  {
    image: heroTextiles,
    title: "Regala Arte Esta Navidad",
    subtitle: "Descubre artesanías únicas hechas a mano",
    cta: "Explorar Colección",
    link: "/productos",
    overlayOpacity: 30
  },
  {
    image: heroJewelry,
    title: "Apoyo Directo a Artesanos",
    subtitle: "Cada compra impacta comunidades locales",
    cta: "Conocer Artesanos",
    link: "/tiendas",
    overlayOpacity: 30
  },
  {
    image: heroCrafts,
    title: "Envíos a Todo el Mundo",
    subtitle: "Arte colombiano hasta tu puerta",
    cta: "Ver Productos",
    link: "/productos",
    overlayOpacity: 30
  }
];

export const HeroSection = () => {
  const parallaxOffset = useParallax(0.5);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  
  const { data: cmsSlides, isLoading } = useHeroSlides();

  // Transform CMS slides to component format or use fallback
  const slides = cmsSlides && cmsSlides.length > 0
    ? cmsSlides.map((slide: HeroSlide) => ({
        image: getStoryblokImageUrl(slide.image, { width: 1920, height: 1080, quality: 85 }) || heroTextiles,
        title: slide.title,
        subtitle: slide.subtitle,
        cta: slide.cta_text,
        link: resolveStoryblokLink(slide.cta_link),
        overlayOpacity: slide.overlay_opacity || 30
      }))
    : FALLBACK_SLIDES;

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (isLoading) {
    return (
      <section className="relative overflow-hidden">
        <Skeleton className="w-full min-h-[400px] lg:min-h-[500px]" />
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative min-h-[400px] lg:min-h-[500px]">
                {/* Background Image with Parallax */}
                <div 
                  className="absolute inset-0 z-0"
                  style={{ transform: `translateY(${parallaxOffset}px)` }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark overlay for text readability */}
                  <div 
                    className="absolute inset-0 bg-black"
                    style={{ opacity: (slide.overlayOpacity || 30) / 100 }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 h-full">
                  <div className="flex flex-col items-center justify-center min-h-[400px] lg:min-h-[500px] text-center">
                    <div className="space-y-8 max-w-4xl">
                      <h1 
                        className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[0.95] animate-fade-in"
                        style={{ animationDelay: '0.2s' }}
                      >
                        {slide.title.split(' ').slice(0, -2).join(' ')}<br />
                        {slide.title.split(' ').slice(-2).join(' ')}
                      </h1>
                      
                      <p 
                        className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in"
                        style={{ animationDelay: '0.4s' }}
                      >
                        {slide.subtitle}
                      </p>

                      {/* Single CTA */}
                      <div 
                        className="animate-fade-in"
                        style={{ animationDelay: '0.6s' }}
                      >
                      <Button 
                          size="lg" 
                          className="px-12 py-6 text-lg h-auto"
                          onClick={() => navigate(slide.link)}
                        >
                          {slide.cta}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
