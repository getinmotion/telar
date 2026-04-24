import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import {
  getStoryblokImageUrl,
  resolveStoryblokLink,
  type HeroSlide,
} from "@/types/storyblok";

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    _uid: "fallback-1",
    component: "hero_slide",
    title: "Historias hechas a mano",
    subtitle:
      "Objetos auténticos creados por talleres artesanales de Colombia.",
    cta_text: "Explorar piezas",
    cta_link: { linktype: "url", url: "/productos", cached_url: "/productos" },
    image: {
      filename:
        "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/marketplace-home/telar_cat_v%20(4).png",
    },
    overlay_opacity: 30,
  },
];

export function HeroCarousel() {
  const { data, isLoading } = useHeroSlides();
  const slides: HeroSlide[] =
    data && data.length > 0 ? data : isLoading ? [] : FALLBACK_SLIDES;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
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

  if (isLoading && slides.length === 0) {
    return (
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="aspect-[16/9] w-full bg-[#e5e1d8] animate-pulse" />
      </section>
    );
  }

  return (
    <section className="relative max-w-[1400px] mx-auto px-6 py-16">
      <div className="relative overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => {
            const imgUrl = getStoryblokImageUrl(slide.image);
            const href = resolveStoryblokLink(slide.cta_link);
            const overlay = (slide.overlay_opacity ?? 30) / 100;
            const isExternal = /^https?:\/\//i.test(href);

            return (
              <div
                key={slide._uid ?? slide.title}
                className="relative flex-[0_0_100%] min-w-0"
              >
                <div className="relative aspect-[16/9] md:aspect-[21/9] bg-[#e5e1d8] overflow-hidden">
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt={slide.image?.alt || slide.title}
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                    />
                  )}
                  <div
                    className="absolute inset-0 bg-[#2c2c2c]"
                    style={{ opacity: overlay }}
                  />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-[1400px] w-full mx-auto px-8 md:px-16">
                      <div className="max-w-2xl space-y-6 text-white">
                        <h1 className="text-5xl md:text-7xl leading-[0.95] font-serif italic">
                          {slide.title}
                        </h1>
                        {slide.subtitle && (
                          <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.cta_text &&
                          (isExternal ? (
                            <a
                              href={href}
                              target={slide.cta_link?.target ?? "_self"}
                              rel="noopener noreferrer"
                              className="inline-block bg-white text-[#2c2c2c] px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#ec6d13] hover:text-white transition-colors"
                            >
                              {slide.cta_text}
                            </a>
                          ) : (
                            <Link
                              to={href.startsWith("/") ? href : `/${href}`}
                              className="inline-block bg-white text-[#2c2c2c] px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#ec6d13] hover:text-white transition-colors"
                            >
                              {slide.cta_text}
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#2c2c2c] w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente slide"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#2c2c2c] w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1.5 transition-all ${
                  i === selectedIndex
                    ? "w-8 bg-white"
                    : "w-4 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
