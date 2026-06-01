import { CmsSection } from '../types/cms-section.types';

/**
 * Initial editorial content for / (homepage).
 *
 * El frontend usa <PageRenderer pageKey="home" /> que ordena por `position`
 * y dispatcha por `type`. El curador puede mezclar tipos editoriales con
 * `embedded_widget` (cápsulas hardcoded como categorías, productos
 * destacados, taller del mes, etc.) en el orden que quiera desde el admin.
 *
 * Tipos:
 *  - home_hero_carousel    → hero con slides
 *  - home_value_props      → 3 cards de propuesta de valor
 *  - home_section_header   → kicker + título + subtítulo + cta (etiqueta)
 *  - home_block            → bloque con variant (light/dark/cream/bordered)
 *  - content_pick          → banner/card hacia blog o colección
 *  - embedded_widget       → componente hardcoded (widget name en payload)
 */
export const homeSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  // 0 — Hero carousel
  {
    pageKey: 'home',
    position: 0,
    type: 'home_hero_carousel',
    published: true,
    payload: {
      description:
        'Objetos auténticos creados por talleres artesanales de Colombia. Cada pieza conserva la historia, el origen y el conocimiento de quienes la crean.',
      tagline: 'Hecho a mano por talleres artesanales de Colombia.',
      primaryCtaLabel: 'Explorar Piezas',
      primaryCtaHref: '/productos',
      secondaryCtaLabel: 'Conocer Talleres',
      secondaryCtaHref: '/tiendas',
      autoplaySeconds: 6,
      slides: [
        {
          title: 'HISTORIAS HECHAS',
          subtitle: 'A MANO',
          imageUrl:
            'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/marketplace-home/telar_cat_v%20(4).png',
          imageAlt: 'Artesanía colombiana',
          origin: 'Nariño, Colombia',
          quote: 'Cada puntada es un susurro de nuestros ancestros.',
        },
        {
          title: 'ARTESANÍA',
          subtitle: 'AUTÉNTICA',
          imageUrl:
            'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/images/1766278723378_0_WhatsApp_Image_2025-08-08_at_3.29.32_PM.jpeg.jpeg',
          imageAlt: 'Tejedoras del Cauca',
          origin: 'Valle del Cauca, Colombia',
          quote: 'Cada pieza cuenta una historia única.',
        },
      ],
    },
  },
  // 10 — Value props
  {
    pageKey: 'home',
    position: 10,
    type: 'home_value_props',
    published: true,
    payload: {
      cards: [
        { title: 'Hecho a mano', body: 'Cada pieza es creada por talleres artesanales reales que mantienen vivas técnicas tradicionales.' },
        { title: 'Origen cultural', body: 'Los objetos conservan la historia de la región y las comunidades donde fueron creados.' },
        { title: 'Autenticidad registrada', body: 'Cada pieza cuenta con una huella digital que documenta su origen, su taller y su proceso artesanal.' },
      ],
    },
  },
  // 20 — Categories grid (widget)
  {
    pageKey: 'home',
    position: 20,
    type: 'embedded_widget',
    published: true,
    payload: {
      widget: 'categories_grid',
      kicker: 'Explorar por categorías',
    },
  },
  // 30 — Featured products (widget)
  {
    pageKey: 'home',
    position: 30,
    type: 'embedded_widget',
    published: true,
    payload: {
      widget: 'featured_products',
      title: 'Creaciones Destacadas',
      subtitle: 'Piezas con alma seleccionadas por su maestría técnica.',
      ctaLabel: 'Ver colección completa',
      ctaHref: '/productos',
    },
  },
  // 40 — Block: marketplace diferente
  {
    pageKey: 'home',
    position: 40,
    type: 'home_block',
    published: true,
    payload: {
      slot: 'marketplace_diferente',
      kicker: 'Un marketplace diferente',
      title: '',
      body: 'Telar conecta a compradores con talleres artesanales reales. Cada pieza tiene origen, autor y proceso documentado.',
      ctaLabel: 'Descubrir cómo funciona Telar',
      ctaHref: '/newsletter',
      variant: 'dark',
      imageUrl: '',
    },
  },
  // 50 — Block: comercio justo
  {
    pageKey: 'home',
    position: 50,
    type: 'home_block',
    published: true,
    payload: {
      slot: 'comercio_justo',
      kicker: '',
      title: 'Comercio justo para quienes crean',
      body: 'Trabajamos directamente con talleres artesanales para asegurar que quienes crean las piezas reciban una compensación justa por su trabajo. Construimos relaciones directas entre quienes crean las piezas y quienes las valoran.',
      ctaLabel: 'Conocer más',
      ctaHref: '/newsletter',
      variant: 'bordered',
      imageUrl: '',
    },
  },
  // 60 — Huella digital (widget)
  {
    pageKey: 'home',
    position: 60,
    type: 'embedded_widget',
    published: true,
    payload: { widget: 'huella_digital' },
  },
  // 70 — Featured shop (widget)
  {
    pageKey: 'home',
    position: 70,
    type: 'embedded_widget',
    published: true,
    payload: { widget: 'featured_shop' },
  },
  // 80 — Regalos con historia (widget)
  {
    pageKey: 'home',
    position: 80,
    type: 'embedded_widget',
    published: true,
    payload: { widget: 'regalos_con_historia' },
  },
  // 90 — Colecciones overview (widget)
  {
    pageKey: 'home',
    position: 90,
    type: 'embedded_widget',
    published: true,
    payload: { widget: 'colecciones_overview' },
  },
  // 100 — Aliados (widget)
  {
    pageKey: 'home',
    position: 100,
    type: 'embedded_widget',
    published: true,
    payload: { widget: 'aliados' },
  },
];
