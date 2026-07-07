/**
 * Fallback editorial for `/` (homepage).
 * Espejo de apps/api/src/resources/cms-sections/seed/home.seed.ts — se usa
 * cuando la API no responde o Mongo aún no fue sembrado, para que la home
 * nunca quede en blanco.
 */
import type { CmsSection } from '@/services/cms-sections.actions';

const empty = (id: string, position: number, type: string, payload: Record<string, any>): CmsSection => ({
  id, pageKey: 'home', position, type, published: true, payload,
  createdAt: '', updatedAt: '',
});

export const FALLBACK_HOME_SECTIONS: CmsSection[] = [
  empty('fb-home-0', 0, 'home_hero_carousel', {
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
  }),
  empty('fb-home-1', 10, 'home_value_props', {
    cards: [
      { title: 'Hecho a mano',           body: 'Cada pieza es creada por talleres artesanales reales que mantienen vivas técnicas tradicionales.' },
      { title: 'Origen cultural',        body: 'Los objetos conservan la historia de la región y las comunidades donde fueron creados.' },
      { title: 'Autenticidad registrada', body: 'Cada pieza cuenta con una huella digital que documenta su origen, su taller y su proceso artesanal.' },
    ],
  }),
  empty('fb-home-2', 20, 'embedded_widget', {
    widget: 'categories_grid',
    kicker: 'Explorar por categorías',
  }),
  empty('fb-home-3', 30, 'embedded_widget', {
    widget: 'featured_products',
    title: 'Creaciones Destacadas',
    subtitle: 'Piezas con alma seleccionadas por su maestría técnica.',
    ctaLabel: 'Ver colección completa',
    ctaHref: '/productos',
  }),
  empty('fb-home-4', 40, 'home_block', {
    slot: 'marketplace_diferente',
    kicker: 'Un marketplace diferente',
    title: '',
    body: 'Cocrea conecta a compradores con talleres artesanales reales. Cada pieza tiene origen, autor y proceso documentado.',
    ctaLabel: 'Descubrir cómo funciona Cocrea',
    ctaHref: '/newsletter',
    variant: 'dark',
    imageUrl: '',
  }),
  empty('fb-home-5', 50, 'home_block', {
    slot: 'comercio_justo',
    kicker: '',
    title: 'Comercio justo para quienes crean',
    body: 'Trabajamos directamente con talleres artesanales para asegurar que quienes crean las piezas reciban una compensación justa por su trabajo. Construimos relaciones directas entre quienes crean las piezas y quienes las valoran.',
    ctaLabel: 'Conocer más',
    ctaHref: '/newsletter',
    variant: 'bordered',
    imageUrl: '',
  }),
  empty('fb-home-6', 60, 'embedded_widget', { widget: 'huella_digital' }),
  empty('fb-home-7', 70, 'embedded_widget', { widget: 'featured_shop' }),
  empty('fb-home-8', 80, 'embedded_widget', { widget: 'regalos_con_historia' }),
  empty('fb-home-9', 90, 'embedded_widget', { widget: 'colecciones_overview' }),
  empty('fb-home-10', 100, 'embedded_widget', { widget: 'aliados' }),
];
