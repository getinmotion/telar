import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

// Fallback images (same as FeaturedCategories)
import joyeriaImg from "@/assets/categories/joyeria.png";
import decoracionImg from "@/assets/categories/decoracion.png";
import textilesImg from "@/assets/categories/textiles.png";
import bolsosImg from "@/assets/categories/bolsos.png";
import vajillasImg from "@/assets/categories/vajillas.png";
import mueblesImg from "@/assets/categories/muebles.png";
import arteImg from "@/assets/categories/arte.png";

const FALLBACK_IMAGES: Record<string, string> = {
  "joyeria-y-accesorios": joyeriaImg,
  "decoracion-del-hogar": decoracionImg,
  "textiles-y-moda": textilesImg,
  "bolsos-y-carteras": bolsosImg,
  "vajillas-y-cocina": vajillasImg,
  muebles: mueblesImg,
  "arte-y-esculturas": arteImg,
  "joyería y accesorios": joyeriaImg,
  "decoración del hogar": decoracionImg,
  "textiles y moda": textilesImg,
  "bolsos y carteras": bolsosImg,
  "vajillas y cocina": vajillasImg,
  "arte y esculturas": arteImg,
};

const BENTO_LAYOUT: Record<string, string> = {
  "joyeria-y-accesorios": "md:col-span-2 md:row-span-2",
  "decoracion-del-hogar": "md:col-span-1 md:row-span-2",
  "textiles-y-moda": "md:col-span-1 md:row-span-2",
  "bolsos-y-carteras": "md:col-span-2 md:row-span-1",
  "vajillas-y-cocina": "md:col-span-2 md:row-span-1",
  muebles: "md:col-span-1 md:row-span-1",
  "arte-y-esculturas": "md:col-span-1 md:row-span-1",
};

function getCategoryImage(cat: {
  slug: string;
  name: string;
  imageUrl: string | null;
}): string {
  if (cat.imageUrl) return cat.imageUrl;
  return (
    FALLBACK_IMAGES[cat.slug] ??
    FALLBACK_IMAGES[cat.name.toLowerCase()] ??
    decoracionImg
  );
}

export default function Categories() {
  const { categoryHierarchy, loading } = useTaxonomy();

  const activeCategories = useMemo(
    () => categoryHierarchy.filter((c) => c.isActive),
    [categoryHierarchy],
  );

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Categorías</span>
        </nav>
      </div>

      {/* Header */}
      <section className="max-w-[1400px] mx-auto px-6 mb-16">
        <div className="py-8 border-b border-charcoal/5">
          <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight">
            EXPLORA POR
            <br />
            <span className="italic text-primary">CATEGORÍA</span>
          </h1>
          <p className="text-sm text-charcoal/70 max-w-lg font-sans leading-relaxed">
            Descubre artesanías colombianas organizadas por su uso y función.
            Cada categoría está curada para ayudarte a encontrar exactamente lo
            que buscas.
          </p>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 md:auto-rows-[200px]">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="aspect-square md:aspect-auto rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 md:auto-rows-[200px]">
            {activeCategories.map((cat) => {
              const imageUrl = getCategoryImage(cat);
              const gridClass =
                BENTO_LAYOUT[cat.slug] || "col-span-1 row-span-1";

              return (
                <Link
                  key={cat.id}
                  to={`/productos?categoria=${cat.slug}`}
                  className={cn(
                    "group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300",
                    "hover:shadow-xl hover:scale-[1.02]",
                    "aspect-square md:aspect-auto",
                    gridClass,
                  )}
                >
                  <div className="absolute inset-0">
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  <div className="relative h-full flex flex-col justify-end p-3 md:p-6 text-white">
                    <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2 line-clamp-2">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-white/60 line-clamp-2 hidden md:block">
                        {cat.description}
                      </p>
                    )}
                    {cat.subcategories.length > 0 && (
                      <p className="text-[10px] text-white/50 mt-2 uppercase tracking-widest font-sans">
                        {cat.subcategories.length} subcategoría
                        {cat.subcategories.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
