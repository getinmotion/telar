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
    id: "fallback-about-cta",
    pageKey: "sobre-telar",
    position: 40,
    type: "about_cta",
    published: true,
    payload: {
      titleLineTop: "Cada compra fortalece",
      titleLineItalic: "el patrimonio vivo",
      body: "Explora los productos elaborados por artesanas, artesanos, Escuelas Taller y emprendimientos culturales de todo el país, conoce las historias y los saberes detrás de cada pieza y conecta directamente con sus creadores.",
      ctas: [
        { label: "Explorar productos", href: "/productos", variant: "secondary" },
        { label: "Ver categorías", href: "/categorias", variant: "outline" },
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
];

export default function SobreTelar() {
  const { data: cmsSections } = useCmsSections("sobre-telar");
  const sections =
    cmsSections && cmsSections.length > 0 ? cmsSections : FALLBACK_SOBRE_COCREA_SECTIONS;

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
