/**
 * Tecnicas — Archivo Maestro de Técnicas
 * Route: /tecnicas
 * Reference: telar_archivo_de_t_cnicas_versi_n_maestra_final
 *
 * Editorial archive with a dominant featured technique, a philosophy quote,
 * and an asymmetric composition for the rest of the archive.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Footer } from "@/components/Footer";
import {
  useProductImagesByTechnique,
  getTechniqueImage,
} from "@/hooks/useProductImagesByTechnique";
import { useCmsSections } from "@/hooks/useCmsSections";
import { useTechniquesWithProductCount } from "@/hooks/useTechniquesWithProductCount";
import { CmsSectionRenderer } from "@/components/cms/CmsSectionRenderer";
import { techniqueToSlug } from "@/lib/techniqueSlug";
import type { CmsSection } from "@/services/cms-sections.actions";

/* ── Editorial metadata per technique (fallback for names not here) ── */
interface TechniqueEditorial {
  slug: string;
  tagline: string;
  origin: string; // "Región · Oficio"
  region: string;
  craftLabel: string;
  description: string;
  pieces: number;
  masters: number;
  mastery: "Baja" | "Media" | "Alta" | "Extrema" | "Ancestral";
  hours?: number;
}

const TECHNIQUE_EDITORIAL: Record<string, TechniqueEditorial> = {
  "tejido plano": {
    slug: "tejido-plano",
    tagline: "Un diálogo entre tensión y paciencia.",
    origin: "Boyacá · Textil",
    region: "Boyacá",
    craftLabel: "Textil",
    description:
      "El tejido plano es una de las técnicas más antiguas de la humanidad. En Colombia, cada región le imprime su identidad a través de materiales, patrones y rituales en el telar.",
    pieces: 137,
    masters: 18,
    mastery: "Alta",
    hours: 210,
  },
  tallado: {
    slug: "tallado",
    tagline: "El alma de la madera revelada a cincel.",
    origin: "Chocó · Madera",
    region: "Chocó",
    craftLabel: "Madera",
    description:
      "El tallado transforma bloques de madera en esculturas, máscaras y objetos rituales. En el Pacífico colombiano, los talladores dan forma a la cosmogonía afrocolombiana e indígena con gubias y formones.",
    pieces: 19,
    masters: 6,
    mastery: "Alta",
  },
  "tejido en chaquira": {
    slug: "tejido-en-chaquira",
    tagline: "Nudos que cuentan historias en cuentas de color.",
    origin: "La Guajira · Tejeduría",
    region: "La Guajira",
    craftLabel: "Tejeduría",
    description:
      "El tejido en chaquira ensarta diminutas cuentas de vidrio para crear manillas, collares y objetos ceremoniales con patrones geométricos que codifican la cosmovisión de comunidades indígenas.",
    pieces: 8,
    masters: 4,
    mastery: "Alta",
    hours: 180,
  },
  trenzado: {
    slug: "trenzado",
    tagline: "La geometría de la fibra.",
    origin: "Putumayo · Fibras",
    region: "Putumayo",
    craftLabel: "Fibras",
    description:
      "El trenzado transforma fibras vegetales en canastos, esteras y objetos utilitarios y ceremoniales, conectando al artesano con los ciclos de la naturaleza.",
    pieces: 43,
    masters: 11,
    mastery: "Media",
  },
  modelado: {
    slug: "modelado",
    tagline: "Alquimia de tierra y fuego.",
    origin: "Huila · Cerámica",
    region: "Huila",
    craftLabel: "Cerámica",
    description:
      "Del barro negro de La Chamba a la cerámica de Ráquira, el modelado en arcilla es un lienzo donde se esculpe la identidad del territorio colombiano.",
    pieces: 33,
    masters: 10,
    mastery: "Ancestral",
  },
  talla: {
    slug: "talla",
    tagline: "Memoria esculpida en el tiempo.",
    origin: "Caldas · Madera",
    region: "Caldas",
    craftLabel: "Madera",
    description:
      "La talla transforma troncos en objetos de arte que narran mitos, creencias y la relación de las comunidades con su entorno.",
    pieces: 42,
    masters: 9,
    mastery: "Alta",
  },
  filigrana: {
    slug: "filigrana",
    tagline: "El arte de tejer el metal.",
    origin: "Mompox · Joyería",
    region: "Bolívar",
    craftLabel: "Joyería",
    description:
      "Heredera del encuentro entre la orfebrería precolombina y la técnica morisca. Cinco escuelas regionales —Mompox, Santa Fe de Antioquia, Ciénaga de Oro, Quibdó y Barbacoas— tejen hilos de plata y oro sin moldes, a puro pulso.",
    pieces: 12,
    masters: 5,
    mastery: "Extrema",
  },
  calado: {
    slug: "calado",
    tagline: "La filigrana de la madera.",
    origin: "Colombia · Madera",
    region: "Colombia",
    craftLabel: "Madera",
    description:
      "El arte de perforar la madera para que la luz la atraviese. Arquitectura de detalle, mobiliario de autor y una soberanía del oficio que se resiste a la réplica industrial.",
    pieces: 11,
    masters: 4,
    mastery: "Extrema",
  },
  "barniz de pasto": {
    slug: "barniz-de-pasto",
    tagline: "Resina vegetal, paciencia infinita.",
    origin: "Nariño · Madera",
    region: "Nariño",
    craftLabel: "Madera",
    description:
      "Una técnica única en el mundo: resina del Mopa-Mopa masticada y estirada en láminas microscópicas aplicadas a fuego sobre la madera.",
    pieces: 45,
    masters: 8,
    mastery: "Extrema",
  },
  "tejido de punto": {
    slug: "tejido-de-punto",
    tagline: "Hilos que narran la vida.",
    origin: "Cartago · Textil",
    region: "Cartago",
    craftLabel: "Textil",
    description:
      "El tejido de punto entrelaza hilos en bucles sucesivos para crear prendas y accesorios. De las ruanas boyacenses a las mantas del Caribe, cada puntada es un registro cultural.",
    pieces: 26,
    masters: 8,
    mastery: "Alta",
  },
  anudados: {
    slug: "anudados",
    tagline: "Arquitectura de nudos.",
    origin: "San Jacinto · Textil",
    region: "San Jacinto",
    craftLabel: "Textil",
    description:
      "Los anudados transforman cuerdas en hamacas, redes y piezas decorativas mediante nudos que requieren precisión milimétrica y una comprensión profunda de la tensión.",
    pieces: 9,
    masters: 4,
    mastery: "Media",
  },
  "pintado a mano": {
    slug: "pintado-a-mano",
    tagline: "El color como lenguaje ancestral.",
    origin: "Nariño · Decoración",
    region: "Nariño",
    craftLabel: "Decoración",
    description:
      "El pintado a mano aplica pigmentos con pinceles sobre cerámica, madera y textiles, convirtiendo cada pieza en un lienzo irrepetible que refleja la iconografía regional.",
    pieces: 10,
    masters: 4,
    mastery: "Media",
  },
  "textil vegetal": {
    slug: "textil-vegetal",
    tagline: "La selva tejida entre las manos.",
    origin: "Amazonas · Fibras",
    region: "Amazonas",
    craftLabel: "Fibras",
    description:
      "El textil vegetal emplea fibras extraídas de palmas, cortezas y lianas amazónicas para crear telas, bolsos y hamacas que preservan el conocimiento botánico indígena.",
    pieces: 7,
    masters: 3,
    mastery: "Alta",
  },
  esmaltado: {
    slug: "esmaltado",
    tagline: "Fuego y vidrio fundidos en color.",
    origin: "Boyacá · Cerámica",
    region: "Boyacá",
    craftLabel: "Cerámica",
    description:
      "El esmaltado recubre piezas de cerámica o metal con una capa vítrea que, al hornearse, se funde en acabados brillantes y duraderos, protegiendo y embelleciendo el objeto.",
    pieces: 4,
    masters: 2,
    mastery: "Media",
  },
  costura: {
    slug: "costura",
    tagline: "Puntada a puntada, identidad construida.",
    origin: "Atlántico · Textil",
    region: "Atlántico",
    craftLabel: "Textil",
    description:
      "La costura artesanal une telas con aguja e hilo para crear prendas, accesorios y objetos decorativos que llevan el sello del oficio manual y la tradición regional.",
    pieces: 4,
    masters: 2,
    mastery: "Baja",
  },
};

