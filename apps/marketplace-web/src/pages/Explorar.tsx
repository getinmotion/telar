/**
 * Explorar — Editorial discovery landing page
 * Route: /explorar
 * Gateway to browse by Category, Technique, or Territory before the product grid.
 */

import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { Footer } from "@/components/Footer";
import explorarCategoriasImg from "@/assets/explorar-categorias.png";
import explorarTecnicasImg from "@/assets/explorar-tecnicas.png";
import explorarTerritoriosImg from "@/assets/explorar-territorios.png";

/* ── helpers ─────────────────────────────────────────── */
const Arrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  </svg>
);

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
    />
  </svg>
);

/* ── component ───────────────────────────────────────── */
const Explorar = () => {
  const { categoryHierarchy, techniques, loading: taxLoading } = useTaxonomy();
  const { shops, fetchFeaturedShops } = useArtisanShops();

  useEffect(() => {
    fetchFeaturedShops(4);
  }, []);

  // 1. Validamos que sean arreglos reales. Si no lo son, asignamos un arreglo vacío []
  const safeCategories = Array.isArray(categoryHierarchy) ? categoryHierarchy : [];
  const safeTechniques = Array.isArray(techniques) ? techniques : [];
  const safeShops = Array.isArray(shops) ? shops : [];

  // 2. Ahora hacemos los recortes de forma 100% segura
  const topCategories = safeCategories.slice(0, 3);
  const topTechniques = safeTechniques.slice(0, 3);
  const featuredShops = safeShops.slice(0, 4);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f7f2", color: "#1b1c19" }}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 py-20 text-center">
        <span
          className="font-bold uppercase tracking-[0.5em] text-[10px] block mb-6"
          style={{ color: "hsl(var(--primary))" }}
        >
          Explorar
        </span>
        <h1
          className="font-serif text-5xl md:text-6xl italic mb-6"
          style={{ letterSpacing: "-0.04em", color: "#1b1c19" }}
        >
          Descubre el universo artesanal
        </h1>
        <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-80" style={{ color: "#584237" }}>
          Explora la artesanía colombiana a través de sus categorías, técnicas y territorios.
        </p>
      </section>

      {/* ═══════════════ PRIMARY ENTRY POINTS ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Por Categoría */}
          <Link to="/categorias" className="group cursor-pointer block">
            <div
              className="aspect-[4/5] mb-6 overflow-hidden relative"
              style={{ backgroundColor: "#e5e1d8" }}
            >
              <img
                src={explorarCategoriasImg}
                alt="Explorar por Categoría"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            </div>
            <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: "rgba(27,28,25,0.1)" }}>
              <div>
                <h2 className="font-serif text-2xl italic">Por Categoría</h2>
                <p className="text-xs mt-1 mb-2 font-light italic" style={{ color: "#584237" }}>
                  Descubre por tipo de producto
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {topCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categoria/${cat.slug}`}
                      className="text-[10px] uppercase tracking-widest hover:text-primary transition-colors"
                      style={{ color: "rgba(27,28,25,0.4)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {topCategories.length === 0 && (
                    <>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Textiles</span>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Joyería</span>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Hogar</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-primary group-hover:translate-x-1 transition-transform mt-1">
                <Arrow />
              </span>
            </div>
          </Link>

          {/* Por Técnica */}
          <Link to="/tecnicas" className="group cursor-pointer block">
            <div
              className="aspect-[4/5] mb-6 overflow-hidden relative"
              style={{ backgroundColor: "#e5e1d8" }}
            >
              <img
                src={explorarTecnicasImg}
                alt="Explorar por Técnica"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            </div>
            <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: "rgba(27,28,25,0.1)" }}>
              <div>
                <h2 className="font-serif text-2xl italic">Por Técnica</h2>
                <p className="text-xs mt-1 mb-2 font-light italic" style={{ color: "#584237" }}>
                  Explora tradiciones artesanales
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {topTechniques.map((tech) => {
                    const techSlug = tech.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    return (
                      <Link
                        key={tech.id}
                        to={`/tecnica/${techSlug}`}
                        className="text-[10px] uppercase tracking-widest hover:text-primary transition-colors"
                        style={{ color: "rgba(27,28,25,0.4)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tech.name}
                      </Link>
                    );
                  })}
                  {topTechniques.length === 0 && (
                    <>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Tejeduría</span>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Cerámica</span>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Orfebrería</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-primary group-hover:translate-x-1 transition-transform mt-1">
                <Arrow />
              </span>
            </div>
          </Link>

          {/* Por Territorio */}
          <Link to="/territorios" className="group cursor-pointer block">
            <div
              className="aspect-[4/5] mb-6 overflow-hidden relative"
              style={{ backgroundColor: "#e5e1d8" }}
            >
              <img
                src={explorarTerritoriosImg}
                alt="Explorar por Territorio"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            </div>
            <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: "rgba(27,28,25,0.1)" }}>
              <div>
                <h2 className="font-serif text-2xl italic">Por Territorio</h2>
                <p className="text-xs mt-1 mb-2 font-light italic" style={{ color: "#584237" }}>
                  Enraizado en su origen
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Boyacá</span>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>La Guajira</span>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(27,28,25,0.4)" }}>Nariño</span>
                </div>
              </div>
              <span className="text-primary group-hover:translate-x-1 transition-transform mt-1">
                <Arrow />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════ GUIDED DISCOVERY ═══════════════ */}
      {/* <section className="mb-32">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-6 items-center p-6" style={{ backgroundColor: "#f5f3ee" }}>
              <div className="w-1/3">
                <div className="aspect-square" style={{ backgroundColor: "#e5e1d8" }} />
              </div>
              <div className="w-2/3">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[8px] block mb-2">
                  Editorial
                </span>
                <h2 className="font-serif text-2xl mb-2 italic">Piezas Únicas</h2>
                <p className="text-[11px] leading-relaxed mb-4 font-light italic" style={{ color: "#584237" }}>
                  Objetos irrepetibles para coleccionistas de historias.
                </p>
                <Link
                  to="/productos"
                  className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-primary hover:gap-3 transition-all"
                >
                  Explorar <Arrow />
                </Link>
              </div>
            </div>

            <div className="flex gap-6 items-center p-6" style={{ backgroundColor: "#f5f3ee" }}>
              <div className="w-1/3">
                <div className="aspect-square" style={{ backgroundColor: "#e5e1d8" }} />
              </div>
              <div className="w-2/3">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[8px] block mb-2">
                  Selección
                </span>
                <h2 className="font-serif text-2xl mb-2 italic">Regalos con Historia</h2>
                <p className="text-[11px] leading-relaxed mb-4 font-light italic" style={{ color: "#584237" }}>
                  Curaduría especial para momentos que merecen perdurar.
                </p>
                <Link
                  to="/giftcards"
                  className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-primary hover:gap-3 transition-all"
                >
                  Ver Guía <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* ═══════════════ FEATURED WORKSHOPS ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 mb-32">
        <div className="flex justify-between items-end mb-12 border-b pb-6" style={{ borderColor: "rgba(27,28,25,0.05)" }}>
          <h2 className="font-serif text-3xl italic">Talleres Destacados</h2>
          <Link
            to="/tiendas"
            className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 group"
          >
            Ver todos los talleres
            <span className="group-hover:translate-x-1 transition-transform">
              <Arrow />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {featuredShops.length > 0
            ? featuredShops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`/artesano/${shop.shopSlug || shop.id}`}
                  className="group"
                >
                  <div
                    className="aspect-square mb-6 overflow-hidden relative"
                    style={{ backgroundColor: "#e5e1d8" }}
                  >
                    {shop.logoUrl ? (
                      <img
                        src={shop.logoUrl}
                        alt={shop.shopName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : shop.bannerUrl ? (
                      <img
                        src={shop.bannerUrl}
                        alt={shop.shopName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-black/5 group-hover:scale-105 transition-transform duration-700" />
                    )}
                  </div>
                  <span className="text-primary font-bold uppercase tracking-widest text-[9px] mb-2 block">
                    {shop.department || shop.region || "Colombia"} {shop.craftType ? `· ${shop.craftType}` : ""}
                  </span>
                  <h4 className="font-serif text-xl group-hover:text-primary transition-colors">
                    {shop.shopName}
                  </h4>
                  {shop.description && (
                    <p className="text-xs mt-2 font-light italic" style={{ color: "#584237" }}>
                      {shop.description.length > 90
                        ? shop.description.slice(0, 90) + "..."
                        : shop.description}
                    </p>
                  )}
                </Link>
              ))
            : /* Placeholder cards while loading */
              [...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-square mb-6 animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                  <div className="h-3 w-24 mb-2 rounded animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                  <div className="h-5 w-40 rounded animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                </div>
              ))}
        </div>
      </section>

      {/* ═══════════════ CULTURAL STORY BLOCK ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 mb-32">
        <div
          className="overflow-hidden flex flex-col md:flex-row items-stretch min-h-[300px]"
          style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
        >
          <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
            <span className="text-primary font-extrabold tracking-[0.5em] uppercase mb-4 text-[9px] block">
              Crónica del Mes
            </span>
            <h2 className="font-serif text-3xl italic mb-4" style={{ letterSpacing: "-0.04em" }}>
              Tejeduría de San Jacinto
            </h2>
            <p className="text-base leading-relaxed font-light italic mb-8 max-w-md" style={{ color: "rgba(255,255,255,0.7)" }}>
              En los Montes de María, las hamacas son lienzos donde se narra la resiliencia y la paz de un territorio.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/productos"
                className="px-6 py-3 text-[9px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-[#1a1a1a] transition-all"
                style={{ backgroundColor: "hsl(var(--primary))", color: "#fff" }}
              >
                Ver piezas
              </Link>
              <Link
                to="/historias"
                className="flex items-center gap-2 hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <BookIcon />
                <span className="text-[8px] uppercase tracking-widest font-bold">Leer Crónica</span>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative" style={{ backgroundColor: "rgba(27,28,25,0.2)" }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-6xl font-black tracking-tighter" style={{ color: "rgba(255,255,255,0.05)" }}>
                ORIGEN
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-24 text-center bg-white border-t" style={{ borderColor: "rgba(27,28,25,0.05)" }}>
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="font-serif text-3xl mb-8 italic">¿Buscas algo específico?</h2>
          <Link to="/productos" className="group inline-flex items-center gap-6">
            <span
              className="text-lg font-light border-b pb-1 group-hover:border-primary transition-colors"
              style={{ borderColor: "rgba(27,28,25,0.2)" }}
            >
              Ver catálogo completo del marketplace
            </span>
            <span className="text-primary group-hover:translate-x-3 transition-transform">
              <Arrow />
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explorar;
