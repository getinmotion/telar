/**
 * CmsHeroCarousel — Hero del homepage con embla, slides editables vía CMS.
 *
 * Lifted del antiguo HeroSectionV2 — toma todo el contenido por props desde
 * el payload de la sección `home_hero_carousel`.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroCarouselSlide {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  origin?: string;
  quote?: string;
}

export interface CmsHeroCarouselProps {
  description?: string;
  tagline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  autoplaySeconds?: number;
  slides: HeroCarouselSlide[];
}

export function CmsHeroCarousel({
  description,
  tagline,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  autoplaySeconds = 6,
  slides,
}: CmsHeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: Math.max(2, autoplaySeconds) * 1000, stopOnInteraction: false })],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (!slides || slides.length === 0) return null;

  return (
    <section className="w-full bg-background relative">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="relative flex-[0_0_100%] min-w-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mx-[4%]">
                  {/* Columna 1: texto */}
                  <div className="flex flex-col gap-6">
                    {(slide.title || slide.subtitle) && (
                      <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight">
                        {slide.title}{" "}
                        {slide.subtitle && (
                          <>
                            <br />
                            <span className="italic text-primary">{slide.subtitle}</span>
                          </>
                        )}
                      </h1>
                    )}

                    {description && (
                      <p className="text-sm md:text-base text-charcoal/70 font-sans font-light leading-relaxed">
                        {description}
                      </p>
                    )}

                    {tagline && (
                      <p className="text-sm md:text-base text-muted-foreground font-light tracking-wide uppercase">
                        {tagline}
                      </p>
                    )}

                    {(primaryCtaLabel || secondaryCtaLabel) && (
                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        {primaryCtaLabel && primaryCtaHref && (
                          <Link to={primaryCtaHref}>
                            <Button
                              size="lg"
                              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
                            >
                              {primaryCtaLabel}
                            </Button>
                          </Link>
                        )}
                        {secondaryCtaLabel && secondaryCtaHref && (
                          <Link to={secondaryCtaHref}>
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full sm:w-auto border-2"
                            >
                              {secondaryCtaLabel}
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Columna 2: imagen + meta */}
                  <div className="flex flex-col gap-4">
                    <div className="relative rounded-lg overflow-hidden shadow-2xl h-[250px] md:h-[400px]">
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt={slide.imageAlt || slide.title || "Hero"}
                          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      {slide.origin && (
                        <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                          Origen: {slide.origin}
                        </p>
                      )}
                      {slide.quote && (
                        <p className="text-lg md:text-xl font-serif italic text-foreground/80">
                          "{slide.quote}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Slide anterior"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#2c2c2c] w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente slide"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#2c2c2c] w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir al slide ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1.5 transition-all ${
                    i === selectedIndex
                      ? "w-8 bg-primary"
                      : "w-4 bg-muted-foreground/50 hover:bg-muted-foreground/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
