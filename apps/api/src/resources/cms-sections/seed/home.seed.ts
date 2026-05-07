import { CmsSection } from '../types/cms-section.types';

/**
 * Initial editorial content for / (homepage).
 *
 * Slot types used:
 *  - home_value_props        → 3-up con kicker, title, body (band crema arriba)
 *  - home_section_header     → header reusable: kicker + title + subtitle + cta
 *  - home_block              → bloque flexible: kicker, title, body, cta, image,
 *                              variant ('light'|'dark'|'cream'|'bordered')
 *  - quote                   → tipo existente (ya soportado)
 */
export const homeSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  {
    pageKey: 'home',
    position: 0,
    type: 'home_value_props',
    published: true,
    payload: {
      cards: [
        {
          title: 'Hecho a mano',
          body: 'Cada pieza es creada por talleres artesanales reales que mantienen vivas técnicas tradicionales.',
        },
        {
          title: 'Origen cultural',
          body: 'Los objetos conservan la historia de la región y las comunidades donde fueron creados.',
        },
        {
          title: 'Autenticidad registrada',
          body: 'Cada pieza cuenta con una huella digital que documenta su origen, su taller y su proceso artesanal.',
        },
      ],
    },
  },
  {
    pageKey: 'home',
    position: 1,
    type: 'home_section_header',
    published: true,
    payload: {
      slot: 'categories',
      kicker: 'Explorar por categorías',
      title: '',
      subtitle: '',
      ctaLabel: '',
      ctaHref: '',
    },
  },
  {
    pageKey: 'home',
    position: 2,
    type: 'home_section_header',
    published: true,
    payload: {
      slot: 'featured_products',
      title: 'Creaciones Destacadas',
      subtitle: 'Piezas con alma seleccionadas por su maestría técnica.',
      ctaLabel: 'Ver colección completa',
      ctaHref: '/productos',
    },
  },
  {
    pageKey: 'home',
    position: 3,
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
  {
    pageKey: 'home',
    position: 4,
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
  {
    pageKey: 'home',
    position: 5,
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
];
