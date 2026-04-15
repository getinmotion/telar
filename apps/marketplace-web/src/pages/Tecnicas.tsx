/**
 * Tecnicas — Editorial archive of artisanal techniques
 * Route: /tecnicas
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { useFeaturedProducts, getFeaturedImage, getFeaturedByTechnique } from "@/hooks/useFeaturedProducts";

/* ── Technique editorial metadata ──────────────────── */
interface TechniqueEditorial {
  slug: string;
  tagline: string;
  origin: string;
  description: string;
}

const TECHNIQUE_EDITORIAL: Record<string, TechniqueEditorial> = {
  "telar vertical": {
    slug: "telar-vertical",
    tagline: "Un diálogo entre tensión y paciencia",
    origin: "Boyacá · San Jacinto · Nariño",
    description:
      "El telar vertical es una de las técnicas más antiguas de la humanidad. En Colombia, cada región le imprime su propia identidad a través de materiales, patrones y rituales.",
  },
  "telar horizontal": {
    slug: "telar-horizontal",
    tagline: "Donde la tradición se extiende",
    origin: "Boyacá · Santander",
    description:
      "El telar horizontal permite crear tejidos más anchos y complejos, utilizado ancestralmente para ruanas, cobijas y telas de uso cotidiano.",
  },
  crochet: {
    slug: "crochet",
    tagline: "Nudos que cuentan historias",
    origin: "La Guajira · Cesar · Sucre",
    description:
      "La técnica de crochet, adoptada y transformada por las comunidades Wayúu, da vida a las icónicas mochilas con patrones geométricos únicos.",
  },
  "cestería": {
    slug: "cesteria",
    tagline: "La geometría de la fibra",
    origin: "Putumayo · Amazonas · Guainía",
    description:
      "La cestería transforma fibras vegetales en objetos utilitarios y ceremoniales, conectando al artesano con los ciclos de la naturaleza.",
  },
  "cerámica": {
    slug: "ceramica",
    tagline: "Alquimia de tierra y fuego",
    origin: "Tolima · Boyacá · Nariño",
    description:
      "Del barro negro de La Chamba a la cerámica Ráquira, la arcilla colombiana es un lienzo donde se esculpe la identidad de cada territorio.",
  },
  "talla en madera": {
    slug: "talla-en-madera",
    tagline: "Memoria esculpida en el tiempo",
    origin: "Chocó · Nariño · Quindío",
    description:
      "La talla en madera transforma troncos en objetos de arte que narran mitos, creencias y la relación de las comunidades con su entorno.",
  },
  "orfebrería": {
    slug: "orfebreria",
    tagline: "El resplandor de lo ancestral",
    origin: "Mompox · Barbacoas · Bogotá",
    description:
      "La orfebrería colombiana es heredera de las técnicas precolombinas. El trabajo en filigrana de Mompox es Patrimonio Cultural de la Nación.",
  },
  "barniz de pasto": {
    slug: "barniz-de-pasto",
    tagline: "Resina vegetal, paciencia infinita",
    origin: "Nariño",
    description:
      "El barniz de Pasto o Mopa-Mopa es una técnica única en el mundo: una resina vegetal masticada y estirada en láminas microscópicas sobre madera.",
  },
  bordado: {
    slug: "bordado",
    tagline: "Hilos que narran la vida",
    origin: "Cartago · Boyacá · Sucre",
    description:
      "El bordado colombiano va desde el delicado bordado en tul hasta las coloridas mantas del Caribe, cada puntada es un registro cultural.",
  },
  macramé: {
    slug: "macrame",
    tagline: "Arquitectura de nudos",
    origin: "San Jacinto · Santander",
    description:
      "El macramé transforma cuerdas en hamacas, redes y piezas decorativas mediante una técnica de nudos que requiere precisión milimétrica.",
  },
};

function getEditorial(name: string): TechniqueEditorial {
  const key = name.toLowerCase();
  if (TECHNIQUE_EDITORIAL[key]) return TECHNIQUE_EDITORIAL[key];
  return {
    slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    tagline: "Tradición artesanal colombiana",
    origin: "Colombia",
    description: `${name} es una técnica artesanal que forma parte del patrimonio cultural colombiano, transmitida de generación en generación.`,
  };
}