function getEditorial(name: string): TechniqueEditorial {
  const key = name.toLowerCase();
  if (TECHNIQUE_EDITORIAL[key]) return TECHNIQUE_EDITORIAL[key];
  return {
    slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    tagline: "Tradición artesanal colombiana.",
    origin: "Colombia",
    region: "Colombia",
    craftLabel: "Oficio",
    description: `${name} forma parte del patrimonio cultural colombiano, transmitida de generación en generación.`,
    pieces: 40,
    masters: 6,
    mastery: "Media",
  };
}

/* ── Filter dimensions — match the maqueta nav ── */
const FILTER_DIMENSIONS = [
  { key: "all", label: "Todos los oficios" },
  { key: "materia", label: "Materia" },
  { key: "territorio", label: "Territorio" },
  { key: "maestria", label: "Maestría" },
] as const;

type FilterKey = (typeof FILTER_DIMENSIONS)[number]["key"];

const VISIBLE_COUNT = 24;

/* ── Fallback editorial (used when CMS is empty / unreachable) ──────── */
/* Mantener en sync con apps/api/src/resources/cms-sections/seed/tecnicas.seed.ts */
const SLOT_TYPES = new Set([
  "hero",
  "featured_aside_card",
  "metrics_stat",
  "muestra_intro",
  "archive_label",
  "editorial_footer",
]);

