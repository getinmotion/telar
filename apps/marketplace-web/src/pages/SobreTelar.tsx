import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { useCmsSections } from "@/hooks/useCmsSections";
import { CmsSectionRenderer } from "@/components/cms/CmsSectionRenderer";
import type { CmsSection } from "@/services/cms-sections.actions";

// ── S3 image constants (used by the fallback below) ─────────────────────
const S3_ABOUT_BASE =
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/hero-images/last-version/about";
const ABOUT_1_URL = `${S3_ABOUT_BASE}/about_1.jpeg`;
const ABOUT_2_URL = `${S3_ABOUT_BASE}/about_2.jpeg`;
const ARTESANA_TEJIENDO_URL =
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/hero-images/last-version/artisan_capture.png";

/* ── Fallback editorial — se renderiza solo si CMS no responde ────────── */
const FALLBACK_SOBRE_COCREA_SECTIONS: CmsSection[] = [
  {
    id: "fallback-about-hero",
    pageKey: "sobre-telar",
    position: 0,
    type: "about_hero",
    published: true,
    payload: {
      bgImageUrl: ABOUT_1_URL,
      bgImageAlt: "Oficios y saberes de las Escuelas Taller de Colombia",
      bgObjectPosition: "center 30%",
      titleLineTop: "COCREA ES LA VITRINA",
      titleLineItalic: "DEL PATRIMONIO VIVO",
      titleLineBottom: "DE COLOMBIA",
      body: "Somos el marketplace de las Escuelas Taller de Colombia, una iniciativa del Programa Nacional Escuelas Taller (PNET) del Ministerio de las Culturas, las Artes y los Saberes. Conectamos los productos elaborados por egresados y egresadas, maestras y maestros de los oficios culturales con personas que valoran el trabajo hecho a mano, la tradición y la construcción de paz.",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-purpose",
    pageKey: "sobre-telar",
    position: 10,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "right",
      kicker: "Nuestra historia",
      titleLineTop: "Tres décadas salvaguardando",
      titleLineItalic: "los oficios",
      paragraphs: [
        "El modelo de Escuelas Taller llegó a Colombia en 1992 gracias a la cooperación entre la Agencia Española de Cooperación Internacional para el Desarrollo (AECID) y el Gobierno de Colombia. Entre 2005 y 2009 el Ministerio de Cultura lo transformó en el Programa Nacional Escuelas Taller, ampliando su alcance hacia la salvaguardia del patrimonio cultural inmaterial, los oficios tradicionales y las economías culturales.",
        "En 2019, la estrategia “Salvaguardia de los oficios tradicionales para la construcción de paz” fue inscrita por la UNESCO en el Registro de Buenas Prácticas de Salvaguardia del Patrimonio Cultural Inmaterial. Hoy el Programa sigue evolucionando bajo el Plan Nacional de Cultura 2024–2038, con enfoque de Patrimonio Vivo, economías populares y comunitarias y Talleres Escuela.",
      ],
      imageUrl: ABOUT_2_URL,
      imageAlt: "Aprendices y maestros de las Escuelas Taller",
      statValue: "2019",
      statLabel: "Reconocimiento UNESCO como buena práctica de salvaguardia",
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-wide",
    pageKey: "sobre-telar",
    position: 20,
    type: "about_wide_block",
    published: true,
    payload: {
      kicker: "Misión y visión",
      titleLineTop: "Herramientas",
      titleLineItalic: "de paz",
      paragraphs: [
        "Nuestra misión es la salvaguardia de los saberes y oficios culturales, patrimoniales y artísticos, a través de procesos formativos orientados a la educación para el trabajo, la gestión cultural y el desarrollo humano, impulsando la dinamización de las economías culturales, populares y comunitarias, la circulación de la oferta artística y cultural, el ejercicio de derechos culturales, la sostenibilidad y la gestión del conocimiento.",
        "Buscamos consolidarnos como referente en la salvaguardia de los saberes y oficios culturales, reconocidos por fortalecer el patrimonio vivo, impulsar las economías culturales y populares, promover el desarrollo territorial y contribuir a la construcción de paz mediante la formación, la innovación social y la gestión del conocimiento.",
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-intelligence",
    pageKey: "sobre-telar",
    position: 30,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "left",
      kicker: "Nuestro modelo",
      titleLineTop: "Cinco ejes que articulan",
      titleLineItalic: "el ecosistema cultural",
      intro: "El modelo integral del Programa Nacional Escuelas Taller se desarrolla a partir de cinco ejes estratégicos:",
      bullets: [
        "Formación para el trabajo",
        "Gestión del conocimiento",
        "Incidencia local y regional",
        "Economías culturales, populares y comunitarias",
        "Integración al ecosistema cultural y territorial",
      ],
      outro: "Nuestro trabajo se guía por la diversidad cultural, la inclusión social, la construcción de paz, la innovación, el desarrollo territorial, la gestión colaborativa del conocimiento y la sostenibilidad.",
      imageUrl: ARTESANA_TEJIENDO_URL,
      imageAlt: "Artesana tejiendo con lanas de colores",
      overlayKicker: "Saberes que se transmiten",
      overlayTitle: "de generación en generación",
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
      kicker: "Un ecosistema articulado",
      titleLineTop: "De la transmisión de saberes",
      titleLineItalic: "a la comercialización",
      paragraphs: [
        "Las estrategias lideradas por el Ministerio de las Culturas, las Artes y los Saberes no funcionan como proyectos independientes, sino como un ecosistema articulado que acompaña el ciclo completo de fortalecimiento de las economías culturales: desde el reconocimiento de maestras, maestros, sabedoras y sabedores, pasando por la formación, la creación y la innovación, hasta la producción, la circulación y la comercialización de bienes y servicios culturales.",
        "Cada iniciativa responde a una etapa del proceso, pero todas se articulan para generar oportunidades de formación, creación, innovación, circulación y sostenibilidad económica para las comunidades y los territorios. Cocrea es el eslabón de circulación y comercialización de esa ruta: el canal digital donde los productos y servicios culturales encuentran nuevos mercados.",
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-about-projects",
    pageKey: "sobre-telar",
    position: 50,
    type: "about_two_col",
    published: true,
    payload: {
      imageSide: "right",
      kicker: "Proyectos del ecosistema",
      titleLineTop: "Iniciativas que",
      titleLineItalic: "caminan juntas",
      intro: "Cocrea se articula con los programas y proyectos del Ministerio que fortalecen el diseño, la circulación y el turismo cultural:",
      bullets: [
        "Kasa Raíz — Centro Nacional de Diseño e Innovación Cultural: diseño, innovación y emprendimiento creativo en Villa Adelaida, Bogotá",
        "Villa Adelaida: espacio nacional para la formación, creación y fortalecimiento de emprendimientos del diseño, los oficios y las artes",
        "País Raíz: turismo biocultural en territorios como La Guajira, Guaviare, San Andrés, Santa Marta y el Alto Magdalena",
        "Circuitos Vivos: circulación cultural mediante rutas regionales en el Caribe, el Pacífico, los Llanos, el Eje Cafetero y el centro del país",
      ],
      outro: "Juntas conforman una ruta que acompaña a las personas, organizaciones y territorios desde la transmisión de saberes hasta la sostenibilidad económica.",
      imageUrl: ABOUT_1_URL,
      imageAlt: "Oficios culturales de las Escuelas Taller",
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
      titleLineItalic: "institucional y territorial",
      paragraphs: [
        "Cocrea es liderada por el Ministerio de las Culturas, las Artes y los Saberes, a través de la Dirección de Estrategia, Desarrollo y Emprendimiento (DEDE) y su Grupo Escuelas Taller. La implementación territorial se realiza mediante la red de Escuelas Taller presentes en diferentes regiones del país, en articulación con entidades territoriales, organizaciones sociales, comunidades, maestras y maestros, sabedoras y sabedores y aliados estratégicos.",
        "La plataforma está pensada para todas las personas que participan en las economías culturales: compradores, compradores institucionales, artesanas y artesanos, emprendimientos culturales, Escuelas Taller, turistas culturales, diseñadores, cooperación internacional, entidades públicas y academia.",
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
      titleLineTop: "Cada compra fortalece",
      titleLineItalic: "el patrimonio vivo",
      body: "Explora los productos elaborados por artesanas, artesanos, Escuelas Taller y emprendimientos culturales de todo el país; conoce las historias, los saberes y los procesos detrás de cada pieza; descubre experiencias, rutas y talleres asociados a los oficios tradicionales, y conecta directamente con sus creadores.",
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
  // El CMS aún guarda el "about" de la marca anterior (Telar). Hasta que el
  // contenido se actualice desde el admin, cualquier mención de esa marca en
  // el payload invalida las secciones remotas y se usa el contenido de Cocrea.
  const cmsIsStale =
    !cmsSections ||
    cmsSections.length === 0 ||
    /Telar/i.test(JSON.stringify(cmsSections.map((s) => s.payload)));
  const sections = cmsIsStale ? FALLBACK_SOBRE_COCREA_SECTIONS : cmsSections;

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Sobre Cocrea</span>
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
