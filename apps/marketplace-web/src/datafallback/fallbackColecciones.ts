/**
 * Fallback editorial for /colecciones — espejo de
 * apps/api/src/resources/cms-sections/seed/colecciones.seed.ts.
 * Se usa cuando la API no responde o Mongo está vacío.
 */
import type { CmsSection } from '@/services/cms-sections.actions';

const sec = (id: string, position: number, type: string, payload: Record<string, any>): CmsSection => ({
  id, pageKey: 'colecciones', position, type, published: true, payload,
  createdAt: '', updatedAt: '',
});

export const FALLBACK_COLECCIONES_SECTIONS: CmsSection[] = [
  sec('fb-col-0', 0, 'home_section_header', {
    slot: 'colecciones_header',
    kicker: 'Curaduría / Colecciones',
    title: 'Mundos tejidos, historias que habitan',
    subtitle: 'Descubre selecciones curadas que exploran la materialidad y el alma de la artesanía colombiana.',
    ctaLabel: 'Explorar todas las piezas',
    ctaHref: '/productos',
    imageUrl: 'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/vajilla_n/VAJILLA%20NEGRA%20-%201.jpg',
    imageAlt: 'Colecciones — La Chamba',
  }),
  sec('fb-col-1', 1, 'home_block', {
    slot: 'colecciones_intro',
    kicker: 'El archivo TELAR',
    title: 'Selecciones que reúnen oficio, territorio y memoria',
    body: 'Cada colección es un recorte editorial: una mirada que conecta piezas, maestros y geografías bajo una sola narrativa.',
    variant: 'light',
  }),
  sec('fb-col-2', 2, 'embedded_widget', { slot: 'colecciones_content_picks', widget: 'content_picks', pageKey: 'colecciones' }),
  sec('fb-col-3', 3, 'embedded_widget', { slot: 'colecciones_cms_grid', widget: 'cms_collections_grid', kicker: 'Colecciones curadas' }),
  sec('fb-col-4', 4, 'quote', {
    slot: 'colecciones_quote',
    body: 'No solo se teje con hilo, se teje con paciencia; no solo se cultiva la tierra, se cultiva la memoria.',
    attribution: 'Manifiesto TELAR',
  }),
  sec('fb-col-5', 5, 'colecciones_archive_nav_header', {
    slot: 'colecciones_archive_nav',
    kicker: 'El Archivo del Saber',
    title: 'Navegar por la esencia',
  }),
  sec('fb-col-6', 6, 'embedded_widget', {
    slot: 'colecciones_archive_cols',
    widget: 'colecciones_archive_columns',
    col1Label: 'Por Colección',
    col2Label: 'Por Territorio',
    col3Label: 'Por Técnica',
    col2CtaLabel: 'Explorar el mapa',
    col2CtaHref: '/territorios',
  }),
  sec('fb-col-7', 7, 'colecciones_seasonal_grid', {
    slot: 'colecciones_seasonal',
    kicker: 'Actualidad',
    title: 'Selecciones de temporada',
    cards: [
      { title: 'Palmas del Atlántico', description: 'Tejeduría en iraca para la mesa contemporánea.', cta: 'Adquirir piezas', href: '/productos' },
      { title: 'Luz de Mompox',        description: 'Plata transformada en encaje eterno.',           cta: 'Ver selección',  href: '/productos' },
      { title: 'Urdimbres del Sur',    description: 'Lanas de oveja teñidas naturalmente.',          cta: 'Explorar piezas', href: '/productos' },
      { title: 'Alquimia de Barro',    description: 'Formas ancestrales que abrazan el fuego.',       cta: 'Adquirir ahora', href: '/productos' },
    ],
  }),
  sec('fb-col-8', 8, 'home_block', {
    slot: 'colecciones_footer',
    kicker: 'El viaje continúa',
    title: 'El saber hacer es un viaje que apenas comienza',
    body: 'Detrás de cada selección hay un territorio, una técnica y un oficio.',
    ctaLabel: 'Descubrir historias',
    ctaHref: '/historias',
    variant: 'dark',
  }),
];
