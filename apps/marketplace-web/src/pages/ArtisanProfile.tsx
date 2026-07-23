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

  // Loading skeleton while shop data resolves
  if (shopLoading && !currentShop) {
    return (
      <div className="bg-[#f9f7f2] min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-full border-2 border-[#ec6d13]/20 border-t-[#ec6d13] animate-spin" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#2c2c2c]/40 font-bold">
            Cargando perfil del artesano
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f7f2] text-[#2c2c2c] min-h-screen overflow-x-hidden">
      {/* ═══ Section 1: Editorial Hero ═══ */}
      <section className="relative lg:min-h-[70vh] flex flex-col justify-end pt-8 md:pt-12 lg:pt-0 pb-12 md:pb-16">
        {/* Desktop-only 2/3 background image */}
        <div className="hidden lg:block absolute top-0 right-0 w-2/3 h-full bg-[#e5e1d8] z-0 overflow-hidden">
          {heroImages[0] ? (
            <img
              src={heroImages[0]}
              alt={shopName}
              className="w-full h-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#2c2c2c]/20 font-serif italic text-xl">
              Retrato del Taller
            </div>
          )}
        </div>

        {/* Mobile full-width image (above title) */}
        <div className="lg:hidden w-full aspect-[4/5] bg-[#e5e1d8] overflow-hidden mb-8">
          {heroImages[0] ? (
            <img
              src={heroImages[0]}
              alt={shopName}
              className="w-full h-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#2c2c2c]/20 font-serif italic text-base">
              Retrato del Taller
            </div>
          )}
        </div>

        <div className="max-w-[1440px] mx-auto px-5 md:px-8 w-full relative z-10">
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-12 lg:col-span-9">
              <p className="text-[#ec6d13] font-extrabold tracking-[0.4em] md:tracking-[0.5em] uppercase mb-4 md:mb-6 text-[10px] md:text-[11px]">
                {editorial.tagline}
              </p>
              <h1
                className="font-serif italic font-bold leading-[0.85] text-[#2c2c2c] mb-8 break-words"
                style={{
                  fontSize: "clamp(2.75rem, 12vw, 12rem)",
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
          <div className="grid grid-cols-12 gap-6 md:gap-8 items-end">
            <div className="col-span-12 lg:col-span-4 border-l-2 border-[#ec6d13] pl-5 md:pl-8 py-1">
              <div className="grid grid-cols-1 gap-4">
                {location && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                      Ubicacion
                    </p>
                    <p className="font-bold text-sm md:text-base">{location}</p>
                  </div>
                )}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                    Oficio Principal
                  </p>
                  <p className="font-bold text-sm md:text-base">{primaryCraft}</p>
                </div>
                {realTechniques.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                      Tecnicas
                    </p>
                    <p className="font-bold text-sm md:text-base">
                      {realTechniques.slice(0, 3).join(", ")}
                    </p>
                  </div>
                )}
                {realMaterials.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-1">
                      Materiales
                    </p>
                    <p className="font-bold text-sm md:text-base">
                      {realMaterials.slice(0, 3).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8 flex lg:justify-end">
              <div className="max-w-md lg:text-right">
                <p className="text-[10px] tracking-widest uppercase font-bold text-[#2c2c2c]/40 mb-2">
                  Perfil del Artesano {editorial.profileNumber}
                </p>
                <p className="text-base md:text-lg leading-relaxed text-[#2c2c2c]/60 font-light italic">
                  {editorial.heroSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: The Story ═══ */}
      <section className="py-20 md:py-28 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-12 lg:gap-24 items-start">
            <div className="hidden lg:block col-span-1">
              <span
                className="font-serif text-6xl text-[#ec6d13]/10 select-none"
                style={{ writingMode: "vertical-rl" }}
              >
                HISTORIA
              </span>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <p className="lg:hidden text-[#ec6d13] font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
                Historia
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 md:mb-10 italic leading-tight">
                La historia del taller
              </h2>
              <div className="space-y-6 md:space-y-8 text-lg md:text-xl leading-[1.6] text-[#2c2c2c]/80 font-light">
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
                <p className="italic font-serif text-2xl md:text-3xl lg:text-4xl text-[#ec6d13] py-6 md:py-8 border-y border-[#ec6d13]/20 leading-snug">
                  {editorial.quote}
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 pt-4 lg:pt-24">
              <div className="aspect-[4/5] bg-[#e5e1d8] relative max-w-sm mx-auto lg:ml-auto overflow-hidden">
                {heroImages[1] ? (
                  <img
                    src={heroImages[1]}
                    alt={shopName}
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#2c2c2c]/20 italic text-sm">
                    Vida en el Taller
                  </div>
                )}
                {/* Overlay card — smaller/inset on mobile, offset on desktop */}
                <div className="absolute bottom-4 left-4 lg:-bottom-8 lg:-left-8 w-44 h-44 lg:w-56 lg:h-56 bg-[#2c2c2c] text-white p-5 lg:p-8 flex items-center justify-center text-center">
                  <p className="font-serif text-base lg:text-xl italic leading-snug">
                    {editorial.storyOverlayText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: Technique & Craft ═══ */}
      {(realTechniques.length > 0 || realMaterials.length > 0) && (
        <section className="py-20 md:py-28 lg:py-32 px-5 md:px-8 bg-[#f9f7f2]">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-12 md:mb-16">
              <p className="text-[#ec6d13] font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
                Saber-hacer
              </p>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-[1.05]">
                Tecnica Artesanal
              </h3>
            </div>
            <div className="grid grid-cols-12 gap-8 md:gap-12 lg:gap-16">
              {realTechniques.slice(0, 2).map((tech, i) => (
                <div
                  key={tech}
                  className={`col-span-12 lg:col-span-5 ${
                    i === 1 ? "lg:col-start-8 lg:mt-32" : ""
                  }`}
                >
                  <div className="aspect-[16/10] bg-[#e5e1d8] mb-6 md:mb-8 overflow-hidden">
                    {heroImages[i + 2] && (
                      <img
                        src={heroImages[i + 2]}
                        alt={tech}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                      />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-[#2c2c2c]/10 pt-6">
                    <div className="flex-1">
                      <h4 className="font-serif text-2xl md:text-3xl mb-3 md:mb-4">{tech}</h4>
                      {realMaterials.length > 0 && i === 0 && (
                        <p className="text-[#2c2c2c]/60 text-sm md:text-base leading-relaxed font-light max-w-sm">
                          Materiales principales: {realMaterials.slice(0, 4).join(", ")}
                        </p>
                      )}
                      {i === 1 && (
                        <p className="text-[#2c2c2c]/60 text-sm md:text-base leading-relaxed font-light max-w-sm">
                          Saberes que se transmiten de generacion en generacion, cada pieza guarda la memoria del oficio.
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-6 h-6 md:w-7 md:h-7 text-[#ec6d13] flex-shrink-0 -rotate-45" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Section 4: Cultural Origin — Dark Banner ═══ */}
      <section className="bg-[#1a1a1a] py-24 md:py-36 lg:py-48 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
          <div
            className="font-black text-white leading-none whitespace-nowrap select-none"
            style={{ fontSize: "clamp(6rem, 28vw, 20rem)" }}
          >
            ORIGEN
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center relative z-10">
          <p className="text-[#ec6d13] font-bold tracking-[0.5em] md:tracking-[0.6em] uppercase mb-6 md:mb-8 text-[10px]">
            Ubicacion Geografica
          </p>
          <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#f9f7f2] mb-8 md:mb-10 italic leading-tight">
            {location || "Colombia"}
          </h3>
          <p className="text-base md:text-xl text-[#f9f7f2]/50 leading-[1.7] md:leading-[1.8] font-light mb-10 md:mb-12 max-w-2xl mx-auto">
            {editorial.originDescription}
          </p>
          {currentShop?.department && (
            <Link
              to={`/territorio/${currentShop.department.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative inline-block border border-[#ec6d13] text-[#ec6d13] px-8 md:px-12 py-3 md:py-4 text-[11px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase overflow-hidden"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                Explorar la Region
              </span>
              <div className="absolute inset-0 bg-[#ec6d13] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          )}
        </div>
      </section>

      {/* ═══ Section 5: Creation Process ═══ */}
      <section className="py-20 md:py-28 lg:py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-20 border-b border-[#2c2c2c]/5 pb-8 gap-4">
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl italic leading-tight">
              Como se crea cada pieza
            </h3>
            <p className="text-[#2c2c2c]/40 text-[10px] tracking-widest uppercase mb-1">
              El camino de la fibra
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-20 lg:gap-24">
            {[
              {
                title: "Seleccion de Materiales",
                desc: realMaterials.length > 0
                  ? `Materiales cuidadosamente seleccionados: ${realMaterials.slice(0, 3).join(", ")}. Priorizando la calidad y la sostenibilidad local.`
                  : "Elegimos cuidadosamente los materiales naturales, priorizando la calidad y la sostenibilidad local.",
              },
              {
                title: "Preparacion y Montaje",
                desc: `Se preparan las herramientas y el espacio para ${primaryCraft.toLowerCase()}. Un proceso meticuloso que define el caracter de la pieza.`,
              },
              {
                title: "Creacion Maestra",
                desc: realTechniques.length > 0
                  ? `Mediante ${realTechniques.slice(0, 2).join(" y ")}, el artesano imprime su alma en cada centimetro, creando piezas irrepetibles.`
                  : "Dias de trabajo manual donde el artesano imprime su alma en cada centimetro, creando piezas irrepetibles.",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className={`relative group ${
                  i === 1 ? "lg:mt-16" : i === 2 ? "lg:mt-32" : ""
                }`}
              >
                <span
                  className="font-serif font-bold text-[#ec6d13]/5 absolute -top-10 md:-top-16 lg:-top-20 -left-1 md:-left-4 group-hover:text-[#ec6d13]/10 transition-colors leading-none select-none"
                  style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10">
                  <h4 className="text-lg md:text-xl font-bold mb-5 md:mb-6 tracking-tight">
                    {step.title}
                  </h4>
                  <div className="aspect-video bg-[#e5e1d8] mb-6 overflow-hidden">
                    {heroImages[i + 4] && (
                      <img
                        src={heroImages[i + 4]}
                        alt={step.title}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                      />
                    )}
                  </div>
                  <p className="text-[#2c2c2c]/60 text-sm md:text-base leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 7: Selected Pieces ═══ */}
      <section className="py-20 md:py-28 lg:py-32 px-5 md:px-8 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <p className="text-[#ec6d13] font-bold uppercase tracking-[0.35em] md:tracking-[0.4em] text-[10px] mb-3">
                Catalogo Editorial
              </p>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl italic leading-tight">
                Piezas de este taller
              </h3>
            </div>
            {currentShop?.shopSlug && (
              <Link
                to={`/tienda/${currentShop.shopSlug}`}
                className="group inline-flex items-center gap-3 text-[11px] md:text-xs font-bold tracking-widest uppercase pb-1 hover:text-[#ec6d13] transition-colors self-start md:self-end"
              >
                <span>Ver coleccion completa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] bg-[#e5e1d8] mb-5" />
                  <div className="h-3 bg-[#e5e1d8] w-2/3 mb-2" />
                  <div className="h-3 bg-[#e5e1d8] w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
              {products.slice(0, 8).map((product) => {
                const imageUrl = getPrimaryImageUrl(product);
                const price = getProductPrice(product);
                const technique = getTechniqueName(product);
                const stock = getProductStock(product);
                const wished = isInWishlist(product.id);

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group"
                  >
                    <div className="aspect-[4/5] bg-[#e5e1d8] mb-5 relative overflow-hidden">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                            stock === 0 ? "grayscale" : ""
                          }`}
                          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                        />
                      )}
                      {stock === 0 && (
                        <div className="absolute top-3 left-0 bg-[#2c2c2c] text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
                          Agotado
                        </div>
                      )}
                      <button
                        type="button"
                        aria-label={wished ? "Quitar de favoritos" : "Guardar en favoritos"}
                        className={`absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center transition-all ${
                          wished
                            ? "opacity-100 scale-100 text-[#ec6d13]"
                            : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 text-[#2c2c2c] hover:text-[#ec6d13]"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        disabled={wishlistLoading}
                      >
                        <Heart className={`w-4 h-4 ${wished ? "fill-[#ec6d13]" : ""}`} />
                      </button>
                      <div className="absolute inset-0 bg-[#ec6d13]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-[#2c2c2c]/40 uppercase tracking-widest font-bold">
                        {technique ? `${technique} • ` : ""}{location || shopName}
                      </p>
                      <h4 className="font-bold text-sm md:text-base leading-snug group-hover:text-[#ec6d13] transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-[#ec6d13] font-black tracking-tight text-sm pt-1">
                        {price ? formatCurrency(price) : "Consultar"}
                      </p>
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

      {/* ═══ Section 8: Fair Trade ═══ */}
      <section className="py-20 md:py-28 lg:py-32 bg-[#f9f7f2] border-t border-[#2c2c2c]/5">
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#ec6d13]/10 text-[#ec6d13] mb-8 md:mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 md:w-7 md:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.48 4.48 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </div>
          <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 italic leading-tight">
            Compromiso Etico y Comercio Justo
          </h3>
          <p className="text-base md:text-xl lg:text-2xl text-[#2c2c2c]/60 font-light leading-relaxed mb-10 md:mb-12">
            Creemos en un modelo donde el valor se distribuye equitativamente.
            Cada compra apoya directamente la economia de las familias
            artesanas
            {location ? ` de ${location}` : " de Colombia"}.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12 text-[9px] font-bold uppercase tracking-[0.25em] md:tracking-[0.3em] text-[#2c2c2c]/40">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />
              100% Hecho a Mano
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />
              Pago Justo Directo
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />
              Impacto Sostenible
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtisanProfile;