const fb = (id: string, position: number, type: string, payload: any): CmsSection => ({
  id,
  pageKey: "tecnicas",
  position,
  type,
  published: true,
  payload,
  createdAt: "",
  updatedAt: "",
});

const FALLBACK_TECNICAS_SECTIONS: CmsSection[] = [
  fb("fb-hero", 0, "hero", {
    kicker: "Archivo Maestro de Técnicas",
    title: "El lenguaje silencioso de las manos.",
    body: "Una cartografía viva del saber hacer colombiano. Documentamos el gesto, la materia y el territorio como pilares de nuestra identidad cultural, conectando la herencia ancestral con el diseño del mañana.",
    totalCountLabel: "Técnicas Documentadas",
  }),
  fb("fb-aside", 1, "featured_aside_card", {
    title: "Archivo Digital de Patrones",
    body: "Acceda a nuestra base de datos de iconografía y patrones técnicos digitalizados para investigación.",
    ctaLabel: "Ver Catálogo",
    ctaHref: "",
  }),
  fb("fb-metrics", 2, "metrics_stat", {
    kicker: "Métricas 2024",
    value: "24",
    caption: "Nuevos talleres registrados en el último trimestre.",
  }),
  fb("fb-quote", 3, "quote", {
    kicker: "Filosofía del Oficio",
    body: "Cada gesto es una forma de resistencia cultural, una huella que el tiempo no ha podido borrar.",
    attribution: "— Manifiesto del Saber Hacer, 2024",
  }),
  fb("fb-muestra", 6, "muestra_intro", {
    kicker: "Muestra de Técnicas",
    title: "Técnicas con piezas disponibles ahora.",
    body: "Solo aparecen técnicas que tienen al menos un producto publicado en Telar. Cada tarjeta abre el detalle de la técnica.",
  }),
  fb("fb-archive-label", 7, "archive_label", {
    kicker: "Exploración del Archivo",
  }),
  fb("fb-footer", 8, "editorial_footer", {
    kicker: "Legado Viviente",
    title: "El archivo del saber hacer es una conversación inacabada.",
    body: "Buscamos no solo preservar, sino activar. Cada técnica documentada aquí es una invitación a la colaboración entre el artesano y el innovador.",
    links: [
      { label: "Talleres", href: "/tiendas" },
      { label: "Piezas", href: "/productos" },
      { label: "Historias", href: "/historias" },
    ],
    asideTitle: "Colabora",
    asideBody: "¿Conoces una técnica que aún no hemos documentado? Ayúdanos a expandir el archivo maestro.",
    asideCtaLabel: "Postular Técnica",
    copyright: "TELAR © 2025 · Colombia",
    edition: "Edición 01: El gesto primordial",
  }),
];

