/**
 * ArtisanProfile Page — Editorial Artisan Profile
 * Route: /artesano/:slug
 * Uses shop data + products-new for real content
 */

import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import {
  getProductsByStore,
  getPrimaryImageUrl,
  getProductPrice,
  getProductStock,
  getTechniqueName,
  getCraftName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/hooks/useWishlist";
import { ArrowRight, Heart } from "lucide-react";

// ── Fallback editorial data ──────────────────────────────
interface ArtisanEditorial {
  tagline: string;
  profileNumber: string;
  heroSubtitle: string;
  story: string[];
  quote: string;
  storyOverlayLabel: string;
  storyOverlayText: string;
  originDescription: string;
  registryId: string;
  registryLabel: string;
}

const DEFAULT_EDITORIAL: ArtisanEditorial = {
  tagline: "Maestros Artesanos / Colombia",
  profileNumber: "001",
  heroSubtitle:
    "Un legado de tradicion y memoria en el corazon de Colombia.",
  story: [
    "Un taller donde el tiempo se mide en pasadas de trama y urdimbre, donde cada pieza es una conversacion entre la tradicion y el presente.",
    "Desde hace generaciones, esta familia ha custodiado el secreto de las tecnicas ancestrales, asegurando que la herencia cultural continue vibrando en cada pieza contemporanea.",
  ],
  quote:
    '"Cada hilo cuenta una historia de resistencia y belleza cultural, transformando fibras naturales en obras de arte."',
  storyOverlayLabel: "Tradicion Viva",
  storyOverlayText: "Generaciones de maestros artesanos.",
  originDescription:
    "Reconocido como cuna de la artesania colombiana. Una tierra donde la tradicion y la creatividad se encuentran en cada rincon.",
  registryId: "TLR-00000-2024",
  registryLabel: "Certificado de Autenticidad TELAR",
};

// ── Component ────────────────────────────────────────────
const ArtisanProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    currentShop,
    fetchShopBySlug,
    loading: shopLoading,
  } = useArtisanShops();
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();

  // Fetch shop by slug
  useEffect(() => {
    if (slug) {
      fetchShopBySlug(slug).catch(() => {});
    }
  }, [slug]);

  // Fetch products-new when shop loads
  useEffect(() => {
    if (!currentShop?.id) return;
    let cancelled = false;
    setProductsLoading(true);
    getProductsByStore(currentShop.id)
      .then((prods) => {
        if (!cancelled) setProducts(prods);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentShop?.id]);

  // Derived data from shop + products
  const shopName =
    currentShop?.shopName ?? slug?.replace(/-/g, " ") ?? "Artesano";
  const nameParts = shopName.split(" ");
  const firstName = nameParts
    .slice(0, Math.ceil(nameParts.length / 2))
    .join(" ");
  const lastName = nameParts
    .slice(Math.ceil(nameParts.length / 2))
    .join(" ");
  const location = currentShop
    ? [currentShop.municipality, currentShop.department]
        .filter(Boolean)
        .join(", ")
    : "";
  const craftType = currentShop?.craftType ?? "Artesania";
  const story = currentShop?.story ?? "";
  const editorial = DEFAULT_EDITORIAL;

  // Extract real techniques from products
  const realTechniques = useMemo(() => {
    const techMap = new Map<string, string>();
    products.forEach((p) => {
      const t = p.artisanalIdentity?.primaryTechnique;
      if (t) techMap.set(t.id, t.name);
      const t2 = p.artisanalIdentity?.secondaryTechnique;
      if (t2) techMap.set(t2.id, t2.name);
    });
    return Array.from(techMap.values());
  }, [products]);

  // Extract real materials from products
  const realMaterials = useMemo(() => {
    const mats = new Set<string>();
    products.forEach((p) => {
      p.materials?.forEach((ml) => {
        if (ml.material?.name) mats.add(ml.material.name);
      });
    });
    return Array.from(mats);
  }, [products]);

  // Extract primary craft
  const primaryCraft = useMemo(() => {
    for (const p of products) {
      const c = getCraftName(p);
      if (c) return c;
    }
    return craftType;
  }, [products, craftType]);

  // Hero images from products
  const heroImages = useMemo(() => {
    const imgs: string[] = [];
    if (currentShop?.bannerUrl) imgs.push(currentShop.bannerUrl);
    if (currentShop?.logoUrl) imgs.push(currentShop.logoUrl);
    products.forEach((p) => {
      const url = getPrimaryImageUrl(p);
      if (url && imgs.length < 8) imgs.push(url);
    });
    return imgs;
  }, [products, currentShop]);

  return (
    <div className="bg-[#f9f7f2] text-[#2c2c2c] min-h-screen overflow-x-hidden">
      {/* Section 1: Editorial Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-end pb-16 pt-12 md:pt-0">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[#e5e1d8] z-0 overflow-hidden">
          {heroImages[0] ? (
            <img
              src={heroImages[0]}
              alt={shopName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#2c2c2c]/20 font-serif italic text-xl">
              Retrato del Taller
            </div>
          )}
        </div>
        <div className="max-w-[1440px] mx-auto px-8 w-full relative z-10">
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-12 lg:col-span-9">
              <p className="text-[#ec6d13] font-extrabold tracking-[0.5em] uppercase mb-6 text-[11px]">
                {editorial.tagline}
              </p>
              <h1
                className="font-serif italic font-bold leading-[0.85] text-[#2c2c2c] mb-8"
                style={{
                  fontSize: "clamp(3.5rem, 12vw, 12rem)",
                  letterSpacing: "-0.04em",
                }}
              >
                {firstName}
                {lastName && (
                  <>
                    <br />
                    {lastName}
                  </>
                )}
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-4 border-l-2 border-[#ec6d13] pl-8 py-1">
              <div className="grid grid-cols-1 gap-4">
                {location && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                      Ubicacion
                    </p>
                    <p className="font-bold text-base">{location}</p>
                  </div>
                )}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                    Oficio Principal
                  </p>
                  <p className="font-bold text-base">{primaryCraft}</p>
                </div>
                {realTechniques.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                      Tecnicas
                    </p>
                    <p className="font-bold text-base">
                      {realTechniques.join(", ")}
                    </p>
                  </div>
                )}
                {realMaterials.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                      Materiales
                    </p>
                    <p className="font-bold text-base">
                      {realMaterials.slice(0, 3).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8 flex justify-end">
              <div className="max-w-md text-right">
                <p className="text-[10px] tracking-widest uppercase font-bold text-[#2c2c2c]/40 mb-2">
                  Perfil del Artesano {editorial.profileNumber}
                </p>
                <p className="text-lg leading-relaxed text-[#2c2c2c]/60 font-light italic">
                  {editorial.heroSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Story */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-12 lg:gap-24 items-start">
            <div className="col-span-12 lg:col-span-1 hidden lg:block">
              <span
                className="font-serif text-6xl text-[#ec6d13]/10 select-none"
                style={{ writingMode: "vertical-rl" }}
              >
                HISTORIA
              </span>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <h2 className="font-serif text-5xl md:text-6xl mb-10 italic leading-tight">
                La historia del taller
              </h2>
              <div className="space-y-8 text-xl leading-[1.6] text-[#2c2c2c]/80 font-light">
                {story ? (
                  story.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                ) : (
                  editorial.story.map((p, i) => (
                    <p key={i}>
                      {i === 0 && currentShop?.shopName ? (
                        <>
                          El taller de{" "}
                          <span className="font-bold text-[#2c2c2c]">
                            {currentShop.shopName}
                          </span>{" "}
                          {p.toLowerCase()}
                        </>
                      ) : (
                        p
                      )}
                    </p>
                  ))
                )}
                <p className="italic font-serif text-3xl md:text-4xl text-[#ec6d13] py-8 border-y border-[#ec6d13]/20 leading-snug">
                  {editorial.quote}
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 pt-12 lg:pt-24">
              <div className="aspect-[4/5] bg-[#e5e1d8] relative max-w-sm mx-auto lg:ml-auto overflow-hidden">
                {heroImages[1] ? (
                  <img
                    src={heroImages[1]}
                    alt={shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#2c2c2c]/20 italic text-sm">
                    Vida en el Taller
                  </div>
                )}
                <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-[#2c2c2c] text-white p-8 flex flex-col justify-center">
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-4 text-[#ec6d13] font-bold">
                    {editorial.storyOverlayLabel}
                  </p>
                  <p className="font-serif text-xl italic">
                    {editorial.storyOverlayText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Technique & Craft — from real data */}
      {(realTechniques.length > 0 || realMaterials.length > 0) && (
        <section className="py-24 md:py-32 px-8 bg-[#f9f7f2]">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-16">
              <p className="text-[#ec6d13] font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
                Saber-hacer
              </p>
              <h3 className="font-serif text-5xl md:text-6xl mb-6 leading-none italic">
                Tecnica Artesanal
              </h3>
            </div>
            <div className="grid grid-cols-12 gap-8 lg:gap-16">
              {realTechniques.slice(0, 2).map((tech, i) => (
                <div
                  key={tech}
                  className={`col-span-12 lg:col-span-5 ${
                    i === 1 ? "lg:col-start-8 lg:mt-32" : ""
                  }`}
                >
                  <div className="aspect-[16/10] bg-[#e5e1d8] mb-8 overflow-hidden rounded-sm">
                    {heroImages[i + 2] && (
                      <img
                        src={heroImages[i + 2]}
                        alt={tech}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="border-t border-[#2c2c2c]/10 pt-6">
                    <h4 className="font-serif text-3xl mb-4">{tech}</h4>
                    {realMaterials.length > 0 && i === 0 && (
                      <p className="text-[#2c2c2c]/60 text-base leading-relaxed font-light max-w-sm">
                        Materiales principales:{" "}
                        {realMaterials.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Cultural Origin - Dark Banner */}
      <section className="bg-[#2c2c2c] py-32 md:py-48 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center">
          <div className="text-[20rem] font-black text-white leading-none">
            ORIGEN
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <p className="text-[#ec6d13] font-bold tracking-[0.6em] uppercase mb-8 text-[10px]">
            Ubicacion Geografica
          </p>
          <h3 className="font-serif text-6xl md:text-7xl text-[#f9f7f2] mb-10 italic leading-tight">
            {location || "Colombia"}
          </h3>
          <p className="text-xl text-[#f9f7f2]/40 leading-[1.8] font-light mb-12 max-w-2xl mx-auto">
            {editorial.originDescription}
          </p>
          {currentShop?.department && (
            <Link
              to={`/territorio/${currentShop.department.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-block border border-[#ec6d13] text-[#ec6d13] px-12 py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#ec6d13] hover:text-white transition-all"
            >
              Explorar la Region
            </Link>
          )}
        </div>
      </section>

      {/* Section 5: Creation Process — from real data */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-[#2c2c2c]/5 pb-8 gap-4">
            <h3 className="font-serif text-5xl md:text-6xl italic">
              Como se crea cada pieza
            </h3>
            <p className="text-[#2c2c2c]/40 text-[10px] tracking-widest uppercase mb-1">
              El camino de la fibra
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-16 lg:gap-24">
            {[
              {
                title: "Seleccion de Materiales",
                desc: realMaterials.length > 0
                  ? `Materiales cuidadosamente seleccionados: ${realMaterials.join(", ")}. Priorizando la calidad y la sostenibilidad local.`
                  : "Elegimos cuidadosamente los materiales naturales, priorizando la calidad y la sostenibilidad local.",
              },
              {
                title: "Preparacion y Montaje",
                desc: `Se preparan las herramientas y el espacio para ${primaryCraft.toLowerCase()}. Un proceso meticuloso que define el caracter de la pieza.`,
              },
              {
                title: "Creacion Maestra",
                desc: realTechniques.length > 0
                  ? `Mediante ${realTechniques.join(" y ")}, el artesano imprime su alma en cada centimetro, creando piezas irrepetibles.`
                  : "Dias de trabajo manual donde el artesano imprime su alma en cada centimetro, creando piezas irrepetibles.",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className={`relative group ${
                  i === 1 ? "lg:mt-16" : i === 2 ? "lg:mt-32" : ""
                }`}
              >
                <span className="font-serif text-[8rem] font-bold text-[#ec6d13]/5 absolute -top-20 -left-4 group-hover:text-[#ec6d13]/10 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-6 tracking-tight">
                    {step.title}
                  </h4>
                  <div className="aspect-video bg-[#e5e1d8] mb-6 overflow-hidden rounded-sm">
                    {heroImages[i + 4] && (
                      <img
                        src={heroImages[i + 4]}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-[#2c2c2c]/50 text-base leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Digital Traceability */}
      <section className="py-24 md:py-32 px-8 bg-[#f9f7f2] border-y border-[#2c2c2c]/5">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-12 items-center gap-12 lg:gap-24">
            <div className="col-span-12 lg:col-span-7">
              <div className="inline-flex items-center gap-4 mb-8">
                <span className="w-10 h-[1px] bg-[#ec6d13]" />
                <span className="text-[#ec6d13] text-[9px] font-extrabold tracking-[0.4em] uppercase">
                  Certificacion de Autoria Digital
                </span>
              </div>
              <h3 className="font-serif text-5xl md:text-6xl mb-8 leading-[1] italic">
                Huella Digital del Artesano
              </h3>
              <div className="space-y-6 text-xl leading-relaxed text-[#2c2c2c]/60 font-light max-w-2xl">
                <p>
                  Cada pieza es una obra de autor unica. Nuestro sistema de
                  trazabilidad garantiza que el legado de{" "}
                  <span className="text-[#2c2c2c] font-bold">
                    {shopName}
                  </span>{" "}
                  se preserve intacto desde su taller hasta su hogar.
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 flex justify-end">
              <div className="w-full max-w-md bg-white p-12 shadow-2xl relative overflow-hidden border border-[#2c2c2c]/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ec6d13]/5 rounded-bl-full" />
                <div className="flex justify-center mb-10">
                  <div className="w-20 h-20 rounded-full border-2 border-[#ec6d13]/20 flex items-center justify-center">
                    <span className="text-[#ec6d13] text-2xl">✦</span>
                  </div>
                </div>
                <div className="text-center mb-12">
                  <p className="font-serif text-3xl mb-3 italic text-[#2c2c2c]">
                    Registro
                  </p>
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#2c2c2c]/40 font-bold">
                    {editorial.registryLabel}
                  </p>
                </div>
                <div className="space-y-4 border-t border-[#2c2c2c]/5 pt-8">
                  <div className="flex justify-between items-end border-b border-[#2c2c2c]/5 pb-2">
                    <span className="text-[9px] tracking-widest text-[#2c2c2c]/40 uppercase font-bold">
                      Maestro Artesano
                    </span>
                    <span className="font-bold text-xs tracking-widest">
                      {shopName.toUpperCase()}
                    </span>
                  </div>
                  {location && (
                    <div className="flex justify-between items-end border-b border-[#2c2c2c]/5 pb-2">
                      <span className="text-[9px] tracking-widest text-[#2c2c2c]/40 uppercase font-bold">
                        Ubicacion Origen
                      </span>
                      <span className="font-bold text-xs tracking-widest">
                        {location.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-b border-[#2c2c2c]/5 pb-2">
                    <span className="text-[9px] tracking-widest text-[#2c2c2c]/40 uppercase font-bold">
                      Oficio
                    </span>
                    <span className="font-bold text-xs tracking-widest">
                      {primaryCraft.toUpperCase()}
                    </span>
                  </div>
                  {realTechniques.length > 0 && (
                    <div className="flex justify-between items-end border-b border-[#2c2c2c]/5 pb-2">
                      <span className="text-[9px] tracking-widest text-[#2c2c2c]/40 uppercase font-bold">
                        Tecnicas
                      </span>
                      <span className="font-bold text-xs tracking-widest text-right">
                        {realTechniques.join(", ").toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pb-2">
                    <span className="text-[9px] tracking-widest text-[#2c2c2c]/40 uppercase font-bold">
                      Piezas
                    </span>
                    <span className="font-bold text-xs tracking-widest">
                      {products.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Products — real products-new data */}
      <section className="py-24 md:py-32 px-8 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-[#ec6d13] font-bold uppercase tracking-[0.4em] text-[10px] mb-3">
                Catalogo Editorial
              </p>
              <h3 className="font-serif text-5xl md:text-6xl italic">
                Piezas creadas por este taller
              </h3>
            </div>
            {currentShop?.shopSlug && (
              <Link
                to={`/tienda/${currentShop.shopSlug}`}
                className="group inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase pb-1 hover:text-[#ec6d13] transition-colors"
              >
                <span>Ver coleccion completa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] bg-[#e5e1d8] mb-5 rounded-sm" />
                  <div className="h-3 bg-[#e5e1d8] rounded w-2/3 mb-2" />
                  <div className="h-3 bg-[#e5e1d8] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
              {products.slice(0, 8).map((product) => {
                const imageUrl = getPrimaryImageUrl(product);
                const price = getProductPrice(product);
                const technique = getTechniqueName(product);
                const stock = getProductStock(product);

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group"
                  >
                    <div className="aspect-[4/5] bg-[#e5e1d8] mb-6 relative overflow-hidden rounded-sm">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] ${
                            stock === 0 ? "grayscale" : ""
                          }`}
                        />
                      )}
                      {stock === 0 && (
                        <div className="absolute top-4 left-0 bg-[#2c2c2c] text-white text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-1.5">
                          Agotado
                        </div>
                      )}
                      <button
                        className={`absolute top-4 right-4 transition-all opacity-0 group-hover:opacity-100 ${
                          isInWishlist(product.id) ? "!opacity-100 text-[#ec6d13]" : "text-[#2c2c2c] hover:text-[#ec6d13]"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        disabled={wishlistLoading}
                      >
                        <Heart className={`w-5 h-5 transition-colors ${isInWishlist(product.id) ? "fill-[#ec6d13]" : ""}`} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-serif text-2xl leading-tight group-hover:text-[#ec6d13] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#ec6d13]">
                          {shopName}
                        </p>
                        {technique && (
                          <p className="text-[9px] uppercase tracking-widest text-[#2c2c2c]/40 font-bold">
                            {technique}
                          </p>
                        )}
                      </div>
                      <div className="pt-4 border-t border-[#2c2c2c]/5">
                        <p className="text-lg font-bold tracking-tight">
                          {price ? formatCurrency(price) : "Consultar"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#2c2c2c]/40 text-sm">
                Proximamente se mostraran las piezas de este taller.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 8: Fair Trade Statement */}
      <section className="py-24 md:py-32 bg-[#f9f7f2] border-t border-[#2c2c2c]/5">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="text-[#ec6d13] text-4xl mb-10">✦</div>
          <h3 className="font-serif text-5xl md:text-6xl mb-8 italic">
            Compromiso Etico y Comercio Justo
          </h3>
          <p className="text-xl md:text-2xl text-[#2c2c2c]/60 font-light leading-relaxed mb-12">
            Creemos en un modelo donde el valor se distribuye equitativamente.
            Cada compra apoya directamente la economia de las familias
            artesanas
            {location ? ` de ${location}` : " de Colombia"}.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] font-bold uppercase tracking-[0.3em] text-[#2c2c2c]/40">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />{" "}
              100% Hecho a Mano
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />{" "}
              Pago Justo Directo
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />{" "}
              Impacto Sostenible
            </span>
          </div>
        </div>
      </section>

      <div className="pb-24" />
      <Footer />
    </div>
  );
};

export default ArtisanProfile;
