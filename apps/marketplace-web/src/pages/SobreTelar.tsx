import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { AllianceSeal } from "@/components/AllianceSeal";
import { useCmsSections } from "@/hooks/useCmsSections";
import { CmsSectionRenderer } from "@/components/cms/CmsSectionRenderer";
import type { CmsSection } from "@/services/cms-sections.actions";

// Fotos retiradas: se dejan vacías para que el renderer muestre placeholders
// hasta contar con imágenes propias de Villa Adelaida.
const ABOUT_1_URL = "";
const ABOUT_2_URLS = [
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/cocrea/villa.jpeg",
];
const ARTESANA_TEJIENDO_URLS = [
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/cocrea/1.jpeg",
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/cocrea/2.jpeg",
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/cocrea/3.jpeg",
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/cocrea/4.jpeg",
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/cocrea/5.jpeg",
];

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
      body: "Ubicada en una casa patrimonial en el distrito financiero y gastronómico de Bogotá, es una plataforma nacional que conecta y fortalece el ecosistema del diseño impulsando capacidades, promoviendo la innovación y generando valor cultural, social y económico.",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-como",
    pageKey: "sobre-telar",
    position: 10,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "right",
      kicker: "¿Cómo lo hace?",
      titleLineTop: "Una plataforma nacional",
      titleLineItalic: "para el ecosistema del diseño",
      bullets: [
        "Programación de conversatorios, laboratorios y actividades relacionadas con diseño e innovación.",
        "Estrategias de comercialización de productos y servicios asociados a procesos y emprendimientos.",
        "Actividades descentralizadas en los territorios, orientadas al encuentro entre los saberes propios y el diseño contemporáneo.",
        "Becas y residencias dentro del Sistema Nacional de Convocatorias.",
        "Búsqueda y consolidación de alianzas estratégicas con actores públicos, privados y académicos para el desarrollo conjunto de proyectos.",
      ],
      imageUrls: ABOUT_2_URLS,
      imageAlt: "Villa Adelaida, casa patrimonial en Bogotá",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-programa",
    pageKey: "sobre-telar",
    position: 20,
    type: "about_wide_block",
    published: true,
    payload: {
      kicker: "Programa de fortalecimiento comercial",
      titleLineTop: "Programa de fortalecimiento",
      titleLineItalic: "comercial – Villa Adelaida",
      paragraphs: [
        "En el marco del proyecto de Villa Adelaida, y como parte de su consolidación como una plataforma de articulación para el fortalecimiento de las economías culturales y creativas, se diseñó e implementó el programa de fortalecimiento comercial dirigido a artesanos, productores y unidades productivas vinculadas a las Escuelas Taller de Colombia.",
        "Esta iniciativa incorpora herramientas digitales, estrategias de comercialización y procesos de diagnóstico orientados a fortalecer las capacidades comerciales de los participantes, mejorar el acceso a nuevos mercados y promover la sostenibilidad de sus iniciativas productivas.",
        "Con ello, Villa Adelaida amplió su alcance como articulador de procesos de formación, innovación y fortalecimiento, favoreciendo la integración de los saberes tradicionales con nuevas oportunidades de desarrollo económico.",
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-cifras",
    pageKey: "sobre-telar",
    position: 30,
    type: "about_program_stats",
    published: true,
    payload: {
      kicker: "El programa en cifras",
      titleLineTop: "Resultados del proceso",
      titleLineItalic: "de fortalecimiento",
      stats: [
        { value: "+80", label: "Artesanos y artesanas beneficiados" },
        { value: "+22", label: "Productores del ecosistema del viche" },
        {
          value: "5",
          label:
            "Territorios impactados: Barichara, Buenaventura, Cali, Mompox y Popayán",
        },
        { value: "+60", label: "Horas por artesano" },
      ],
      note: "En esta iniciativa también participaron el Programa de Escuelas Taller de la Dirección de Estrategia, Desarrollo y Emprendimiento y el Grupo de Patrimonio Cultural Inmaterial del Ministerio de las Culturas, las Artes y los Saberes.",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-territorios",
    pageKey: "sobre-telar",
    position: 40,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "left",
      kicker: "En los territorios",
      titleLineTop: "Sesiones de trabajo",
      titleLineItalic: "con talleres y productores",
      intro:
        "El proceso de fortalecimiento se desarrolló de manera presencial en cinco territorios, en encuentros con artesanas, artesanos, productores y unidades productivas.",
      bullets: ["Barichara", "Buenaventura", "Cali", "Mompox", "Popayán"],
      imageUrls: ARTESANA_TEJIENDO_URLS,
      imageAlt: "Sesiones del proceso de fortalecimiento en los territorios",
      overlayKicker: "Sesiones en los territorios",
      overlayTitle: "saberes propios y diseño contemporáneo",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-cta",
    pageKey: "sobre-telar",
    position: 50,
    type: "about_cta",
    published: true,
    payload: {
      titleLineTop: "Cada pieza conecta",
      titleLineItalic: "diseño, territorio y personas",
      body: "Explora los productos elaborados por artesanos, artesanas, productores y unidades productivas vinculadas a las Escuelas Taller de Colombia; conoce las historias, los saberes y los procesos detrás de cada pieza, y conecta directamente con sus creadores.",
      // "Conocer las historias" se retira mientras Historias esté oculta.
      ctas: [
        {
          label: "Explorar productos",
          href: "/productos",
          variant: "secondary",
        },
        { label: "Conocer los talleres", href: "/tiendas", variant: "outline" },
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
          <span className="text-primary font-bold">Alianza Villa Adelaida</span>
        </nav>
      </div>

      {/* Alliance seal */}
      <div className="max-w-[1400px] mx-auto px-6 mb-6">
        <AllianceSeal className="rounded-lg" />
      </div>

      {/* CMS-driven editorial */}
      {sections.map((s) => (
        <CmsSectionRenderer key={s.id} section={s} />
      ))}

      <Footer showNewsletter />
    </div>
  );
}
