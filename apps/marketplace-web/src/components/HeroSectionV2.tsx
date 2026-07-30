/**
 * HeroSectionV2 Component
 * Tres slides construidos con datos reales, uno de cada tipo:
 * un taller, una pieza y una categoría, elegidos al azar en cada carga.
 */

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { getFeaturedShops } from "@/services/artisan-shops.actions";
import {
  getProductsNew,
  getPrimaryImageUrl,
  type ProductFeatured,
} from "@/services/products-new.actions";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  body: string;
  image: string | null;
  origin: string | null;
  ctaLabel: string;
  ctaHref: string;
}

/** Elemento al azar; null si la lista viene vacía. */
const pickRandom = <T,>(list: T[]): T | null =>
  list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;

/** Parte un nombre en dos líneas para el titular a dos tonos. */
const splitTitle = (name: string): { title: string; subtitle: string } => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return { title: words[0], subtitle: "" };
  const cut = Math.ceil(words.length / 2);
  return {
    title: words.slice(0, cut).join(" "),
    subtitle: words.slice(cut).join(" "),
  };
};

export const HeroSectionV2 = () => {
  const { categoryHierarchy } = useTaxonomy();
  const [products, setProducts] = useState<ProductFeatured[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getProductsNew({ page: 1, limit: 60 })
        .then((res) => (Array.isArray(res) ? res : (res.data ?? [])))
        .catch(() => []),
      getFeaturedShops(12).catch(() => []),
    ])
      .then(([prods, shopList]) => {
        if (cancelled) return;
        setProducts(prods as ProductFeatured[]);
        setShops(shopList);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo<HeroSlide[]>(() => {
    const out: HeroSlide[] = [];

    // ── Taller al azar ──
    const shop = pickRandom(shops.filter((s) => s.bannerUrl || s.logoUrl));
    if (shop) {
      const { title, subtitle } = splitTitle(shop.shopName);
      out.push({
        id: `shop-${shop.id}`,
        kicker: "Taller artesanal",
        title,
        subtitle,
        body:
          shop.description?.trim() ||
          "Un taller que mantiene vivo su oficio y su territorio.",
        image: shop.bannerUrl || shop.logoUrl,
        origin: [shop.municipality || shop.region, shop.department]
          .filter(Boolean)
          .join(", "),
        ctaLabel: "Conocer el taller",
        ctaHref: `/tienda/${shop.shopSlug}`,
      });
    }

    // ── Pieza al azar ──
    const product = pickRandom(products.filter((p) => getPrimaryImageUrl(p)));
    if (product) {
      const { title, subtitle } = splitTitle(product.name || "Pieza artesanal");
      out.push({
        id: `product-${product.id}`,
        kicker: "Una pieza",
        title,
        subtitle,
        body:
          product.shortDescription?.trim() ||
          "Hecha a mano, con su origen y su proceso documentados.",
        image: getPrimaryImageUrl(product),
        origin: [product.storeName, product.department]
          .filter(Boolean)
          .join(" · "),
        ctaLabel: "Ver la pieza",
        ctaHref: `/product/${product.id}`,
      });
    }

    // ── Categoría al azar, solo entre las que tienen piezas ──
    const withProducts = categoryHierarchy.filter((c) => {
      if (!c.isActive) return false;
      const ids = new Set<string>([c.id, ...c.subcategories.map((s) => s.id)]);
      return products.some((p) => ids.has((p as any).categoryId));
    });
    const category = pickRandom(withProducts);
    if (category) {
      const { title, subtitle } = splitTitle(category.name);
      const ids = new Set<string>([
        category.id,
        ...category.subcategories.map((s) => s.id),
      ]);
      const sample = products.filter((p) => ids.has((p as any).categoryId));
      out.push({
        id: `category-${category.id}`,
        kicker: "Explorar categoría",
        title,
        subtitle,
        body: `${sample.length} ${sample.length === 1 ? "pieza" : "piezas"} de talleres artesanales de Colombia.`,
        image:
          category.imageUrl ||
          (sample.length > 0 ? getPrimaryImageUrl(sample[0]) : null),
        origin: null,
        ctaLabel: "Explorar categoría",
        ctaHref: `/productos?categoria=${category.slug}`,
      });
    }

    return out;
  }, [products, shops, categoryHierarchy]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
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

  // El carrusel debe recalcular cuando los slides llegan después del montaje.
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, slides.length]);

  if (loading) {
    return (
      <section className="w-full bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mx-[4%]">
            <div className="flex flex-col gap-6">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-11 w-48" />
            </div>
            <Skeleton className="h-[250px] md:h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="w-full bg-background relative">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide) => (
              <div key={slide.id} className="relative flex-[0_0_100%] min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mx-[4%]">
                  {/* Columna 1: texto */}
                  <div className="flex flex-col gap-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                      {slide.kicker}
                    </span>

                    <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-2 text-charcoal tracking-tight">
                      {slide.title}
                      {slide.subtitle && (
                        <>
                          <br />
                          <span className="italic text-primary">
                            {slide.subtitle}
                          </span>
                        </>
                      )}
                    </h1>

                    <p className="text-sm md:text-base text-charcoal/70 font-sans font-light leading-relaxed line-clamp-4">
                      {slide.body}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                      <Link to={slide.ctaHref}>
                        <Button
                          size="lg"
                          className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
                        >
                          {slide.ctaLabel}
                        </Button>
                      </Link>
                      <Link to="/productos">
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full sm:w-auto border-2"
                        >
                          Explorar piezas
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Columna 2: imagen */}
                  <div className="flex flex-col gap-4">
                    <div className="relative rounded-lg overflow-hidden shadow-2xl h-[250px] md:h-[400px] bg-muted">
                      {slide.image && (
                        <img
                          src={slide.image}
                          alt={`${slide.title} ${slide.subtitle}`.trim()}
                          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                        />
                      )}
                    </div>
                    {slide.origin && (
                      <p className="text-sm font-semibold text-primary uppercase tracking-wide px-2">
                        {slide.origin}
                      </p>
                    )}
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
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#1a1a1a] w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente slide"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#1a1a1a] w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
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
