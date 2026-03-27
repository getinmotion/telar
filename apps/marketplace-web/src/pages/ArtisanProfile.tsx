import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { useProducts } from "@/contexts/ProductsContext";
import { ProductCard } from "@/components/ProductCard";
import { formatCurrency } from "@/lib/currencyUtils";

// ── Fallback editorial data ──────────────────────────────
interface ArtisanEditorial {
  tagline: string;
  profileNumber: string;
  heroSubtitle: string;
  story: string[];
  quote: string;
  storyOverlayLabel: string;
  storyOverlayText: string;
  techniques: { name: string; description: string }[];
  originTitle: string;
  originDescription: string;
  process: { title: string; placeholder: string; description: string }[];
  registryId: string;
  registryLabel: string;
}

const DEFAULT_EDITORIAL: ArtisanEditorial = {
  tagline: "Maestros Artesanos / Colombia",
  profileNumber: "001",
  heroSubtitle:
    "Un legado de tradición y memoria en el corazón de Colombia.",
  story: [
    "Un taller donde el tiempo se mide en pasadas de trama y urdimbre, donde cada pieza es una conversación entre la tradición y el presente.",
    "Desde hace generaciones, esta familia ha custodiado el secreto de las técnicas ancestrales, asegurando que la herencia cultural continúe vibrando en cada pieza contemporánea.",
  ],
  quote:
    '"Cada hilo cuenta una historia de resistencia y belleza cultural, transformando fibras naturales en obras de arte."',
  storyOverlayLabel: "Tradición Viva",
  storyOverlayText: "Generaciones de maestros artesanos.",
  techniques: [
    {
      name: "Técnica Principal",
      description:
        "Técnica ancestral para la creación de piezas únicas, donde la fuerza y la precisión se encuentran en cada detalle.",
    },
    {
      name: "Técnica Secundaria",
      description:
        "Detalles finos y acabados de lujo que aportan textura, movimiento y una sofisticación única a las piezas.",
    },
  ],
  originTitle: "Colombia",
  originDescription:
    "Reconocido como cuna de la artesanía colombiana. Una tierra donde la tradición y la creatividad se encuentran en cada rincón.",
  process: [
    {
      title: "Selección de Materiales",
      placeholder: "Fase 1: Materia Prima",
      description:
        "Elegimos cuidadosamente los materiales naturales, priorizando la calidad y la sostenibilidad local.",
    },
    {
      title: "Preparación y Montaje",
      placeholder: "Fase 2: Geometría",
      description:
        "Se preparan las herramientas y el espacio, un proceso meticuloso que define el carácter de la pieza.",
    },
    {
      title: "Creación Maestra",
      placeholder: "Fase 3: Ejecución",
      description:
        "Días de trabajo manual donde el artesano imprime su alma en cada centímetro, creando piezas irrepetibles.",
    },
  ],
  registryId: "TLR-00000-2024",
  registryLabel: "Certificado de Autenticidad TELAR",
};

