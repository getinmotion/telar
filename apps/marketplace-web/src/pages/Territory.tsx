/**
 * Territory Detail Page — Editorial design matching reference HTML
 * Route: /territorio/:slug
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { getArtisanShops } from "@/services/artisan-shops.actions";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  getTechniqueName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { ExploreProductCard } from "@/components/ExploreProductCard";
import { formatCurrency } from "@/lib/currencyUtils";
import { Footer } from "@/components/Footer";
import type { ArtisanShop } from "@/types/artisan-shops.types";
import { ArrowRight } from "lucide-react";

/* ── Territory metadata ──────────────────────────────── */
interface TerritoryMeta {
  name: string;
  department: string;
  subtitle: string;
  description: string;
  longDescription: string;
  culturalQuote: string;
  culturalTitle: string;
  ctaHeadline: string;
}

const TERRITORY_DATA: Record<string, TerritoryMeta> = {
  "san-jacinto": {
    name: "San Jacinto, Bolívar",
    department: "Bolivar",
    subtitle: "Cuna de la hamaca y el telar",
    description:
      "Un pilar fundamental del ecosistema TELAR, donde las manos de los artesanos mantienen vivo el diálogo entre la historia de los Montes de María y la tejeduría contemporánea.",
    longDescription:
      "San Jacinto se posiciona como un centro histórico y cultural de la tejeduría en telar en Colombia. Es un territorio donde el oficio trasciende la producción para convertirse en un lenguaje de preservación de la memoria y la identidad local.",
    culturalQuote:
      "Los patrones geométricos de San Jacinto son un eco de la cultura Zenú, representaciones de la naturaleza y del complejo sistema de canales que esta civilización construyó hace siglos.",
    culturalTitle: "Simbolismo en el hilo",
    ctaHeadline: "Descubra la maestría de San Jacinto",
  },
  "la-guajira": {
    name: "La Guajira",
    department: "La Guajira",
    subtitle: "Tejeduría Wayúu y horizontes de arena",
    description:
      "El desierto más septentrional de Sudamérica, donde la comunidad Wayúu transforma hilos en mochilas que cuentan historias ancestrales.",
    longDescription:
      "La Guajira alberga una de las tradiciones textiles más reconocidas internacionalmente. La mochila Wayúu es un símbolo de identidad cultural que ha trascendido fronteras.",
    culturalQuote:
      "Cada mochila Wayúu tarda entre 20 y 30 días en tejerse. Los patrones, llamados Kanás, representan elementos de la naturaleza y la cosmovisión del pueblo Wayúu.",
    culturalTitle: "El lenguaje del Kanás",
    ctaHeadline: "Descubra la maestría de La Guajira",
  },
  boyaca: {
    name: "Boyacá",
    department: "Boyaca",
    subtitle: "Tradición textil del altiplano",
    description:
      "Tierra de lanas y tejidos en el corazón del altiplano cundiboyacense, donde la tradición del hilado manual se transmite de generación en generación.",
    longDescription:
      "Boyacá es reconocido por su tradición textil centenaria, especialmente en municipios como Nobsa e Iza, donde las ruanas y cobijas cuentan la historia del altiplano.",
    culturalQuote:
      "La ruana boyacense no es solo una prenda, es un abrazo de lana virgen que protege del frío del páramo y conecta al artesano con siglos de tradición pastoril.",
    culturalTitle: "La ruana y el páramo",
    ctaHeadline: "Descubra la maestría de Boyacá",
  },
  narino: {
    name: "Nariño",
    department: "Narino",
    subtitle: "Paja toquilla y barniz de Pasto",
    description:
      "En las laderas del sur de Colombia, los artesanos de Nariño dominan técnicas únicas como el barniz de Pasto y el trabajo en paja toquilla.",
    longDescription:
      "Nariño es un territorio de contrastes donde conviven técnicas precolombinas con innovación artesanal. El barniz de Pasto, patrimonio inmaterial, sigue vivo en talleres familiares.",
    culturalQuote:
      "El barniz de Pasto, o Mopa-Mopa, es una resina vegetal que los artesanos mastican, estiran y aplican en capas microscópicas sobre la madera. Un arte que solo existe aquí.",
    culturalTitle: "Mopa-Mopa: resina y paciencia",
    ctaHeadline: "Descubra la maestría de Nariño",
  },
  "la-chamba": {
    name: "La Chamba, Tolima",
    department: "Tolima",
    subtitle: "Barro negro del Río Magdalena",
    description:
      "En las riberas del Magdalena, las manos de La Chamba moldean el barro negro en piezas de cocina y arte que brillan sin esmalte.",
    longDescription:
      "La Chamba es reconocida mundialmente por su cerámica de barro negro. Las piezas se pulen con piedras de río y se cocinan en hornos abiertos, dándoles su brillo característico.",
    culturalQuote:
      "Las ollas de La Chamba no llevan esmalte ni pintura. El brillo negro viene del bruñido con piedra de río y la cocción a fuego abierto con hojarasca. Pura alquimia de tierra.",
    culturalTitle: "Alquimia del barro negro",
    ctaHeadline: "Descubra la maestría de La Chamba",
  },
  putumayo: {
    name: "Putumayo",
    department: "Putumayo",
    subtitle: "Cestería y semillas de la selva",
    description:
      "En la espesura amazónica, las comunidades indígenas del Putumayo transforman fibras y semillas en cestería y ornamentos rituales.",
    longDescription:
      "El Putumayo alberga tradiciones artesanales profundamente conectadas con la selva. La cestería en fibra de chambira y los collares de semillas son expresiones de una cosmovisión viva.",
    culturalQuote:
      "Cada semilla elegida para un collar del Putumayo tiene un nombre, un origen y un propósito. Los artesanos no recolectan al azar: escuchan a la selva antes de tomar.",
    culturalTitle: "La voz de las semillas",
    ctaHeadline: "Descubra la maestría del Putumayo",
  },
};