/* ── Component ──────────────────────────────────────── */
export default function Tecnicas() {
  const { techniques, loading } = useTaxonomy();
  const { data: techImages } = useProductImagesByTechnique();
  const { data: cmsSections } = useCmsSections("tecnicas");
  const { data: techWithCount } = useTechniquesWithProductCount();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [visible, setVisible] = useState(VISIBLE_COUNT);

  // Sort list based on the active dimension — purely a re-order for now
  // so the filter chips read as real without breaking the archive.
  const orderedTechniques = useMemo(() => {
    const list = [...techniques];
    switch (activeFilter) {
      case "materia":
        return list.sort((a, b) =>
          getEditorial(a.name).craftLabel.localeCompare(
            getEditorial(b.name).craftLabel,
          ),
        );
      case "territorio":
        return list.sort((a, b) =>
          getEditorial(a.name).region.localeCompare(getEditorial(b.name).region),
        );
      case "maestria": {
        const rank = { Extrema: 0, Ancestral: 1, Alta: 2, Media: 3, Baja: 4 };
        return list.sort(
          (a, b) =>
            rank[getEditorial(a.name).mastery] - rank[getEditorial(b.name).mastery],
        );
      }
      default: {
        // Feature filigrana as the primary; drop alambrismo from the archive
        // so it doesn't outshine the curated técnica.
        const filtered = list.filter(
          (t) => t.name.toLowerCase() !== "alambrismo",
        );
        const figIdx = filtered.findIndex(
          (t) => t.name.toLowerCase() === "filigrana",
        );
        if (figIdx > 0) {
          const [fig] = filtered.splice(figIdx, 1);
          filtered.unshift(fig);
        }
        return filtered;
      }
    }
  }, [techniques, activeFilter]);

  const totalCount = techniques.length || 124;

  // CMS-driven editorial — falls back to baked-in copy on cold start / outage.
  const activeSections =
    cmsSections && cmsSections.length > 0
      ? cmsSections
      : FALLBACK_TECNICAS_SECTIONS;

  const heroSection = activeSections.find((s) => s.type === "hero");
  const featuredAsideCardSection = activeSections.find(
    (s) => s.type === "featured_aside_card",
  );
  const metricsStatSection = activeSections.find(
    (s) => s.type === "metrics_stat",
  );
  const muestraIntroSection = activeSections.find(
    (s) => s.type === "muestra_intro",
  );
  const archiveLabelSection = activeSections.find(
    (s) => s.type === "archive_label",
  );
  const editorialFooterSection = activeSections.find(
    (s) => s.type === "editorial_footer",
  );
  const editorialSections = activeSections.filter(
    (s) => !SLOT_TYPES.has(s.type),
  );

  // Muestra de Técnicas: only API techniques with at least one product.
  const muestraTecnicas = (techWithCount ?? [])
    .filter((t) => t.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount);

  // Split for composition: 1 primary + 1 secondary + 1 wide row feature + 4 thumbs
  const [primary, secondary, ...rest] = orderedTechniques;
  const archiveRow1 = rest.slice(0, 2); // 2 squares bracketing a curator note
  const archiveRowWide = rest.slice(2, 3); // horizontal feature next to data card
  const archiveThumbs = rest.slice(3, 7); // 4 small thumbnails
  const archiveRemaining = rest.slice(7, Math.max(7, visible - 7));

  return (
    <div
      className="min-h-screen font-body"
      style={{ backgroundColor: "#f9f7f2", color: "#1b1c19" }}
    >
      <main className="max-w-[1536px] mx-auto px-8 md:px-16 pt-24">
        {/* ═══════════════ HERO (CMS) ═══════════════ */}
        {heroSection && (
          <CmsSectionRenderer
            section={heroSection}
            totalTechniqueCount={totalCount}
          />
        )}

        {/* ═══════════════ FILTER NAV ═══════════════ */}
        <nav
          className="mb-24 border-b pb-8"
          style={{ borderColor: "rgba(140,114,101,0.2)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-8 md:gap-12 flex-wrap">
              {FILTER_DIMENSIONS.map((dim) => {
                const active = activeFilter === dim.key;
                return (
                  <button
                    key={dim.key}
                    onClick={() => setActiveFilter(dim.key)}
                    className={`text-[10px] uppercase tracking-[0.3em] font-sans font-bold pb-1 transition-all ${
                      active
                        ? "border-b"
                        : "opacity-40 hover:opacity-100"
                    }`}
                    style={{
                      borderColor: active ? "#1b1c19" : "transparent",
                      color: "#1b1c19",
                    }}
                  >
                    {dim.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[10px] uppercase tracking-[0.1em] opacity-40 italic font-sans">
                Mostrando {Math.min(visible, orderedTechniques.length) || 0} /{" "}
                {totalCount}
              </span>
              <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-sans">
                Ordenar por:{" "}
                <span className="font-bold underline underline-offset-4">
                  Relevancia
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* ═══════════════ FEATURED SECTION ═══════════════ */}
        {!loading && primary && (
          <section className="mb-48">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
              {/* Primary — 65% */}
              <div className="lg:w-[65%] group">
                <div
                  className="aspect-[16/10] mb-10 overflow-hidden"
                  style={{ backgroundColor: "#e4e2dd" }}
                >
                  {(() => {
                    const imgUrl = getTechniqueImage(techImages, primary.name);
                    return imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={primary.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span
                          className="font-serif italic text-6xl"
                          style={{ color: "rgba(44,44,44,0.06)" }}
                        >
                          {primary.name}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em] font-bold font-sans"
                      style={{ color: "#ec6d13" }}
                    >
                      {getEditorial(primary.name).region}
                    </span>
                    <span
                      className="w-8 h-[1px]"
                      style={{ backgroundColor: "rgba(140,114,101,0.4)" }}
                    />
                    <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-sans">
                      {getEditorial(primary.name).craftLabel}
                    </span>
                  </div>
                  <h2
                    className="font-serif text-5xl font-bold mb-6"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {primary.name}
                  </h2>
                  <p
                    className="leading-relaxed text-lg mb-8 opacity-90 italic font-serif"
                    style={{ color: "#584237" }}
                  >
                    "{getEditorial(primary.name).tagline}"
                  </p>
                  <div
                    className="grid grid-cols-3 gap-8 border-y py-8 mb-10"
                    style={{ borderColor: "rgba(140,114,101,0.2)" }}
                  >
                    <div>
                      <span className="block text-2xl font-serif font-bold">
                        {getEditorial(primary.name).pieces}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest opacity-60 font-sans">
                        Piezas Únicas
                      </span>
                    </div>
                    <div>
                      <span className="block text-2xl font-serif font-bold">
                        {getEditorial(primary.name).masters}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest opacity-60 font-sans">
                        Talleres Maestros
                      </span>
                    </div>
                    <div>
                      <span className="block text-2xl font-serif font-bold">
                        {getEditorial(primary.name).mastery}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest opacity-60 font-sans">
                        Complejidad
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/tecnica/${getEditorial(primary.name).slug}`}
                    className="group/cta inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] font-bold font-sans"
                  >
                    Explorar esta técnica
                    <span className="transition-transform group-hover/cta:translate-x-2">
                      →
                    </span>
                  </Link>
                </div>
              </div>

              {/* Secondary + digital archive card — 35% */}
              <div className="lg:w-[35%] flex flex-col gap-16 lg:gap-24 pt-0 lg:pt-12">
                {secondary && (
                  <div className="group">
                    <div
                      className="aspect-[4/5] mb-6 overflow-hidden"
                      style={{ backgroundColor: "#e4e2dd" }}
                    >
                      {(() => {
                        const imgUrl = getTechniqueImage(techImages, secondary.name);
                        return imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={secondary.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span
                              className="font-serif italic text-3xl"
                              style={{ color: "rgba(44,44,44,0.08)" }}
                            >
                              {secondary.name}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <span
                      className="text-[9px] uppercase tracking-[0.3em] font-bold mb-2 block font-sans"
                      style={{ color: "#ec6d13" }}
                    >
                      {getEditorial(secondary.name).origin}
                    </span>
                    <Link
                      to={`/tecnica/${getEditorial(secondary.name).slug}`}
                      className="block hover:text-[#ec6d13] transition-colors"
                    >
                      <h3 className="font-serif text-2xl font-bold mb-3">
                        {secondary.name}
                      </h3>
                    </Link>
                    <p
                      className="text-sm leading-relaxed opacity-70 mb-6"
                      style={{ color: "#584237" }}
                    >
                      {getEditorial(secondary.name).description}
                    </p>
                    <div
                      className="flex gap-4 text-[10px] uppercase tracking-widest font-bold border-t pt-4"
                      style={{ borderColor: "rgba(140,114,101,0.15)" }}
                    >
                      <span>{getEditorial(secondary.name).masters} Maestros</span>
                      <span className="opacity-30">/</span>
                      <span>{getEditorial(secondary.name).mastery}</span>
                    </div>
                  </div>
                )}

                {featuredAsideCardSection && (
                  <CmsSectionRenderer section={featuredAsideCardSection} />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ EDITORIAL CMS SECTIONS ═══════════════ */}
        {editorialSections.map((s) => (
          <CmsSectionRenderer key={s.id} section={s} />
        ))}

        {/* ═══════════════ MUESTRA DE TÉCNICAS (API → con productos) ═══════════════ */}
        {muestraTecnicas.length > 0 && (
          <section className="mb-48">
            {muestraIntroSection && (
              <CmsSectionRenderer section={muestraIntroSection} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {muestraTecnicas.map((t) => {
                const img = getTechniqueImage(techImages, t.name);
                return (
                  <Link
                    key={t.id}
                    to={`/tecnica/${techniqueToSlug(t.name)}`}
                    className="group block"
                  >
                    <div
                      className="aspect-[4/3] overflow-hidden mb-4"
                      style={{ backgroundColor: "#e4e2dd" }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={t.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span
                            className="font-serif italic text-3xl"
                            style={{ color: "rgba(44,44,44,0.08)" }}
                          >
                            {t.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl font-bold group-hover:text-[#ec6d13] transition-colors">
                      {t.name}
                    </h3>
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold font-sans block mt-1"
                      style={{ color: "#584237" }}
                    >
                      {t.productCount}{" "}
                      {t.productCount === 1 ? "pieza disponible" : "piezas disponibles"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}


        {/* ═══════════════ DYNAMIC ARCHIVE — ASYMMETRIC ═══════════════ */}
        {!loading && rest.length > 0 && (
          <section className="mb-48">
            {archiveLabelSection && (
              <CmsSectionRenderer section={archiveLabelSection} />
            )}

            <div className="grid grid-cols-12 gap-8">
              {/* ── Row 1: two squares, full-width ── */}
              {archiveRow1[0] && (
                <ArchiveSquareCard
                  tech={archiveRow1[0]}
                  index={2}
                  techImages={techImages}
                  span="md:col-span-6"
                />
              )}
              {archiveRow1[1] && (
                <ArchiveSquareCard
                  tech={archiveRow1[1]}
                  index={3}
                  techImages={techImages}
                  span="md:col-span-6"
                />
              )}

              {/* ── Row 2: data card + horizontal feature ── */}
              {metricsStatSection && (
                <CmsSectionRenderer section={metricsStatSection} />
              )}
              {archiveRowWide[0] && (
                <ArchiveHorizontalCard
                  tech={archiveRowWide[0]}
                  index={4}
                  techImages={techImages}
                />
              )}

              {/* ── Row 3: 4 small thumbnails ── */}
              {archiveThumbs.map((t, i) => (
                <ArchiveThumbCard
                  key={t.id}
                  tech={t}
                  index={5 + i}
                  techImages={techImages}
                />
              ))}

              {/* Remaining techniques, if user hit "Cargar más" */}
              {archiveRemaining.length > 0 &&
                archiveRemaining.map((t, i) => (
                  <ArchiveThumbCard
                    key={t.id}
                    tech={t}
                    index={9 + i}
                    techImages={techImages}
                  />
                ))}
            </div>

            {/* Pagination / Load more */}
            {orderedTechniques.length > visible && (
              <div className="mt-32 flex justify-start">
                <button
                  onClick={() => setVisible((v) => v + VISIBLE_COUNT)}
                  className="group flex items-center gap-8 py-4"
                >
                  <span
                    className="w-24 h-[1px] origin-left transition-transform group-hover:scale-x-150"
                    style={{ backgroundColor: "#1b1c19" }}
                  />
                  <span className="text-[11px] uppercase tracking-[0.5em] font-bold font-sans">
                    Cargar más registros
                  </span>
                </button>
              </div>
            )}
          </section>
        )}

        {loading && (
          <section className="mb-48">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div
                    className="aspect-square mb-4"
                    style={{ backgroundColor: "#e4e2dd" }}
                  />
                  <div
                    className="h-4 w-24 mb-2"
                    style={{ backgroundColor: "#e4e2dd" }}
                  />
                  <div
                    className="h-6 w-40"
                    style={{ backgroundColor: "#e4e2dd" }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════ EDITORIAL FOOTER MODULE (CMS) ═══════════════ */}
        {editorialFooterSection && (
          <CmsSectionRenderer section={editorialFooterSection} />
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ── Archive card sub-components ──────────────────────────────
 * Kept colocated so the asymmetric grid stays readable and the
 * image-lookup logic is consistent across cells.
 */

interface ArchiveCardProps {
  tech: { id: string; name: string };
  index: number;
  techImages: Record<string, string> | undefined;
}

function resolveImage(
  tech: { name: string },
  techImages: Record<string, string> | undefined,
): string | null {
  return getTechniqueImage(techImages, tech.name);
}

function ArchiveSquareCard({
  tech,
  techImages,
  span = "md:col-span-4",
}: ArchiveCardProps & { span?: string }) {
  const ed = getEditorial(tech.name);
  const img = resolveImage(tech, techImages);
  return (
    <div className={`col-span-12 ${span} flex flex-col gap-6 group`}>
      <Link to={`/tecnica/${ed.slug}`}>
        <div
          className="aspect-square overflow-hidden"
          style={{ backgroundColor: "#e4e2dd" }}
        >
          {img ? (
            <img
              src={img}
              alt={tech.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span
                className="font-serif italic text-3xl"
                style={{ color: "rgba(44,44,44,0.08)" }}
              >
                {tech.name}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div>
        <span
          className="text-[9px] uppercase tracking-widest mb-1 block font-bold font-sans"
          style={{ color: "#ec6d13" }}
        >
          {ed.origin}
        </span>
        <Link
          to={`/tecnica/${ed.slug}`}
          className="block hover:text-[#ec6d13] transition-colors"
        >
          <h3 className="font-serif text-2xl font-bold mb-2">{tech.name}</h3>
        </Link>
        <p
          className="text-xs opacity-60 leading-relaxed mb-4"
          style={{ color: "#584237" }}
        >
          {ed.tagline}
        </p>
        <div className="flex gap-4 text-[9px] uppercase tracking-widest font-bold opacity-40 font-sans">
          <span>{ed.pieces} Piezas</span>
          <span>{ed.masters} Talleres</span>
          <span>{ed.mastery}</span>
        </div>
      </div>
    </div>
  );
}

function ArchiveHorizontalCard({
  tech,
  techImages,
}: ArchiveCardProps) {
  const ed = getEditorial(tech.name);
  const img = resolveImage(tech, techImages);
  return (
    <div className="col-span-12 md:col-span-9">
      <div className="flex flex-col md:flex-row gap-10 group">
        <Link to={`/tecnica/${ed.slug}`} className="md:w-1/2 block">
          <div
            className="aspect-[4/3] overflow-hidden"
            style={{ backgroundColor: "#e4e2dd" }}
          >
            {img ? (
              <img
                src={img}
                alt={tech.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="font-serif italic text-4xl"
                  style={{ color: "rgba(44,44,44,0.08)" }}
                >
                  {tech.name}
                </span>
              </div>
            )}
          </div>
        </Link>
        <div className="md:w-1/2 flex flex-col justify-center">
          <span
            className="text-[9px] uppercase tracking-widest mb-2 block font-bold font-sans"
            style={{ color: "#ec6d13" }}
          >
            {ed.origin}
          </span>
          <Link
            to={`/tecnica/${ed.slug}`}
            className="block hover:text-[#ec6d13] transition-colors"
          >
            <h3 className="font-serif text-3xl font-bold mb-4">{tech.name}</h3>
          </Link>
          <p
            className="text-sm opacity-70 leading-relaxed mb-8"
            style={{ color: "#584237" }}
          >
            {ed.description}
          </p>
          <div
            className="grid grid-cols-2 gap-4 border-t pt-6"
            style={{ borderColor: "rgba(140,114,101,0.2)" }}
          >
            <div className="flex flex-col">
              <span className="text-lg font-serif font-bold">
                {ed.hours ?? ed.pieces}
              </span>
              <span className="text-[8px] uppercase tracking-widest opacity-50 font-sans">
                {ed.hours ? "Horas de Labor" : "Piezas Únicas"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-serif font-bold">{ed.mastery}</span>
              <span className="text-[8px] uppercase tracking-widest opacity-50 font-sans">
                Maestría
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchiveThumbCard({ tech, techImages }: ArchiveCardProps) {
  const ed = getEditorial(tech.name);
  const img = resolveImage(tech, techImages);
  return (
    <Link
      to={`/tecnica/${ed.slug}`}
      className="col-span-6 md:col-span-3 flex flex-col gap-4 group"
    >
      <div
        className="aspect-square overflow-hidden"
        style={{ backgroundColor: "#e4e2dd" }}
      >
        {img ? (
          <img
            src={img}
            alt={tech.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="font-serif italic text-2xl"
              style={{ color: "rgba(44,44,44,0.08)" }}
            >
              {tech.name}
            </span>
          </div>
        )}
      </div>
      <div>
        <h4 className="font-serif text-lg font-bold group-hover:text-[#ec6d13] transition-colors">
          {tech.name}
        </h4>
        <span className="text-[9px] uppercase tracking-widest opacity-50 font-sans">
          {ed.origin}
        </span>
      </div>
    </Link>
  );
}
