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
  getProductNewById,
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
interface TerritoryExtraSection {
  eyebrow: string;
  title: string;
  body: string;
}

interface TerritoryMeta {
  name: string;
  department: string;
  subtitle: string;
  description: string;
  longDescription: string;
  culturalQuote: string;
  culturalTitle: string;
  ctaHeadline: string;
  /** Optional: product whose primary image is used in the hero and featured card */
  featuredProductId?: string;
  /** Optional: extra narrative sections rendered before the cultural quote */
  extraSections?: TerritoryExtraSection[];
}

const TERRITORY_DATA: Record<string, TerritoryMeta> = {
  "san-jacinto": {
    name: "San Jacinto, Bolívar",
    department: "Bolivar",
    subtitle: "Donde la hamaca se teje con notas de gaita",
    description:
      "En las sabanas del norte de Bolívar, a menos de tres horas de Cartagena, se encuentra San Jacinto, un territorio donde el tiempo no se mide en horas, sino en las pasadas del hilo por el telar. Considerado la “Cuna de la Hamaca”, este municipio es un paraíso donde la herencia textil del antiguo Reino Finzenú —cultura Zenú— sigue viva en cada hogar.",
    longDescription:
      "La hamaca es el alma de San Jacinto. Durante generaciones, las mujeres —madres, abuelas e hijas— han custodiado el telar vertical. En los patios de sus casas, entre risas y saberes compartidos, realizan procesos ancestrales como el devanado y el trenzado. Para ellas, tejer no es solo un oficio; es un legado familiar que las convierte en las guardianas de la identidad del Caribe.",
    culturalTitle: "Mucho más que un lugar para descansar",
    culturalQuote:
      "Para la cultura Zenú, la hamaca tenía un significado sagrado: era la pieza central en los ritos fúnebres y el símbolo de compromiso que un novio entregaba a su novia. Hoy, esa mística se transforma en piezas de diseño contemporáneo: mochilas, cojines y centros de mesa que llevan consigo siglos de historia y leyendas.",
    ctaHeadline: "Descubra la tierra de la hamaca grande",
    featuredProductId: "b5e6e8c6-5d50-404d-b295-38a7346d7333",
    extraSections: [
      {
        eyebrow: "Sinfonía textil",
        title: "Gaitas y cumbia",
        body: "San Jacinto no solo se mira, se escucha. Es la tierra de los legendarios Gaiteros de San Jacinto, donde el ritmo de la gaita y la cumbia marca el compás de las tejedoras. Un territorio donde la música y la artesanía son una sola voz; como dice la canción, es “la tierra de la hamaca grande”, donde el folclor se siente en cada fibra de algodón.",
      },
    ],
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
  cauca: {
    name: "Cauca",
    department: "Cauca",
    subtitle: "Seda de paz · Popayán, Timbío y El Tambo",
    description:
      "En las montañas del Cauca, Colteseda y Agroarte tejen una revolución silenciosa: mujeres cabeza de familia transforman la morera en seda y la hoja de coca en tintes naturales, convirtiendo cada telar en un refugio de paz.",
    longDescription:
      "Entre Popayán, Timbío y El Tambo, el cultivo de la morera y la sericultura han sustituido economías de la guerra por una economía legal, digna y circular. Las maestras tejedoras de Agroarte integran a los jóvenes en el proceso, asegurando relevo generacional y convirtiendo cada pieza en un manifiesto de reconciliación.",
    culturalQuote:
      "La hoja que fue combustible de guerra se sumerge hoy en las tinas de teñido para dar vida a verdes profundos y amarillos solares. La coca vuelve a su origen artesanal como pigmento de esperanza.",
    culturalTitle: "De la coca al color: alquimia de paz",
    ctaHeadline: "Descubra la seda del Cauca",
    featuredProductId: "963a11d1-98a2-480e-993c-c722b1f248de",
  },
};

const ALL_TERRITORIES = Object.keys(TERRITORY_DATA);

/* ── Component ──────────────────────────────────────── */
export default function Territory() {
  const { slug } = useParams<{ slug: string }>();
  const { techniques: allTechniques } = useTaxonomy();
  const [shops, setShops] = useState<ArtisanShop[]>([]);
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<ProductNewCore | null>(null);
  const [loading, setLoading] = useState(true);

  const territory = slug ? TERRITORY_DATA[slug] : undefined;

  // Fetch featured product (if territory defines one)
  useEffect(() => {
    const id = territory?.featuredProductId;
    if (!id) {
      setFeaturedProduct(null);
      return;
    }
    let cancelled = false;
    getProductNewById(id)
      .then((p) => {
        if (!cancelled) setFeaturedProduct(p);
      })
      .catch(() => {
        if (!cancelled) setFeaturedProduct(null);
      });
    return () => {
      cancelled = true;
    };
  }, [territory?.featuredProductId]);

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
              style={{ color: "#ec6d13" }}
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
            style={{ backgroundColor: "#ec6d13" }}
          >
            Ver artesanías del territorio
          </Link>
        </div>
        <div className="lg:col-span-7">
          {(() => {
            const heroUrl = featuredProduct ? getPrimaryImageUrl(featuredProduct) : null;
            if (heroUrl) {
              return (
                <Link
                  to={`/product/${featuredProduct!.id}`}
                  className="relative block aspect-[21/9] rounded-sm overflow-hidden group"
                >
                  <img
                    src={heroUrl}
                    alt={featuredProduct!.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2c2c2c]/80 via-[#2c2c2c]/20 to-transparent p-6 md:p-8 text-white">
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold mb-2 opacity-80">
                      Pieza destacada del territorio
                    </p>
                    <p className="font-serif italic text-2xl md:text-3xl leading-tight">
                      {featuredProduct!.name}
                      {featuredProduct!.artisanShop?.shopName && (
                        <span className="block text-sm md:text-base not-italic font-sans font-normal opacity-70 mt-2 tracking-wide">
                          Taller {featuredProduct!.artisanShop.shopName}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              );
            }
            return <div className="aspect-[21/9] rounded-sm" style={{ backgroundColor: "#f0eee9" }} />;
          })()}
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
                      <span className="font-serif italic text-2xl" style={{ color: "#ec6d13" }}>
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
                      style={{ color: "#ec6d13" }}
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
            className="text-[10px] font-bold uppercase tracking-widest border-b pb-1 transition-colors hover:text-[#ec6d13] hover:border-[#ec6d13]"
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
              style={{ backgroundColor: "#ec6d13" }}
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
                        style={{ color: "#ec6d13" }}
                      >
                        {shop.craftType || "Taller Artesanal"}
                      </span>
                      <h3 className="text-3xl font-serif group-hover:text-[#ec6d13] transition-colors">
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
                      className="inline-block mt-8 text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 self-start transition-colors group-hover:text-[#ec6d13] group-hover:border-[#ec6d13]"
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

      {/* ═══════════════ EXTRA NARRATIVE SECTIONS ═══════════════ */}
      {territory.extraSections?.length ? (
        <section className="px-6 py-24 md:py-32" style={{ backgroundColor: "#f9f7f2" }}>
          <div className="max-w-[1100px] mx-auto space-y-20">
            {territory.extraSections.map((sec) => (
              <div
                key={sec.title}
                className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start"
              >
                <div className="md:col-span-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.4em] font-sans mb-4"
                    style={{ color: "#ec6d13" }}
                  >
                    {sec.eyebrow}
                  </p>
                  <h3 className="text-4xl md:text-5xl font-serif italic leading-tight">
                    {sec.title}
                  </h3>
                </div>
                <div className="md:col-span-8">
                  <p
                    className="text-lg md:text-xl leading-relaxed font-light"
                    style={{ color: "rgba(44,44,44,0.75)" }}
                  >
                    {sec.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══════════════ CULTURAL STORY CAPSULE ═══════════════ */}
      <section className="relative px-6 py-40 overflow-hidden bg-white border-y" style={{ borderColor: "rgba(44,44,44,0.05)" }}>
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <span className="text-5xl" style={{ color: "#ec6d13" }}>"</span>
          <h2 className="text-5xl font-serif italic">{territory.culturalTitle}</h2>
          <p className="text-2xl leading-relaxed italic font-serif" style={{ color: "rgba(44,44,44,0.8)" }}>
            "{territory.culturalQuote}"
          </p>
          <div className="w-16 h-px mx-auto" style={{ backgroundColor: "#ec6d13" }} />
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
            className="px-8 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
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
            style={{ backgroundColor: "#ec6d13" }}
          >
            Explorar piezas
          </Link>
          <Link
            to="/tiendas"
            className="px-12 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Ver talleres
          </Link>
          <Link
            to="/territorios"
            className="px-12 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
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
