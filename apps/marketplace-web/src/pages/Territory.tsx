/**
 * Territory Detail Page
 * Editorial page showing artisanal territory info: techniques, products, workshops.
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
import { formatCurrency } from "@/lib/currencyUtils";
import { Footer } from "@/components/Footer";
import type { ArtisanShop } from "@/types/artisan-shops.types";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// ── Territory metadata ──────────────────────────────
interface TerritoryMeta {
  name: string;
  department: string;
  subtitle: string;
  description: string;
  longDescription: string;
}

const TERRITORY_DATA: Record<string, TerritoryMeta> = {
  "san-jacinto": {
    name: "San Jacinto, Bolivar",
    department: "Bolivar",
    subtitle: "Cuna de la hamaca y el telar",
    description:
      "Un pilar fundamental del ecosistema TELAR, donde las manos de los artesanos mantienen vivo el dialogo entre la historia de los Montes de Maria y la tejeduria contemporanea.",
    longDescription:
      "San Jacinto se posiciona como un centro historico y cultural de la tejeduria en telar en Colombia. Es un territorio donde el oficio trasciende la produccion para convertirse en un lenguaje de preservacion de la memoria y la identidad local.",
  },
  "la-guajira": {
    name: "La Guajira",
    department: "La Guajira",
    subtitle: "Tejeduria Wayuu y horizontes de arena",
    description:
      "El desierto mas septentrional de Sudamerica, donde la comunidad Wayuu transforma hilos en mochilas que cuentan historias ancestrales.",
    longDescription:
      "La Guajira alberga una de las tradiciones textiles mas reconocidas internacionalmente. La mochila Wayuu es un simbolo de identidad cultural que ha trascendido fronteras.",
  },
  boyaca: {
    name: "Boyaca",
    department: "Boyaca",
    subtitle: "Tradicion textil del altiplano",
    description:
      "Tierra de lanas y tejidos en el corazon del altiplano cundiboyacense, donde la tradicion del hilado manual se transmite de generacion en generacion.",
    longDescription:
      "Boyaca es reconocido por su tradicion textil centenaria, especialmente en municipios como Nobsa e Iza, donde las ruanas y cobijas cuentan la historia del altiplano.",
  },
  narino: {
    name: "Narino",
    department: "Narino",
    subtitle: "Paja toquilla y barniz de Pasto",
    description:
      "En las laderas del sur de Colombia, los artesanos de Narino dominan tecnicas unicas como el barniz de Pasto y el trabajo en paja toquilla.",
    longDescription:
      "Narino es un territorio de contrastes donde conviven tecnicas precolombinas con innovacion artesanal. El barniz de Pasto, patrimonio inmaterial, sigue vivo en talleres familiares.",
  },
};

// Available territory slugs for "related territories" section
const ALL_TERRITORIES = Object.keys(TERRITORY_DATA);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Territory() {
  const { slug } = useParams<{ slug: string }>();
  const { techniques: allTechniques } = useTaxonomy();
  const [shops, setShops] = useState<ArtisanShop[]>([]);
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [loading, setLoading] = useState(true);
  const [workshopPage, setWorkshopPage] = useState(0);

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

        // Filter shops by department (case-insensitive partial match)
        const dept = territory.department.toLowerCase();
        const filteredShops = shopsRes.data.filter(
          (s) =>
            s.department?.toLowerCase().includes(dept) ||
            s.region?.toLowerCase().includes(dept)
        );
        setShops(filteredShops);

        // Filter products from those shops
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

  // Extract unique techniques from the products
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

  if (!territory) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl">Territorio no encontrado</h1>
          <Link
            to="/tiendas"
            className="text-[#ec6d13] text-sm font-bold uppercase tracking-widest"
          >
            Volver a talleres
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2]">
        <div className="max-w-[1400px] mx-auto px-6 py-32 animate-pulse space-y-16">
          <div className="h-12 w-96 bg-[#e5e1d8] rounded" />
          <div className="h-64 w-full bg-[#e5e1d8] rounded" />
          <div className="grid grid-cols-4 gap-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] bg-[#e5e1d8] rounded" />
                <div className="h-4 w-3/4 bg-[#e5e1d8] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c]">
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-12 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-8 lg:border-r border-[#2c2c2c]/5 lg:pr-12">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#ec6d13] font-bold">
              Territorio
            </p>
            <h1 className="text-5xl lg:text-6xl leading-[0.9] font-serif italic">
              {territory.name}
            </h1>
            <p className="text-xl text-[#2c2c2c]/70 leading-relaxed font-serif italic">
              {territory.subtitle}
            </p>
          </div>
          <p className="text-lg text-[#2c2c2c]/70 leading-relaxed font-light max-w-md">
            {territory.description}
          </p>
          <Link
            to={`/productos`}
            className="inline-block px-8 py-3 bg-[#ec6d13] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-all"
          >
            Ver artesanias del territorio
          </Link>
        </div>
        <div className="lg:col-span-7">
          <div className="aspect-[21/9] bg-[#e5e1d8] rounded-sm" />
        </div>
      </section>

      {/* Dark Description Block */}
      <section className="bg-[#2c2c2c] text-[#f9f7f2] px-6 py-24">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl lg:text-5xl font-serif leading-tight">
              Un legado central en la tejeduria
            </h2>
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <p className="text-xl leading-relaxed opacity-90 font-light">
              {territory.longDescription}
            </p>
            <button className="px-8 py-3 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] transition-all">
              Ver los talleres del territorio
            </button>
          </div>
        </div>
      </section>

      {/* Techniques Section */}
      {territoryTechniques.length > 0 && (
        <section className="px-6 py-32 bg-[#f5f3ee] border-b border-[#2c2c2c]/5">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-16 flex justify-between items-baseline">
              <h2 className="text-4xl lg:text-5xl font-serif">
                Tecnicas del territorio
              </h2>
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
                Maestria artesanal
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {territoryTechniques.slice(0, 6).map((tech, i) => (
                <div
                  key={tech.id}
                  className="bg-[#f9f7f2] p-12 space-y-8 hover:bg-white transition-colors duration-500 border border-[#2c2c2c]/5"
                >
                  <div className="space-y-4">
                    <span className="text-[#ec6d13] font-serif italic text-2xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-3xl font-serif">{tech.name}</h3>
                  </div>
                  <Link
                    to={`/productos`}
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#ec6d13] hover:gap-4 transition-all"
                  >
                    Explorar tecnica
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <section className="px-6 py-32 max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif">
              Piezas de {territory.name.split(",")[0]}
            </h2>
            <Link
              to="/productos"
              className="text-[10px] font-bold uppercase tracking-widest border-b border-[#2c2c2c] pb-1 hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors"
            >
              Ver coleccion del territorio
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {products.slice(0, 8).map((product) => {
              const imageUrl = getPrimaryImageUrl(product);
              const price = getProductPrice(product);
              const technique = getTechniqueName(product);
              const dept = product.artisanShop?.department;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-[#e5e5e5] mb-6 rounded-sm overflow-hidden">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-[#2c2c2c]/50">
                      {dept && `${dept}`}
                      {dept && technique && " · "}
                      {technique}
                    </p>
                    <h3 className="text-2xl font-serif leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center pt-4 border-t border-[#2c2c2c]/5">
                      <span className="font-medium">
                        {price ? formatCurrency(price) : "Consultar"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Workshops Section */}
      {shops.length > 0 && (
        <section className="px-6 py-32 bg-[#f9f7f2]">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl lg:text-4xl font-serif">
                  Maestros y Colectivos de {territory.name.split(",")[0]}
                </h2>
                <p className="text-[#2c2c2c]/40 text-[10px] font-bold uppercase tracking-[0.5em] mt-2">
                  Conozca las manos detras del oficio
                </p>
              </div>
              <Link
                to="/tiendas"
                className="px-8 py-3 bg-[#ec6d13] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-all"
              >
                Ver todos los artesanos del territorio
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {shops.slice(workshopPage * 2, workshopPage * 2 + 2).map((shop, i) => (
                <div
                  key={shop.id}
                  className="flex flex-col md:flex-row bg-white border border-[#2c2c2c]/10 rounded-sm overflow-hidden"
                >
                  <div
                    className={`w-full md:w-1/2 aspect-square bg-[#e5e5e5] ${
                      i % 2 === 1 ? "md:order-last" : ""
                    }`}
                  >
                    {shop.bannerUrl && (
                      <img
                        src={shop.bannerUrl}
                        alt={shop.shopName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[#ec6d13] font-bold uppercase tracking-widest text-[11px]">
                        {shop.craftType || "Taller"}
                      </span>
                      <h3 className="text-3xl font-serif">{shop.shopName}</h3>
                      <p className="text-[#2c2c2c]/60 text-sm font-light italic leading-relaxed">
                        {shop.description?.slice(0, 150)}
                        {(shop.description?.length ?? 0) > 150 ? "..." : ""}
                      </p>
                    </div>
                    <Link
                      to={`/tienda/${shop.shopSlug}`}
                      className="inline-block mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2c2c2c] hover:text-[#ec6d13] transition-colors border-b border-[#2c2c2c]/20 pb-1 self-start"
                    >
                      Ver taller
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {shops.length > 2 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: Math.ceil(shops.length / 2) }).map(
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => setWorkshopPage(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === workshopPage
                          ? "bg-[#ec6d13]"
                          : "bg-[#2c2c2c]/10"
                      }`}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cultural Story Capsule */}
      <section className="relative px-6 py-40 overflow-hidden bg-white border-y border-[#2c2c2c]/5">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl lg:text-5xl font-serif italic">
            Simbolismo en el hilo
          </h2>
          <p className="text-xl lg:text-2xl leading-relaxed italic text-[#2c2c2c]/80 font-serif">
            "Los patrones geometricos de {territory.name.split(",")[0]} son un
            eco de culturas ancestrales, representaciones de la naturaleza y del
            complejo sistema de conocimientos que estas civilizaciones
            construyeron hace siglos."
          </p>
          <div className="w-16 h-px bg-[#ec6d13] mx-auto" />
        </div>
      </section>

      {/* Related Territories */}
      <section className="px-6 py-32 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#2c2c2c]/40">
            Seguir explorando territorios
          </h2>
          <Link
            to="/tiendas"
            className="px-8 py-3 border border-[#2c2c2c]/20 text-[#2c2c2c] text-[10px] font-bold uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] transition-all"
          >
            Ver todos los territorios
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {relatedTerritories.map((tSlug) => {
            const t = TERRITORY_DATA[tSlug];
            return (
              <Link
                key={tSlug}
                to={`/territorio/${tSlug}`}
                className="group block"
              >
                <div className="aspect-[16/9] bg-[#e5e5e5] rounded-sm mb-6 grayscale group-hover:grayscale-0 transition-all duration-700" />
                <h3 className="text-2xl font-serif italic inline-block">
                  {t.name}
                </h3>
                <p className="text-sm text-[#2c2c2c]/60 mt-2 font-light">
                  {t.subtitle}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-40 bg-[#2c2c2c] text-white flex flex-col items-center text-center gap-10">
        <h2 className="text-4xl lg:text-5xl font-serif max-w-3xl leading-tight">
          Descubra la maestria de {territory.name.split(",")[0]}
        </h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            to="/productos"
            className="px-12 py-4 bg-[#ec6d13] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#2c2c2c] transition-all"
          >
            Explorar piezas
          </Link>
          <Link
            to="/tiendas"
            className="px-12 py-4 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] transition-all"
          >
            Ver talleres del territorio
          </Link>
        </div>
      </section>

      <div className="pb-24" />
      <Footer />
    </div>
  );
}
