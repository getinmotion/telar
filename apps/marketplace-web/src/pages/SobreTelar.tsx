import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { useCmsSections } from "@/hooks/useCmsSections";
import { CmsSectionRenderer } from "@/components/cms/CmsSectionRenderer";
import type { CmsSection } from "@/services/cms-sections.actions";

// Fotos retiradas: se dejan vacías para que el renderer muestre placeholders
// hasta contar con imágenes propias de Villa Adelaida.
const ABOUT_1_URL = "";
const ABOUT_2_URL = "";
const ARTESANA_TEJIENDO_URL = "";

/* ── Fallback editorial — se renderiza solo si CMS no responde ────────── */
const FALLBACK_SOBRE_VA_SECTIONS: CmsSection[] = [
  {
    id: "fallback-about-hero",
    pageKey: "sobre-telar",
    position: 0,
    type: "about_hero",
    published: true,
    payload: {
      bgImageUrl: ABOUT_1_URL,
      bgImageAlt: "Diseño, oficios y saberes de Colombia",
      bgObjectPosition: "center 30%",
      titleLineTop: "VILLA ADELAIDA",
      titleLineItalic: "Centro Nacional de Diseño",
      titleLineBottom: "e Innovación",
      body: "Villa Adelaida es una iniciativa del Ministerio de las Culturas, las Artes y los Saberes, en alianza con la Corporación Colombia Crea Talento (CoCrea), que impulsa el diseño como herramienta para la creación, la innovación y el fortalecimiento de las economías culturales y creativas. Desde un espacio de encuentro, experimentación e intercambio de saberes, promueve el diálogo entre las prácticas tradicionales y contemporáneas para fortalecer procesos creativos, emprendimientos y comunidades de todo el país.",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-history",
    pageKey: "sobre-telar",
    position: 10,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "right",
      kicker: "Nuestra historia",
      titleLineTop: "Una casa patrimonial",
      titleLineItalic: "que resignifica su legado",
      paragraphs: [
        "Villa Adelaida es una casa patrimonial construida a comienzos del siglo XX, reconocida por su valor arquitectónico e histórico en Bogotá. Durante varias décadas fue la residencia de la familia de Agustín Nieto Caballero, pedagogo colombiano y fundador del Gimnasio Moderno, y escenario de importantes encuentros intelectuales y culturales asociados al pensamiento, la educación y la construcción de nuevas ideas.",
        "Tras un proceso de recuperación liderado por el Ministerio de las Culturas, las Artes y los Saberes, en articulación con la Sociedad de Activos Especiales (SAE), la casa inició una nueva etapa como Villa Adelaida, Centro Nacional de Diseño e Innovación. Este propósito resignifica su historia y mantiene su vocación como lugar de encuentro e intercambio de ideas, ahora desde el diseño, la creación y la innovación.",
      ],
      imageUrl: ABOUT_2_URL,
      imageAlt: "Villa Adelaida, casa patrimonial en Bogotá",
      statValue: "Siglo XX",
      statLabel: "Casa patrimonial recuperada como Centro Nacional de Diseño e Innovación",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-purpose",
    pageKey: "sobre-telar",
    position: 20,
    type: "about_wide_block",
    published: true,
    payload: {
      kicker: "Nuestro propósito",
      titleLineTop: "El diseño como",
      titleLineItalic: "herramienta de transformación",
      paragraphs: [
        "Impulsamos el diseño como herramienta para la creación, la innovación y el fortalecimiento de las economías culturales y creativas, mediante procesos de formación, experimentación, intercambio de saberes, desarrollo de producto, circulación y articulación entre actores.",
        "Contribuimos a generar oportunidades para creadores, artesanas, artesanos, diseñadores, organizaciones y emprendimientos culturales, fortaleciendo sus capacidades y ampliando sus posibilidades de circulación y comercialización.",
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-axes",
    pageKey: "sobre-telar",
    position: 30,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "left",
      kicker: "Líneas de acción",
      titleLineTop: "Seis ejes que articulan",
      titleLineItalic: "el diseño y la innovación",
      intro: "El trabajo de Villa Adelaida se organiza en torno a seis ejes estratégicos:",
      bullets: [
        "Diseño e innovación",
        "Formación e intercambio de saberes",
        "Investigación, experimentación y desarrollo de producto",
        "Circulación y apropiación social del diseño",
        "Fortalecimiento de las economías culturales y creativas",
        "Articulación interinstitucional y cooperación",
      ],
      outro: "Nuestro trabajo se guía por el diseño como herramienta de transformación, la innovación, la colaboración, la diversidad cultural, el patrimonio vivo, la sostenibilidad, el intercambio de saberes y la inclusión.",
      imageUrl: ARTESANA_TEJIENDO_URL,
      imageAlt: "Saberes que dialogan entre lo tradicional y lo contemporáneo",
      overlayKicker: "Saberes que dialogan",
      overlayTitle: "entre lo tradicional y lo contemporáneo",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-ecosystem",
    pageKey: "sobre-telar",
    position: 40,
    type: "about_wide_block",
    published: true,
    payload: {
      kicker: "Parte de un ecosistema",
      titleLineTop: "Del conocimiento y el diseño",
      titleLineItalic: "a la circulación",
      paragraphs: [
        "Villa Adelaida articula el componente de diseño e innovación dentro del ecosistema del Ministerio de las Culturas, las Artes y los Saberes. Desde este espacio convergen procesos de investigación, creación, formación, desarrollo de producto, circulación y fortalecimiento de capacidades que complementan otras estrategias institucionales como Escuelas Taller, País Raíz y Circuitos Vivos.",
        "Esta articulación permite acompañar iniciativas culturales desde la generación de conocimiento y el diseño hasta su circulación y comercialización, fortaleciendo las economías culturales, populares y comunitarias.",
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-audiences",
    pageKey: "sobre-telar",
    position: 50,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "right",
      kicker: "Para quién",
      titleLineTop: "Un espacio para todo",
      titleLineItalic: "el ecosistema creativo",
      intro: "Villa Adelaida tiene vocación nacional y está dirigida a un ecosistema diverso de personas, organizaciones e instituciones:",
      bullets: [
        "Diseñadoras y diseñadores de todas las disciplinas",
        "Artesanas, artesanos, maestras, maestros, sabedoras y sabedores",
        "Artistas, creadoras y creadores interdisciplinarios",
        "Emprendedores culturales y unidades productivas",
        "Organizaciones culturales, comunitarias y sociales",
        "Academia, instituciones, cooperación y sector creativo",
      ],
      outro: "También abre sus puertas a la ciudadanía, las comunidades locales y los visitantes interesados en la cultura, el diseño y el patrimonio.",
      imageUrl: ABOUT_1_URL,
      imageAlt: "Comunidades y creadores del ecosistema cultural",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-governance",
    pageKey: "sobre-telar",
    position: 60,
    type: "about_wide_block",
    published: true,
    payload: {
      kicker: "Quiénes estamos detrás",
      titleLineTop: "Una apuesta",
      titleLineItalic: "institucional",
      paragraphs: [
        "Villa Adelaida, Centro Nacional de Diseño e Innovación, es una iniciativa del Ministerio de las Culturas, las Artes y los Saberes, liderada por la Dirección de Estrategia, Desarrollo y Emprendimiento (DEDE), en alianza con la Corporación Colombia Crea Talento (CoCrea) y en articulación con los equipos técnicos, administrativos y de programación del Centro.",
        "Entre sus aliados clave se encuentran la Corporación Colombia Crea Talento (CoCrea), universidades, organizaciones culturales, colectivos y redes de diseño, el sector creativo y entidades públicas y privadas según cada proyecto.",
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-cta",
    pageKey: "sobre-telar",
    position: 70,
    type: "about_cta",
    published: true,
    payload: {
      titleLineTop: "Cada pieza conecta",
      titleLineItalic: "diseño, territorio y personas",
      body: "Explora los productos elaborados por artesanas, artesanos, Escuelas Taller, diseñadores y emprendimientos culturales de todo el país; conoce las historias, los saberes y los procesos detrás de cada pieza, y conecta directamente con sus creadores.",
      ctas: [
        { label: "Explorar productos", href: "/productos", variant: "secondary" },
        { label: "Conocer las historias", href: "/historias", variant: "outline" },
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
];

export default function SobreTelar() {
  const { data: cmsSections } = useCmsSections("sobre-telar");
  // El CMS aún guarda el "about" de marcas anteriores (Telar / Cocrea). Hasta que
  // el contenido se actualice desde el admin, cualquier mención de esas marcas en
  // el payload invalida las secciones remotas y se usa el contenido de Villa Adelaida.
  const cmsIsStale =
    !cmsSections ||
    cmsSections.length === 0 ||
    /Telar|Cocrea/i.test(JSON.stringify(cmsSections.map((s) => s.payload)));
  const sections = cmsIsStale ? FALLBACK_SOBRE_VA_SECTIONS : cmsSections;

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Sobre Villa Adelaida</span>
        </nav>
      </div>

      {/* CMS-driven editorial */}
      {sections.map((s) => (
        <CmsSectionRenderer key={s.id} section={s} />
      ))}

      <Footer showNewsletter />
    </div>
  );
}
