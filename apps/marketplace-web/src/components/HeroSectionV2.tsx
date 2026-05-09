/**
 * HeroSectionV2 Component
 * Hero con diseño de 2 columnas y slider/carrusel
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Slides del hero (basados en FALLBACK_SLIDES de HeroCarousel)
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  origin: string;
  quote: string;
  action?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "1",
    title: "HISTORIAS HECHAS",
    subtitle: "A MANO",
    image: "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/marketplace-home/telar_cat_v%20(4).png",
    origin: "Nariño, Colombia",
    quote: "Cada puntada es un susurro de nuestros ancestros.",
  },
  // {
  //   id: "2",
  //   title: "TRADICIÓN",
  //   subtitle: "COLOMBIANA",
  //   image: "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/marketplace-home/artesanias_de_colombia.png",
  //   origin: "Bogotá, Colombia",
  //   quote: "El arte de crear con las manos nunca muere.",
  // },
  {
    id: "2",
    title: "ARTESANÍA",
    subtitle: "AUTÉNTICA",
    image: "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/images/1766278723378_0_WhatsApp_Image_2025-08-08_at_3.29.32_PM.jpeg.jpeg",
    origin: "Valle del Cauca, Colombia",
    quote: "Cada pieza cuenta una historia única.",
  },
    {
    id: "3",
    title: "COLECCIÓN",
    subtitle: "DÍA DE LAS MADRES",
    image: "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/images/1765405865051_0_IMG-20251206-WA0004.jpg.jpg",
    origin: "Corregimiento La Mina, Cesar, Colombia",
    quote: "Cada pieza cuenta una historia única.",
    action: '/coleccion/dia-de-la-madre'
  },
];

export const HeroSectionV2 = () => {
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

  return (
    <section className="w-full bg-background relative">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Carrusel */}
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="relative flex-[0_0_100%] min-w-0"
              >
                {/* Grid de 2 columnas con margin lateral del 4% */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mx-[4%]">
                  {/* Columna 1: Contenido de texto */}
                  <div className="flex flex-col gap-6">
                    {/* Título principal */}
                    <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight">
                      {slide.title} <br />
                      <span className="italic text-primary">{slide.subtitle}</span>
                    </h1>

                    {/* Descripción principal */}
                    <p className="text-sm md:text-base text-charcoal/70 font-sans font-light leading-relaxed">
                      Objetos auténticos creados por talleres artesanales de Colombia.
                      Cada pieza conserva la historia, el origen y el conocimiento de
                      quienes la crean.
                    </p>

                    {/* Subtítulo light */}
                    <p className="text-sm md:text-base text-muted-foreground font-light tracking-wide uppercase">
                      Hecho a mano por talleres artesanales de Colombia.
                    </p>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      {slide.action ? (
                        <Link to={slide.action}>
                          <Button
                            size="lg"
                            className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
                          >
                            Explorar Colección
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Link to="/productos">
                            <Button
                              size="lg"
                              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
                            >
                              Explorar Piezas
                            </Button>
                          </Link>
                          <Link to="/tiendas">
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full sm:w-auto border-2"
                            >
                              Conocer Talleres
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Columna 2: Imagen y etiquetas */}
                  <div className="flex flex-col gap-4">
                    {/* Imagen con transición */}
                    <div className="relative rounded-lg overflow-hidden shadow-2xl h-[250px] md:h-[400px]">
                      <img
                        src={slide.image}
                        alt={`${slide.title} - Artesanía colombiana`}
                        className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    {/* Etiquetas debajo de la imagen */}
                    <div className="flex flex-col gap-2 px-2">
                      {/* Origen */}
                      <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                        Origen: {slide.origin}
                      </p>

                      {/* Frase en cursiva */}
                      <p className="text-lg md:text-xl font-serif italic text-foreground/80">
                        "{slide.quote}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles del carrusel */}
        {HERO_SLIDES.length > 1 && (
          <>
            {/* Botones de navegación */}
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

            {/* Indicadores de puntos */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {HERO_SLIDES.map((_, i) => (
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
};
