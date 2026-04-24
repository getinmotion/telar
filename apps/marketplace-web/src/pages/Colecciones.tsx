/**
 * Colecciones — Editorial Collections Archive
 * Route: /colecciones
 * Curated selections that explore materiality and the soul of Colombian craftsmanship.
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  getTechniqueName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";

// ── Editorial metadata per curatorial collection ─────
interface CollectionEditorial {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  layout: "wide" | "dark" | "centered";
  ctaLabel: string;
  /** Optional: override the preview image with a curated URL (e.g. S3) */
  heroImage?: string;
}

// S3 gallery reused for the La Chamba featured card
const CHAMBA_HERO_IMAGE =
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/vajilla_n/VAJILLA%20NEGRA%20-%201.jpg";

const COLLECTION_EDITORIAL: CollectionEditorial[] = [
  {
    slug: "ceramica-de-la-chamba",
    title: "El Legado del Barro Negro",
    subtitle: "Colección Principal",
    description:
      "La Chamba, Tolima: más de 300 años de tradición alfarera a orillas del Magdalena. Herencia Pijao, liderazgo femenino y Denominación de Origen reconocida mundialmente.",
    layout: "wide",
    ctaLabel: "Entrar en la colección",
    heroImage: CHAMBA_HERO_IMAGE,
  },
  {
    slug: "tejeduria-de-san-jacinto",
    title: "Donde la Hamaca se Teje con Notas de Gaita",
    subtitle: "Selección Editorial",
    description:
      "El legado textil de San Jacinto, Bolívar: hamacas grandes tejidas en telar vertical por herederas del Reino Finzenú, al ritmo de gaitas y cumbia.",
    layout: "dark",
    ctaLabel: "Entrar en la selección",
  },
  {
    slug: "tejeduria-wayuu",
    title: "Ancestría Geométrica",
    subtitle: "Curada por TELAR",
    description:
      "El mapa de una cultura trazado en hilos. Una gramática de simetría y cosmogonía ancestral donde cada rombo cuenta una historia de territorio.",
    layout: "centered",
    ctaLabel: "Entrar en la colección",
  },
  {
    slug: "ceramica-de-raquira",
    title: "Barros del Altiplano",
    subtitle: "Selección Editorial",
    description:
      "La tradición alfarera de Ráquira transformada en objetos que dialogan entre lo ancestral y lo contemporáneo. Acabados terracota que cuentan siglos de historia.",
    layout: "wide",
    ctaLabel: "Explorar la selección",
  },
  {
    slug: "sombrero-vueltiao",
    title: "Trenzados del Sinú",
    subtitle: "Curada por TELAR",
    description:
      "La caña flecha se convierte en arte a través de las manos del pueblo Zenú. Geometría precisa que codifica cosmovisiones ancestrales en cada trenzado.",
    layout: "dark",
    ctaLabel: "Ver la colección",
  },
  {
    slug: "mopa-mopa-barniz-de-pasto",
    title: "Resinas de la Selva",
    subtitle: "Patrimonio UNESCO",
    description:
      "Una técnica prehispánica que transforma resinas selváticas en láminas de color. El barniz de Pasto es alquimia pura entre naturaleza y mano humana.",
    layout: "centered",
    ctaLabel: "Descubrir la colección",
  },
];

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function getEditorial(slug: string): CollectionEditorial | null {
  return COLLECTION_EDITORIAL.find((c) => c.slug === slug) ?? null;
}

// ── Seasonal collections (static editorial) ──────────
const SEASONAL = [
  {
    title: "Palmas del Atlántico",
    description: "Tejeduría en iraca para la mesa contemporánea.",
    cta: "Adquirir piezas",
  },
  {
    title: "Luz de Mompox",
    description: "Plata transformada en encaje eterno.",
    cta: "Ver selección",
  },
  {
    title: "Urdimbres del Sur",
    description: "Lanas de oveja teñidas naturalmente.",
    cta: "Explorar piezas",
  },
  {
    title: "Alquimia de Barro",
    description: "Formas ancestrales que abrazan el fuego.",
    cta: "Adquirir ahora",
  },
];

