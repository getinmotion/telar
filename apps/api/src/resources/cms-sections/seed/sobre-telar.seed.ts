import { CmsSection } from '../types/cms-section.types';

/**
 * Initial editorial content for /sobre-telar.
 *
 * Tipos:
 *  - about_hero       → hero con background image + título de 3 líneas (la del medio en itálica)
 *  - about_two_col    → bloque 2-col reutilizable: párrafos o bullets + imagen con overlay (stat o kicker/título)
 *  - about_wide_block → tarjeta ancha sobre fondo blanco (Comercio justo)
 *  - about_cta        → CTA naranja al final con 2 botones
 */
const S3_ABOUT_BASE =
  'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/hero-images/last-version/about';
const ABOUT_1_URL = `${S3_ABOUT_BASE}/about_1.jpeg`;
const ABOUT_2_URL = `${S3_ABOUT_BASE}/about_2.jpeg`;
const ARTESANA_URL =
  'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/hero-images/last-version/artisan_capture.png';

export const sobreTelarSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  // 0 — Hero
  {
    pageKey: 'sobre-telar',
    position: 0,
    type: 'about_hero',
    published: true,
    payload: {
      bgImageUrl: ABOUT_1_URL,
      bgImageAlt: 'Artesanía colombiana',
      bgObjectPosition: 'center 30%',
      titleLineTop: 'TELAR ES EL',
      titleLineItalic: 'PUENTE DIGITAL',
      titleLineBottom: 'DE LA ARTESANÍA',
      body: 'Somos una plataforma que conecta directamente a artesanos colombianos con personas que valoran el trabajo manual, la tradición y el impacto social. Cada producto cuenta una historia, cada compra transforma una vida.',
    },
  },
  // 10 — Propósito (image right with stat overlay)
  {
    pageKey: 'sobre-telar',
    position: 10,
    type: 'about_two_col',
    published: true,
    payload: {
      imageSide: 'right',
      iconName: 'Heart',
      kicker: 'Nuestro propósito',
      titleLineTop: 'Preservar tradiciones,',
      titleLineItalic: 'dignificar oficios',
      paragraphs: [
        'Colombia tiene una riqueza artesanal milenaria que se pierde entre intermediarios, bajos precios y falta de visibilidad. Muchos artesanos abandonan sus oficios porque no encuentran un canal justo para vender su trabajo.',
        'Creamos TELAR para que cada artesano tenga su propia vitrina digital, controle sus precios, cuente su historia y construya un negocio sostenible desde su comunidad.',
      ],
      imageUrl: ABOUT_2_URL,
      imageAlt: 'Artesanos conectados a Telar',
      statValue: '1.500+',
      statLabel: 'Artesanos conectados',
    },
  },
  // 20 — Comercio justo (wide block)
  {
    pageKey: 'sobre-telar',
    position: 20,
    type: 'about_wide_block',
    published: true,
    payload: {
      iconName: 'TrendingUp',
      kicker: 'Comercio justo',
      titleLineTop: 'Honestidad en',
      titleLineItalic: 'cada fibra',
      paragraphs: [
        'En Telar eliminamos las barreras entre el territorio y tú. Nuestra plataforma habilita el comercio directo para que el beneficio económico llegue íntegramente a los verdaderos protagonistas: comunidades indígenas, afrodescendientes, campesinos y mujeres cabeza de familia que lideran la economía popular desde la Colombia profunda.',
        'Comprar aquí es una inversión social: es garantizar un pago justo, respaldar el liderazgo de líderes sociales en sus comunidades y asegurar que el saber ancestral sea una oportunidad real para las nuevas generaciones. Sin intermediarios y con trazabilidad total, conectamos tu compra con la fuerza y la cultura de cada territorio.',
      ],
    },
  },
  // 30 — Inteligencia artesanal (image left + bullets + overlay kicker/title)
  {
    pageKey: 'sobre-telar',
    position: 30,
    type: 'about_two_col',
    published: true,
    payload: {
      imageSide: 'left',
      iconName: 'Sparkles',
      kicker: 'Inteligencia artesanal',
      titleLineTop: 'Tecnología al servicio',
      titleLineItalic: 'de la tradición',
      intro: 'No reemplazamos el trabajo artesanal con máquinas. Usamos tecnología para que los artesanos puedan:',
      bullets: [
        'Crear su tienda en minutos sin conocimientos técnicos',
        'Gestionar inventarios, pedidos y pagos desde su celular',
        'Contar su historia y conectar con compradores de todo el país',
        'Recibir pagos seguros directamente en su cuenta bancaria',
      ],
      outro: 'La tecnología amplifica su alcance, pero el corazón sigue siendo el trabajo manual, la dedicación y el conocimiento transmitido por generaciones.',
      imageUrl: ARTESANA_URL,
      imageAlt: 'Artesana tejiendo con lanas de colores',
      overlayKicker: 'Tecnología al servicio',
      overlayTitle: 'de la tradición',
    },
  },
  // 40 — Final CTA
  {
    pageKey: 'sobre-telar',
    position: 40,
    type: 'about_cta',
    published: true,
    payload: {
      titleLineTop: 'Cada compra es un voto',
      titleLineItalic: 'por un futuro más justo',
      body: 'Explora el trabajo de cientos de artesanos colombianos y lleva a casa piezas únicas que cuentan historias de tradición, dedicación y esperanza.',
      ctas: [
        { label: 'Explorar productos', href: '/productos', variant: 'secondary' },
        { label: 'Ver categorías',     href: '/categorias', variant: 'outline'   },
      ],
    },
  },
];
