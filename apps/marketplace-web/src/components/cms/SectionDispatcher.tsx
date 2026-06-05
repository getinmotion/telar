/**
 * SectionDispatcher — mapea `type` de un CmsSection al componente que lo
 * renderiza. Centraliza la "tabla" de tipos soportados.
 *
 * Tipos soportados:
 *   - hero / quote / two_column_intro / technique_grid / featured_aside_card /
 *     metrics_stat / muestra_intro / archive_label / editorial_footer /
 *     home_value_props / home_section_header / home_block / home_hero_carousel
 *     → renderiza con CmsSectionRenderer (existente)
 *   - content_pick      → renderiza un único pick via ContentPickItem
 *   - embedded_widget   → resuelve via widget registry (componentes hardcoded
 *                         como CategoriesGrid, FeaturedProducts, etc.)
 *
 * Tipos desconocidos se ignoran (el front degrada silenciosamente).
 */
import type { CmsSection } from '@/services/cms-sections.actions';
import { CmsSectionRenderer } from './CmsSectionRenderer';
import { ContentPickInline } from './ContentPicks';
import {
  CategoriesGridWidget,
  FeaturedProductsWidget,
  HuellaDigitalWidget,
  FeaturedShopWidget,
  RegalosConHistoriaWidget,
  ColeccionesOverviewWidget,
  AliadosWidget,
} from '@/components/home/widgets/HomeWidgets';

const WIDGET_REGISTRY: Record<string, React.FC<any>> = {
  categories_grid: CategoriesGridWidget,
  featured_products: FeaturedProductsWidget,
  huella_digital: HuellaDigitalWidget,
  featured_shop: FeaturedShopWidget,
  regalos_con_historia: RegalosConHistoriaWidget,
  colecciones_overview: ColeccionesOverviewWidget,
  aliados: AliadosWidget,
};

const CMS_RENDERER_TYPES = new Set([
  'hero',
  'quote',
  'two_column_intro',
  'technique_grid',
  'featured_aside_card',
  'metrics_stat',
  'muestra_intro',
  'archive_label',
  'editorial_footer',
  'home_value_props',
  'home_section_header',
  'home_block',
  'home_hero_carousel',
]);

export function SectionDispatcher({ section }: { section: CmsSection }) {
  if (CMS_RENDERER_TYPES.has(section.type)) {
    return <CmsSectionRenderer section={section} />;
  }

  if (section.type === 'content_pick') {
    return <ContentPickInline pick={section.payload as any} />;
  }

  if (section.type === 'embedded_widget') {
    const widgetName = (section.payload as any)?.widget;
    const Widget = widgetName ? WIDGET_REGISTRY[widgetName] : undefined;
    if (!Widget) {
      if (typeof window !== 'undefined') {
        console.warn(`[SectionDispatcher] widget no encontrado: ${widgetName}`);
      }
      return null;
    }
    return <Widget {...(section.payload as any)} />;
  }

  return null;
}

export default SectionDispatcher;