/* ── Component ──────────────────────────────────────── */
export default function Tecnicas() {
  const { techniques, crafts, loading } = useTaxonomy();
  const { data: featuredProducts } = useFeaturedProducts();
  const [activeCraft, setActiveCraft] = useState<string | null>(null);

  const filteredTechniques = useMemo(() => {
    if (!activeCraft) return techniques;
    return techniques.filter((t: any) => t.craftId === activeCraft);
  }, [techniques, activeCraft]);

  const featured = filteredTechniques.length > 0 ? filteredTechniques[0] : undefined;
  const archiveTechniques = filteredTechniques;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f7f2", color: "#2c2c2c" }}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 pt-16 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b pb-12" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
          <div className="max-w-3xl">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.5em] mb-6 font-sans"
              style={{ color: "#ec6d13" }}
            >
              Archivo de técnicas
            </p>
            <h1 className="text-5xl md:text-7xl font-serif italic leading-[0.9] mb-6" style={{ letterSpacing: "-0.04em" }}>
              El lenguaje silencioso
              <br />
              de las manos
            </h1>
            <p className="text-lg font-light leading-relaxed max-w-xl" style={{ color: "rgba(44,44,44,0.7)" }}>
              Cada técnica artesanal es un idioma propio, transmitido en silencio de generación en generación. Descubra los oficios que dan forma al patrimonio cultural colombiano.
            </p>
          </div>
          <div className="text-right self-end">
            <span className="font-serif text-6xl italic" style={{ color: "rgba(44,44,44,0.08)" }}>
              {techniques.length || "—"}
            </span>
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold font-sans mt-1" style={{ color: "rgba(44,44,44,0.3)" }}>
              Técnicas registradas
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ CRAFT FILTER NAV ═══════════════ */}
      {crafts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 mb-20">
          <nav className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setActiveCraft(null)}
              className={`text-[10px] uppercase tracking-[0.3em] font-bold font-sans pb-1 border-b-2 transition-colors ${
                !activeCraft ? "border-[#ec6d13] text-[#ec6d13]" : "border-transparent text-[#2c2c2c]/40 hover:text-[#2c2c2c]/70"
              }`}
            >
              Todas
            </button>
            {crafts.map((craft) => (
              <button
                key={craft.id}
                onClick={() => setActiveCraft(craft.id)}
                className={`text-[10px] uppercase tracking-[0.3em] font-bold font-sans pb-1 border-b-2 transition-colors ${
                  activeCraft === craft.id ? "border-[#ec6d13] text-[#ec6d13]" : "border-transparent text-[#2c2c2c]/40 hover:text-[#2c2c2c]/70"
                }`}
              >
                {craft.name}
              </button>
            ))}
          </nav>
        </section>
      )}

      {/* ═══════════════ FEATURED TECHNIQUE ═══════════════ */}
      {featured && !activeCraft && (
        <section className="max-w-[1400px] mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
            {/* Image — 65% */}
            <div className="md:col-span-7 aspect-[16/10] relative overflow-hidden" style={{ backgroundColor: "#e5e1d8" }}>
              {(() => {
                const match = getFeaturedByTechnique(featuredProducts, featured.name);
                const imgUrl = match[0]?.imageUrl || getFeaturedImage(featuredProducts, 0);
                return imgUrl ? (
                  <img src={imgUrl} alt={featured.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-7xl font-serif italic" style={{ color: "rgba(44,44,44,0.06)" }}>
                      {featured.name}
                    </span>
                  </div>
                );
              })()}
            </div>
            {/* Info — 35% */}
            <div className="md:col-span-5 p-10 lg:p-14 flex flex-col justify-between" style={{ backgroundColor: "#f5f3ee" }}>
              <div className="space-y-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.5em] font-sans" style={{ color: "#ec6d13" }}>
                  Técnica destacada
                </span>
                <h2 className="text-4xl font-serif italic leading-tight">{featured.name}</h2>
                <p className="text-sm font-light italic leading-relaxed" style={{ color: "rgba(44,44,44,0.6)" }}>
                  {getEditorial(featured.name).tagline}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(44,44,44,0.7)" }}>
                  {getEditorial(featured.name).description}
                </p>
              </div>
              <Link
                to={`/tecnica/${getEditorial(featured.name).slug}`}
                className="inline-flex items-center gap-3 mt-8 text-[10px] font-bold uppercase tracking-widest hover:gap-5 transition-all"
                style={{ color: "#ec6d13" }}
              >
                Explorar técnica <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ DARK QUOTE ═══════════════ */}
      <section className="px-6 py-24 mb-32" style={{ backgroundColor: "#2c2c2c", color: "#f9f7f2" }}>
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-12">
          <span className="text-8xl font-serif italic" style={{ color: "rgba(236,109,19,0.3)" }}>"</span>
          <blockquote className="text-2xl md:text-3xl font-serif italic leading-relaxed max-w-3xl" style={{ color: "rgba(249,247,242,0.9)" }}>
            Las técnicas artesanales no se aprenden en libros. Se heredan en el silencio del taller, en la repetición del gesto, en la paciencia del maestro que observa.
          </blockquote>
        </div>
      </section>

      {/* ═══════════════ ASYMMETRIC GRID ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="flex justify-between items-end mb-12 border-b pb-6" style={{ borderColor: "rgba(44,44,44,0.05)" }}>
          <h2 className="text-4xl font-serif italic">Archivo</h2>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold font-sans" style={{ color: "rgba(44,44,44,0.3)" }}>
            {filteredTechniques.length} técnica{filteredTechniques.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] mb-4 rounded-sm" style={{ backgroundColor: "#e5e1d8" }} />
                <div className="h-4 w-24 rounded mb-2" style={{ backgroundColor: "#e5e1d8" }} />
                <div className="h-6 w-40 rounded" style={{ backgroundColor: "#e5e1d8" }} />
              </div>
            ))}
          </div>
        ) : archiveTechniques.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {archiveTechniques.map((tech, i) => {
              const editorial = getEditorial(tech.name);
              // Asymmetric: every 4th item spans 2 cols
              const isWide = i % 4 === 0 && i > 0;
              return (
                <Link
                  key={tech.id}
                  to={`/tecnica/${editorial.slug}`}
                  className={`group block ${isWide ? "md:col-span-2" : ""}`}
                >
                  <div
                    className={`${isWide ? "aspect-[21/9]" : "aspect-[4/3]"} mb-6 relative overflow-hidden rounded-sm`}
                    style={{ backgroundColor: "#e5e1d8" }}
                  >
                    {(() => {
                      const match = getFeaturedByTechnique(featuredProducts, tech.name);
                      const imgUrl = match[0]?.imageUrl || getFeaturedImage(featuredProducts, i);
                      return imgUrl ? (
                        <img src={imgUrl} alt={tech.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-4xl md:text-5xl font-serif italic opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500">
                              {tech.name}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="space-y-2">
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.4em] font-sans"
                      style={{ color: "#ec6d13" }}
                    >
                      {editorial.origin}
                    </span>
                    <h3 className="text-2xl font-serif italic group-hover:text-[#ec6d13] transition-colors">
                      {tech.name}
                    </h3>
                    <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(44,44,44,0.6)" }}>
                      {editorial.tagline}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-lg italic opacity-60">No se encontraron técnicas para este filtro.</p>
        )}
      </section>

      {/* ═══════════════ METRICS ═══════════════ */}
      <section className="px-6 py-24" style={{ backgroundColor: "#f5f3ee" }}>
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <span className="text-4xl font-serif italic" style={{ color: "#ec6d13" }}>{techniques.length || "—"}</span>
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold font-sans mt-2" style={{ color: "rgba(44,44,44,0.4)" }}>
              Técnicas
            </p>
          </div>
          <div>
            <span className="text-4xl font-serif italic" style={{ color: "#ec6d13" }}>{crafts.length || "—"}</span>
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold font-sans mt-2" style={{ color: "rgba(44,44,44,0.4)" }}>
              Oficios
            </p>
          </div>
          <div>
            <span className="text-4xl font-serif italic" style={{ color: "#ec6d13" }}>6</span>
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold font-sans mt-2" style={{ color: "rgba(44,44,44,0.4)" }}>
              Territorios
            </p>
          </div>
          <div>
            <span className="text-4xl font-serif italic" style={{ color: "#ec6d13" }}>∞</span>
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold font-sans mt-2" style={{ color: "rgba(44,44,44,0.4)" }}>
              Generaciones
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section
        className="px-6 py-32 flex flex-col items-center text-center gap-10"
        style={{ backgroundColor: "#2c2c2c", color: "#fff" }}
      >
        <h2 className="text-4xl md:text-5xl font-serif italic max-w-3xl leading-tight">
          Cada técnica es un universo por descubrir
        </h2>
        <p className="text-base font-light max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          Explore las piezas creadas con estas técnicas ancestrales y lleve a casa un fragmento de la tradición colombiana.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            to="/productos"
            className="px-12 py-4 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#2c2c2c] transition-all"
            style={{ backgroundColor: "#ec6d13" }}
          >
            Explorar piezas
          </Link>
          <Link
            to="/territorios"
            className="px-12 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Ver territorios
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