const ALL_TERRITORIES = Object.keys(TERRITORY_DATA);

/* ── Component ──────────────────────────────────────── */
export default function Territory() {
  const { slug } = useParams<{ slug: string }>();
  const { techniques: allTechniques } = useTaxonomy();
  const [shops, setShops] = useState<ArtisanShop[]>([]);
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [loading, setLoading] = useState(true);

  const territory = slug ? TERRITORY_DATA[slug] : undefined;

  // Fetch shops and products for this territory
  useEffect(() => {
    if (!territory) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [shopsRes, productsRes] = await Promise.all([
          getArtisanShops({
            active: true,
            publishStatus: "published",
            marketplaceApproved: true,
            hasApprovedProducts: true,
            limit: 100,
          }),
          getProductsNew({ page: 1, limit: 500 }),
        ]);

        if (cancelled) return;

        const dept = territory.department.toLowerCase();
        const filteredShops = shopsRes.data.filter(
          (s) =>
            s.department?.toLowerCase().includes(dept) ||
            s.region?.toLowerCase().includes(dept)
        );
        setShops(filteredShops);

        const shopIds = new Set(filteredShops.map((s) => s.id));
        const filteredProducts = productsRes.data.filter((p) =>
          shopIds.has(p.storeId)
        );
        setProducts(filteredProducts);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [slug, territory]);

  // Extract unique techniques
  const territoryTechniques = useMemo(() => {
    const techMap = new Map<string, string>();
    products.forEach((p) => {
      const t = p.artisanalIdentity?.primaryTechnique;
      if (t) techMap.set(t.id, t.name);
      const t2 = p.artisanalIdentity?.secondaryTechnique;
      if (t2) techMap.set(t2.id, t2.name);
    });
    return Array.from(techMap.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Related territories (exclude current)
  const relatedTerritories = ALL_TERRITORIES.filter((t) => t !== slug).slice(0, 3);

  // Not found
  if (!territory) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f9f7f2" }}>
        <div className="text-center">
          <h1 className="font-serif text-4xl italic mb-4">Territorio no encontrado</h1>
          <Link
            to="/territorios"
            className="inline-block px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ backgroundColor: "#2c2c2c" }}
          >
            Ver todos los territorios
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayProducts = products.slice(0, 8);
  const displayShops = shops.slice(0, 4);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f7f2", color: "#2c2c2c" }}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 py-12 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-8 lg:border-r lg:pr-12" style={{ borderColor: "rgba(44,44,44,0.05)" }}>
          <div className="space-y-4">
            <p
              className="font-sans text-[10px] uppercase tracking-[0.4em] font-bold"
              style={{ color: "hsl(var(--primary))" }}
            >
              Territorio
            </p>
            <h1 className="text-6xl leading-[0.9] font-serif italic">{territory.name}</h1>
            <p className="text-xl font-serif italic" style={{ color: "rgba(44,44,44,0.7)" }}>
              {territory.subtitle}
            </p>
          </div>
          <p className="text-lg font-light leading-relaxed max-w-md" style={{ color: "rgba(44,44,44,0.7)" }}>
            {territory.description}
          </p>
          <Link
            to={`/productos`}
            className="inline-block px-8 py-3 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-all"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            Ver artesanías del territorio
          </Link>
        </div>
        <div className="lg:col-span-7">
          <div className="aspect-[21/9] rounded-sm" style={{ backgroundColor: "#f0eee9" }} />
        </div>
      </section>

      {/* ═══════════════ GROUNDED DESCRIPTION ═══════════════ */}
      <section className="px-6 py-24" style={{ backgroundColor: "#2c2c2c", color: "#f9f7f2" }}>
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-5xl font-serif leading-tight">Un legado central en la tejeduría</h2>
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <p className="text-xl leading-relaxed opacity-90 font-light">
              {territory.longDescription}
            </p>
            <Link
              to="/tiendas"
              className="inline-block px-8 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
            >
              Ver los talleres del territorio
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ TECHNIQUES ═══════════════ */}
      <section className="px-6 py-32 border-b" style={{ backgroundColor: "#f5f3ee", borderColor: "rgba(44,44,44,0.05)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 flex justify-between items-baseline">
            <h2 className="text-5xl font-serif">Técnicas del territorio</h2>
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold font-sans">
              Maestría artesanal
            </span>
          </div>

          {territoryTechniques.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {territoryTechniques.slice(0, 3).map((tech, i) => {
                const techSlug = tech.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                return (
                  <div
                    key={tech.id}
                    className="p-12 space-y-8 border transition-colors duration-500 hover:bg-white"
                    style={{ backgroundColor: "#f9f7f2", borderColor: "rgba(44,44,44,0.05)" }}
                  >
                    <div className="space-y-4">
                      <span className="font-serif italic text-2xl" style={{ color: "hsl(var(--primary))" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-3xl font-serif">{tech.name}</h3>
                      <p className="font-light leading-relaxed" style={{ color: "rgba(44,44,44,0.7)" }}>
                        Técnica artesanal presente en los talleres de {territory.name.split(",")[0]}.
                      </p>
                    </div>
                    <Link
                      to={`/tecnica/${techSlug}`}
                      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:gap-4 transition-all"
                      style={{ color: "hsl(var(--primary))" }}
                    >
                      Explorar técnica <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-12 animate-pulse" style={{ backgroundColor: "#e5e1d8" }}>
                  <div className="h-6 w-12 rounded mb-4" style={{ backgroundColor: "#d1cdc3" }} />
                  <div className="h-8 w-40 rounded mb-4" style={{ backgroundColor: "#d1cdc3" }} />
                  <div className="h-16 w-full rounded" style={{ backgroundColor: "#d1cdc3" }} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg italic opacity-60">Próximamente: información detallada de técnicas.</p>
          )}
        </div>
      </section>

      {/* ═══════════════ PRODUCT GRID ═══════════════ */}
      <section className="px-6 py-32 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-5xl font-serif">Piezas de {territory.name.split(",")[0]}</h2>
          <Link
            to="/productos"
            className="text-[10px] font-bold uppercase tracking-widest border-b pb-1 transition-colors hover:text-primary hover:border-primary"
            style={{ borderColor: "#2c2c2c" }}
          >
            Ver colección del territorio
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((p) => (
              <ExploreProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="aspect-[4/5] mb-6 rounded-sm animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                <div className="h-4 w-24 rounded mb-2 animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                <div className="h-6 w-40 rounded animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg italic opacity-60">
            No hay productos disponibles en este territorio aún.
          </p>
        )}
      </section>

      {/* ═══════════════ WORKSHOPS ═══════════════ */}
      <section className="px-6 py-32" style={{ backgroundColor: "#f9f7f2" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-serif">
                Maestros y Colectivos de {territory.name.split(",")[0]}
              </h2>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.5em] mt-2 font-sans"
                style={{ color: "rgba(44,44,44,0.4)" }}
              >
                Conozca las manos detrás del oficio
              </p>
            </div>
            <Link
              to="/tiendas"
              className="px-8 py-3 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-all"
              style={{ backgroundColor: "hsl(var(--primary))" }}
            >
              Ver todos los artesanos
            </Link>
          </div>

          {displayShops.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displayShops.map((shop, i) => (
                <Link
                  key={shop.id}
                  to={`/artesano/${shop.shopSlug || shop.id}`}
                  className="flex flex-col md:flex-row bg-white border rounded-sm overflow-hidden group"
                  style={{ borderColor: "rgba(44,44,44,0.1)" }}
                >
                  <div className={`w-full md:w-1/2 aspect-square ${i % 2 === 1 ? "md:order-last" : ""}`} style={{ backgroundColor: "#e5e1d8" }}>
                    {(shop.logoUrl || shop.bannerUrl) && (
                      <img
                        src={shop.logoUrl || shop.bannerUrl}
                        alt={shop.shopName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span
                        className="font-bold uppercase tracking-widest text-[11px]"
                        style={{ color: "hsl(var(--primary))" }}
                      >
                        {shop.craftType || "Taller Artesanal"}
                      </span>
                      <h3 className="text-3xl font-serif group-hover:text-primary transition-colors">
                        {shop.shopName}
                      </h3>
                      {shop.description && (
                        <p
                          className="text-sm font-light italic leading-relaxed"
                          style={{ color: "rgba(44,44,44,0.6)" }}
                        >
                          {shop.description.length > 120
                            ? shop.description.slice(0, 120) + "..."
                            : shop.description}
                        </p>
                      )}
                    </div>
                    <span
                      className="inline-block mt-8 text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 self-start transition-colors group-hover:text-primary group-hover:border-primary"
                      style={{ borderColor: "rgba(44,44,44,0.2)" }}
                    >
                      Ver taller
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="flex bg-white border rounded-sm overflow-hidden" style={{ borderColor: "rgba(44,44,44,0.1)" }}>
                  <div className="w-1/2 aspect-square animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                  <div className="w-1/2 p-10 space-y-4">
                    <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                    <div className="h-6 w-40 rounded animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                    <div className="h-12 w-full rounded animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg italic opacity-60">No hay talleres registrados en este territorio aún.</p>
          )}
        </div>
      </section>

      {/* ═══════════════ CULTURAL STORY CAPSULE ═══════════════ */}
      <section className="relative px-6 py-40 overflow-hidden bg-white border-y" style={{ borderColor: "rgba(44,44,44,0.05)" }}>
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <span className="text-5xl" style={{ color: "hsl(var(--primary))" }}>"</span>
          <h2 className="text-5xl font-serif italic">{territory.culturalTitle}</h2>
          <p className="text-2xl leading-relaxed italic font-serif" style={{ color: "rgba(44,44,44,0.8)" }}>
            "{territory.culturalQuote}"
          </p>
          <div className="w-16 h-px mx-auto" style={{ backgroundColor: "hsl(var(--primary))" }} />
        </div>
      </section>

      {/* ═══════════════ RELATED TERRITORIES ═══════════════ */}
      <section className="px-6 py-32 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2
            className="text-[10px] font-bold uppercase tracking-[0.4em] font-sans"
            style={{ color: "rgba(44,44,44,0.4)" }}
          >
            Seguir explorando territorios
          </h2>
          <Link
            to="/territorios"
            className="px-8 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-primary hover:text-primary"
            style={{ borderColor: "rgba(44,44,44,0.2)" }}
          >
            Ver todos los territorios
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {relatedTerritories.map((tSlug) => {
            const t = TERRITORY_DATA[tSlug];
            if (!t) return null;
            return (
              <Link key={tSlug} to={`/territorio/${tSlug}`} className="group block">
                <div
                  className="aspect-[16/9] rounded-sm mb-6 grayscale group-hover:grayscale-0 transition-all duration-700"
                  style={{ backgroundColor: "#e5e1d8" }}
                />
                <h3 className="text-2xl font-serif italic">{t.name}</h3>
                <p className="text-sm mt-2 font-light" style={{ color: "rgba(44,44,44,0.6)" }}>
                  {t.subtitle}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section
        className="px-6 py-40 flex flex-col items-center text-center gap-10"
        style={{ backgroundColor: "#2c2c2c", color: "#fff" }}
      >
        <h2 className="text-5xl font-serif max-w-3xl leading-tight">{territory.ctaHeadline}</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            to="/productos"
            className="px-12 py-4 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#2c2c2c] transition-all"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            Explorar piezas
          </Link>
          <Link
            to="/tiendas"
            className="px-12 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-primary hover:text-primary"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Ver talleres
          </Link>
          <Link
            to="/territorios"
            className="px-12 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-primary hover:text-primary"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Descubrir territorios
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