// ── Component ────────────────────────────────────────────
const ArtisanProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentShop, fetchShopBySlug, loading: shopLoading } = useArtisanShops();
  const { products, fetchProductsByShop, loading: productsLoading } = useProducts();

  // Fetch shop by slug
  useEffect(() => {
    if (slug) {
      fetchShopBySlug(slug).catch(() => {});
    }
  }, [slug]);

  // Fetch products when shop loads
  useEffect(() => {
    if (currentShop?.id) {
      fetchProductsByShop(currentShop.id).catch(() => {});
    }
  }, [currentShop?.id]);

  // Use shop data or fallback
  const shopName = currentShop?.shopName ?? slug?.replace(/-/g, " ") ?? "Artesano";
  const nameParts = shopName.split(" ");
  const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(" ");
  const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(" ");
  const location = currentShop
    ? [currentShop.municipality, currentShop.department].filter(Boolean).join(", ")
    : "";
  const craftType = currentShop?.craftType ?? "Artesanía";
  const story = currentShop?.story ?? "";
  const editorial = DEFAULT_EDITORIAL;

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen overflow-x-hidden">
      {/* Section 1: Editorial Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-end pb-16 pt-12 md:pt-0">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-slate-200/40 z-0 overflow-hidden">
          {currentShop?.bannerUrl ? (
            <img
              src={currentShop.bannerUrl}
              alt={shopName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif italic text-xl">
              Retrato del Taller
            </div>
          )}
        </div>
        <div className="max-w-[1440px] mx-auto px-8 w-full relative z-10">
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-12 lg:col-span-9">
              <p className="text-primary font-extrabold tracking-[0.5em] uppercase mb-6 text-[11px]">
                {editorial.tagline}
              </p>
              <h1
                className="font-serif italic font-bold leading-[0.85] text-charcoal mb-8"
                style={{ fontSize: "clamp(3.5rem, 12vw, 12rem)", letterSpacing: "-0.04em" }}
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
            <div className="col-span-12 lg:col-span-4 border-l-2 border-primary pl-8 py-1">
              <div className="grid grid-cols-1 gap-4">
                {location && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 mb-1">
                      Ubicación
                    </p>
                    <p className="font-bold text-base">{location}</p>
                  </div>
                )}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 mb-1">
                    Técnica Principal
                  </p>
                  <p className="font-bold text-base">{craftType}</p>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8 flex justify-end">
              <div className="max-w-md text-right">
                <p className="text-[10px] tracking-widest uppercase font-bold text-charcoal/40 mb-2">
                  Perfil del Artesano {editorial.profileNumber}
                </p>
                <p className="text-lg leading-relaxed text-slate-600 font-light italic">
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
            <div className="col-span-12 lg:col-span-1">
              <span
                className="font-serif text-6xl text-primary/10 select-none"
                style={{ writingMode: "vertical-rl" }}
              >
                HISTORIA
              </span>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <h2 className="font-serif text-5xl md:text-6xl mb-10 italic leading-tight">
                La historia del taller
              </h2>
              <div className="space-y-8 text-xl leading-[1.6] text-slate-800 font-light">
                {story ? (
                  <p>
                    {story.split("\n").map((paragraph, i) => (
                      <span key={i}>
                        {paragraph}
                        {i < story.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ) : (
                  editorial.story.map((p, i) => (
                    <p key={i}>
                      {i === 0 && currentShop?.shopName ? (
                        <>
                          El taller de{" "}
                          <span className="font-bold text-charcoal">
                            {currentShop.shopName}
                          </span>{" "}
                          {p}
                        </>
                      ) : (
                        p
                      )}
                    </p>
                  ))
                )}
                <p className="italic font-serif text-3xl md:text-4xl text-primary py-8 border-y border-primary/20 leading-snug">
                  {editorial.quote}
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 pt-12 lg:pt-24">
              <div className="aspect-[4/5] bg-slate-100 relative max-w-sm mx-auto lg:ml-auto">
                {currentShop?.logoUrl ? (
                  <img
                    src={currentShop.logoUrl}
                    alt={shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300 italic text-sm">
                    Vida en el Taller
                  </div>
                )}
                <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-charcoal text-white p-8 flex flex-col justify-center">
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-4 text-primary font-bold">
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

      {/* Section 3: Craftsmanship Techniques */}
      <section className="py-24 md:py-32 px-8 bg-editorial-bg">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16">
            <p className="text-primary font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
              Saber-hacer
            </p>
            <h3 className="font-serif text-6xl md:text-7xl mb-6 leading-none">
              Técnica Artesanal
            </h3>
          </div>
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            {editorial.techniques.map((tech, i) => (
              <div
                key={tech.name}
                className={`col-span-12 lg:col-span-5 ${
                  i === 1 ? "lg:col-start-8 lg:mt-32" : ""
                }`}
              >
                <div className="aspect-[16/10] bg-slate-200 mb-8" />
                <div className="flex items-start justify-between border-t border-charcoal/10 pt-6">
                  <div>
                    <h4 className="font-serif text-3xl mb-4">
                      {tech.name}
                    </h4>
                    <p className="text-slate-600 text-base leading-relaxed font-light max-w-sm">
                      {tech.description}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-primary">
                    arrow_outward
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Cultural Origin - Dark Banner */}
      <section className="bg-charcoal py-32 md:py-48 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center">
          <div className="text-[20rem] font-black text-white leading-none">
            ORIGEN
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <p className="text-primary font-bold tracking-[0.6em] uppercase mb-8 text-[10px]">
            Ubicación Geográfica
          </p>
          <h3 className="font-serif text-6xl md:text-7xl text-cream mb-10 italic leading-tight">
            {location || editorial.originTitle}
          </h3>
          <p className="text-xl text-slate-400 leading-[1.8] font-light mb-12 max-w-2xl mx-auto">
            {editorial.originDescription}
          </p>
          <button className="group relative overflow-hidden border border-primary text-primary px-12 py-4 text-xs font-bold tracking-[0.3em] uppercase transition-all">
            <span className="relative z-10 group-hover:text-white transition-colors">
              Explorar la Región
            </span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </section>

      {/* Section 5: Creation Process */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-slate-100 pb-8 gap-4">
            <h3 className="font-serif text-5xl md:text-6xl italic">
              Cómo se crea cada pieza
            </h3>
            <p className="text-slate-400 text-[10px] tracking-widest uppercase mb-1">
              El camino de la fibra
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-16 lg:gap-24">
            {editorial.process.map((step, i) => (
              <div
                key={step.title}
                className={`relative group ${
                  i === 1 ? "lg:mt-16" : i === 2 ? "lg:mt-32" : ""
                }`}
              >
                <span className="font-serif text-[8rem] font-bold text-primary/5 absolute -top-20 -left-4 group-hover:text-primary/10 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-6 tracking-tight">
                    {step.title}
                  </h4>
                  <div className="aspect-video bg-slate-50 mb-6 flex items-center justify-center text-slate-300 text-sm italic">
                    {step.placeholder}
                  </div>
                  <p className="text-slate-500 text-base leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Digital Traceability */}
      <section className="py-24 md:py-32 px-8 bg-editorial-bg border-y border-charcoal/5">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-12 items-center gap-12 lg:gap-24">
            <div className="col-span-12 lg:col-span-7">
              <div className="inline-flex items-center gap-4 mb-8">
                <span className="w-10 h-[1px] bg-primary" />
                <span className="text-primary text-[9px] font-extrabold tracking-[0.4em] uppercase">
                  Certificación de Autoría Digital
                </span>
              </div>
              <h3
                className="font-serif text-6xl md:text-7xl mb-8 leading-[1]"
                style={{ letterSpacing: "-0.04em" }}
              >
                Huella Digital del Artesano
              </h3>
              <div className="space-y-6 text-xl leading-relaxed text-slate-600 font-light max-w-2xl">
                <p>
                  Cada pieza es una obra de autor única. Nuestro sistema
                  de trazabilidad garantiza que el legado de{" "}
                  <span className="text-charcoal font-bold underline decoration-primary/30 underline-offset-8">
                    {shopName}
                  </span>{" "}
                  se preserve intacto desde su taller hasta su hogar.
                </p>
                <p>
                  A través de tecnología de registro seguro, aseguramos la
                  autenticidad y el reconocimiento directo al maestro
                  artesano por su inestimable propiedad intelectual y
                  cultural.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="p-3 bg-white shadow-lg">
                  <span className="material-symbols-outlined text-5xl text-charcoal">
                    qr_code_2
                  </span>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase font-bold text-charcoal mb-1">
                    Verificación Inmediata
                  </p>
                  <p className="text-xs text-slate-400">
                    Escanee la etiqueta de su pieza para
                    <br />
                    acceder al registro histórico.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 flex justify-end">
              <div className="w-full max-w-md bg-white p-12 shadow-2xl relative overflow-hidden border border-slate-50">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
                <div className="flex justify-center mb-10">
                  <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center p-2">
                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        verified
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center mb-12">
                  <p className="font-serif text-3xl mb-3 italic text-charcoal">
                    Registro No. 2024-BSJ
                  </p>
                  <p className="text-[9px] tracking-[0.4em] uppercase text-slate-400 font-bold">
                    {editorial.registryLabel}
                  </p>
                </div>
                <div className="space-y-4 border-t border-slate-50 pt-8">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
                      Maestro Artesano
                    </span>
                    <span className="font-bold text-xs tracking-widest">
                      {shopName.toUpperCase()}
                    </span>
                  </div>
                  {location && (
                    <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                      <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
                        Ubicación Origen
                      </span>
                      <span className="font-bold text-xs tracking-widest">
                        {location.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
                      Identificador
                    </span>
                    <span className="font-bold text-xs tracking-widest">
                      {editorial.registryId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Products */}
      <section className="py-24 md:py-32 px-8 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-3">
                Catálogo Editorial
              </p>
              <h3 className="font-serif text-5xl md:text-6xl italic">
                Piezas creadas por este taller
              </h3>
            </div>
            {currentShop?.shopSlug && (
              <Link
                to={`/tienda/${currentShop.shopSlug}`}
                className="group inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase pb-1"
              >
                <span>Ver colección completa</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  trending_flat
                </span>
              </Link>
            )}
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-slate-100 mb-5 rounded" />
                  <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 text-sm font-sans">
                Próximamente se mostrarán las piezas de este taller.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 8: Fair Trade Statement */}
      <section className="py-24 md:py-32 bg-editorial-bg border-t border-charcoal/5">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-10">
            <span className="material-symbols-outlined text-3xl">
              handshake
            </span>
          </div>
          <h3 className="font-serif text-5xl md:text-6xl mb-8 italic">
            Compromiso Ético y Comercio Justo
          </h3>
          <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed mb-12">
            Creemos en un modelo donde el valor se distribuye
            equitativamente. Cada compra apoya directamente la economía de
            las familias artesanas
            {location ? ` de ${location}` : " de Colombia"}.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
              100% Hecho a Mano
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
              Pago Justo Directo
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
              Impacto Sostenible
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtisanProfile;