export default function Colecciones() {
  const { curatorialCategories, techniques, loading } = useTaxonomy();
  const [products, setProducts] = useState<ProductNewCore[]>([]);

  useEffect(() => {
    getProductsNew({ page: 1, limit: 200 })
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        setProducts(data as ProductNewCore[]);
      })
      .catch(() => {});
  }, []);

  // Build enriched collections from curatorial categories
  const collections = useMemo(() => {
    return curatorialCategories.map((cat) => {
      const slug = nameToSlug(cat.name);
      const editorial = getEditorial(slug);
      // Count products with this curatorial category
      const matchingProducts = products.filter(
        (p) => p.artisanalIdentity?.curatorialCategory?.id === cat.id,
      );
      return {
        ...cat,
        slug,
        editorial,
        productCount: matchingProducts.length,
        previewProducts: matchingProducts.slice(0, 2),
      };
    });
  }, [curatorialCategories, products]);

  // Collections with editorial content get featured treatment, ordered by
  // the explicit sequence declared in COLLECTION_EDITORIAL (La Chamba first).
  const editorialOrder = COLLECTION_EDITORIAL.map((e) => e.slug);
  const featured = collections
    .filter((c) => c.editorial)
    .sort(
      (a, b) =>
        editorialOrder.indexOf(a.slug) - editorialOrder.indexOf(b.slug),
    );
  const remaining = collections.filter((c) => !c.editorial);

  // Territory + technique data for the archive nav
  const techniqueNames = techniques.slice(0, 6).map((t) => t.name);

  return (
    <>
      <Helmet>
        <title>Colecciones — TELAR</title>
        <meta
          name="description"
          content="Selecciones curadas que exploran la materialidad y el alma de la artesanía colombiana."
        />
      </Helmet>

      <div className="bg-[#f9f7f2] text-[#2c2c2c] min-h-screen">
        {/* ═══════════════ HERO ═══════════════ */}
        <header className="max-w-[1400px] mx-auto px-6 pt-12 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#ec6d13] font-bold">
                  Curaduría / Colecciones
                </p>
                <h1 className="text-5xl md:text-6xl font-serif leading-[0.95] italic tracking-tight">
                  Mundos tejidos,
                  <br />
                  historias que habitan
                </h1>
              </div>
              <p className="text-lg md:text-xl text-[#2c2c2c]/70 leading-relaxed font-light italic max-w-lg">
                Descubre selecciones curadas que exploran la materialidad y el
                alma de la artesanía colombiana.
              </p>
              <div className="pt-2">
                <Link
                  to="/productos"
                  className="inline-block px-8 py-4 bg-[#ec6d13] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-colors duration-300"
                >
                  Explorar todas las piezas
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <img
                src={CHAMBA_HERO_IMAGE}
                alt="Colecciones — La Chamba"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* ═══════════════ FEATURED COLLECTIONS ═══════════════ */}
        <section className="space-y-24 md:space-y-40 mb-32 md:mb-48 max-w-[1400px] mx-auto px-6">
          {featured.map((col) => {
            const ed = col.editorial!;
            const previewImg =
              ed.heroImage ??
              (col.previewProducts[0] &&
                getPrimaryImageUrl(col.previewProducts[0]));

            if (ed.layout === "wide") {
              return (
                <div key={col.id} className="space-y-8">
                  {previewImg ? (
                    <img
                      src={previewImg}
                      alt={ed.title}
                      className="aspect-[21/9] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[21/9] w-full bg-[#e5e1d8]" />
                  )}
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-px w-8 bg-[#ec6d13]" />
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#ec6d13] font-bold">
                        {ed.subtitle}
                      </p>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
                      {ed.title}
                    </h2>
                    <p className="text-[#2c2c2c]/70 text-xl md:text-2xl leading-relaxed mb-10 font-light italic">
                      {ed.description}
                    </p>
                    <Link
                      to={`/coleccion/${col.slug}`}
                      className="inline-block px-10 py-5 bg-[#2c2c2c] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#ec6d13] transition-all duration-300"
                    >
                      {ed.ctaLabel}
                    </Link>
                  </div>
                </div>
              );
            }

            if (ed.layout === "dark") {
              return (
                <div
                  key={col.id}
                  className="relative -mx-6 md:-mx-12 px-6 md:px-12 py-20 md:py-28 bg-[#1a1a1a] text-[#f9f7f2]"
                >
                  <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-10 md:gap-12 items-center">
                    <div className="lg:col-span-5 space-y-8 md:space-y-10">
                      <div className="space-y-6">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f9f7f2]/40 font-bold">
                          {ed.subtitle}
                        </p>
                        <h2 className="text-5xl md:text-6xl font-serif leading-tight">
                          {ed.title}
                        </h2>
                        <p className="text-[#f9f7f2]/70 text-lg md:text-xl leading-relaxed font-light italic">
                          {ed.description}
                        </p>
                      </div>
                      <Link
                        to={`/coleccion/${col.slug}`}
                        className="inline-block px-10 py-5 border-2 border-[#f9f7f2] text-[#f9f7f2] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#f9f7f2] hover:text-[#1a1a1a] transition-all duration-300"
                      >
                        {ed.ctaLabel}
                      </Link>
                    </div>
                    <div className="lg:col-start-7 lg:col-span-6">
                      {previewImg ? (
                        <img
                          src={previewImg}
                          alt={ed.title}
                          className="aspect-[3/4] w-full object-cover border border-[#f9f7f2]/10"
                        />
                      ) : (
                        <div className="aspect-[3/4] w-full bg-[#2a2a2a] border border-[#f9f7f2]/10" />
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // centered layout
            return (
              <div key={col.id} className="lg:col-start-2 lg:col-span-10">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt={ed.title}
                    className="aspect-[16/7] w-full object-cover mb-10 md:mb-12"
                  />
                ) : (
                  <div className="aspect-[16/7] w-full bg-[#e5e1d8] mb-10 md:mb-12" />
                )}
                <div className="text-center max-w-3xl mx-auto space-y-6 md:space-y-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#2c2c2c]/40 font-bold">
                    {ed.subtitle}
                  </p>
                  <h2 className="text-5xl font-serif leading-tight italic">
                    {ed.title}
                  </h2>
                  <p className="text-[#2c2c2c]/70 text-lg leading-relaxed font-light italic">
                    {ed.description}
                  </p>
                  <div className="pt-4">
                    <Link
                      to={`/coleccion/${col.slug}`}
                      className="inline-block px-10 py-5 bg-[#2c2c2c] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#ec6d13] transition-all duration-300"
                    >
                      {ed.ctaLabel}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ═══════════════ THE ARCHIVE NAV ═══════════════ */}
        <section className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 border-y border-[#2c2c2c]/10">
          <div className="mb-16 md:mb-20">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 opacity-40">
              El Archivo del Saber
            </h3>
            <p className="text-3xl font-serif italic">
              Navegar por la esencia
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12 md:gap-20">
            {/* Column 1: All collections */}
            <div className="space-y-6 md:space-y-8">
              <h4 className="text-[11px] uppercase tracking-[0.25em] font-extrabold border-b border-[#2c2c2c]/10 pb-4 mb-2">
                Por Colección
              </h4>
              <ul className="space-y-4">
                {remaining.slice(0, 5).map((col) => (
                  <li key={col.id}>
                    <Link
                      to={`/coleccion/${col.slug}`}
                      className="text-xl font-serif hover:italic hover:text-[#ec6d13] transition-all flex items-center justify-between group"
                    >
                      {col.name}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: By territory */}
            <div className="space-y-6 md:space-y-8">
              <h4 className="text-[11px] uppercase tracking-[0.25em] font-extrabold border-b border-[#2c2c2c]/10 pb-4 mb-2">
                Por Territorio
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/territorios"
                    className="text-xl font-serif hover:italic hover:text-[#ec6d13] transition-all flex items-center justify-between group"
                  >
                    Explorar el mapa
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: By technique */}
            <div className="space-y-6 md:space-y-8">
              <h4 className="text-[11px] uppercase tracking-[0.25em] font-extrabold border-b border-[#2c2c2c]/10 pb-4 mb-2">
                Por Técnica
              </h4>
              <div className="flex flex-wrap gap-2">
                {techniqueNames.map((name) => {
                  const slug = nameToSlug(name);
                  return (
                    <Link
                      key={slug}
                      to={`/tecnica/${slug}`}
                      className="px-4 py-2 bg-[#2c2c2c]/[0.03] border border-[#2c2c2c]/5 rounded-full text-[10px] uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] hover:bg-white transition-all"
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ SEASONAL SELECTS ═══════════════ */}
        <section className="max-w-[1400px] mx-auto px-6 py-24 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6">
            <div className="max-w-xl">
              <span className="text-[#ec6d13] font-bold uppercase tracking-widest text-[11px] mb-4 block">
                Actualidad
              </span>
              <h2 className="text-5xl font-serif leading-[1.1]">
                Selecciones de temporada
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 md:gap-y-16">
            {SEASONAL.map((item, i) => {
              const product = products[i * 3];
              const img = product ? getPrimaryImageUrl(product) : null;
              return (
                <div key={item.title} className="space-y-5 group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden relative bg-[#e5e1d8]">
                    {img && (
                      <img
                        src={img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl italic tracking-tight font-serif leading-none">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-[#2c2c2c]/50 leading-relaxed uppercase tracking-widest font-medium">
                      {item.description}
                    </p>
                    <p className="pt-2 text-[10px] font-bold uppercase tracking-widest text-[#ec6d13] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.cta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════ CTA DARK BLOCK ═══════════════ */}
        <section className="bg-[#1a1a1a] py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-12 md:space-y-16 px-6">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[#ec6d13] font-bold">
                El viaje continúa
              </p>
              <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] text-[#f9f7f2] italic">
                El saber hacer es un viaje
                <br />
                que apenas comienza
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-10 md:gap-16">
              <Link to="/productos" className="group flex flex-col items-center gap-4">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#f9f7f2] group-hover:text-[#ec6d13] transition-colors">
                  Explorar piezas
                </span>
                <span className="h-px w-10 bg-[#f9f7f2]/20 group-hover:w-16 group-hover:bg-[#ec6d13] transition-all duration-500" />
              </Link>
              <Link to="/historias" className="group flex flex-col items-center gap-4">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#f9f7f2] group-hover:text-[#ec6d13] transition-colors">
                  Descubrir historias
                </span>
                <span className="h-px w-10 bg-[#f9f7f2]/20 group-hover:w-16 group-hover:bg-[#ec6d13] transition-all duration-500" />
              </Link>
              <Link to="/territorios" className="group flex flex-col items-center gap-4">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#f9f7f2] group-hover:text-[#ec6d13] transition-colors">
                  Conocer territorios
                </span>
                <span className="h-px w-10 bg-[#f9f7f2]/20 group-hover:w-16 group-hover:bg-[#ec6d13] transition-all duration-500" />
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
