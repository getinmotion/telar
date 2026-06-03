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
const FALLBACK_SOBRE_TELAR_SECTIONS: CmsSection[] = [
  {
    id: "fallback-about-hero",
    pageKey: "sobre-telar",
    position: 0,
    type: "about_hero",
    published: true,
    payload: {
      bgImageUrl: ABOUT_1_URL,
      bgImageAlt: "Artesanía colombiana",
      bgObjectPosition: "center 30%",
      titleLineTop: "TELAR ES EL",
      titleLineItalic: "PUENTE DIGITAL",
      titleLineBottom: "DE LA ARTESANÍA",
      body: "Somos una plataforma que conecta directamente a artesanos colombianos con personas que valoran el trabajo manual, la tradición y el impacto social. Cada producto cuenta una historia, cada compra transforma una vida.",
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
      kicker: "Nuestro propósito",
      titleLineTop: "Preservar tradiciones,",
      titleLineItalic: "dignificar oficios",
      paragraphs: [
        "Colombia tiene una riqueza artesanal milenaria que se pierde entre intermediarios, bajos precios y falta de visibilidad. Muchos artesanos abandonan sus oficios porque no encuentran un canal justo para vender su trabajo.",
        "Creamos TELAR para que cada artesano tenga su propia vitrina digital, controle sus precios, cuente su historia y construya un negocio sostenible desde su comunidad.",
      ],
      imageUrl: ABOUT_2_URL,
      imageAlt: "Artesanos conectados a Telar",
      statValue: "1.500+",
      statLabel: "Artesanos conectados",
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
      kicker: "Comercio justo",
      titleLineTop: "Honestidad en",
      titleLineItalic: "cada fibra",
      paragraphs: [
        "En Telar eliminamos las barreras entre el territorio y tú. Nuestra plataforma habilita el comercio directo para que el beneficio económico llegue íntegramente a los verdaderos protagonistas: comunidades indígenas, afrodescendientes, campesinos y mujeres cabeza de familia que lideran la economía popular desde la Colombia profunda.",
        "Comprar aquí es una inversión social: es garantizar un pago justo, respaldar el liderazgo de líderes sociales en sus comunidades y asegurar que el saber ancestral sea una oportunidad real para las nuevas generaciones. Sin intermediarios y con trazabilidad total, conectamos tu compra con la fuerza y la cultura de cada territorio.",
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
      kicker: "Inteligencia artesanal",
      titleLineTop: "Tecnología al servicio",
      titleLineItalic: "de la tradición",
      intro: "No reemplazamos el trabajo artesanal con máquinas. Usamos tecnología para que los artesanos puedan:",
      bullets: [
        "Crear su tienda en minutos sin conocimientos técnicos",
        "Gestionar inventarios, pedidos y pagos desde su celular",
        "Contar su historia y conectar con compradores de todo el país",
        "Recibir pagos seguros directamente en su cuenta bancaria",
      ],
      outro: "La tecnología amplifica su alcance, pero el corazón sigue siendo el trabajo manual, la dedicación y el conocimiento transmitido por generaciones.",
      imageUrl: ARTESANA_TEJIENDO_URL,
      imageAlt: "Artesana tejiendo con lanas de colores",
      overlayKicker: "Tecnología al servicio",
      overlayTitle: "de la tradición",
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
      titleLineTop: "Cada compra es un voto",
      titleLineItalic: "por un futuro más justo",
      body: "Explora el trabajo de cientos de artesanos colombianos y lleva a casa piezas únicas que cuentan historias de tradición, dedicación y esperanza.",
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
    cmsSections && cmsSections.length > 0 ? cmsSections : FALLBACK_SOBRE_TELAR_SECTIONS;

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Sobre Telar</span>
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
