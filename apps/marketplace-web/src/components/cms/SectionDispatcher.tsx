/**
 * SectionDispatcher — mapea `type` de un CmsSection al componente que lo
 * renderiza. Centraliza la "tabla" de tipos soportados.
 *
 * Tipos soportados:
 *   - Genéricos (CmsSectionRenderer): hero, hero_split, quote, two_column_intro,
 *     technique_grid, featured_aside_card, metrics_stat, muestra_intro,
 *     archive_label, editorial_footer, home_value_props, home_section_header,
 *     home_block, home_hero_carousel
 *   - Específicos por página: territorios_*, about_*, historias_*,
 *     colecciones_seasonal_grid, colecciones_archive_nav_header
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
import {
  CmsCollectionsGridWidget,
  ColeccionesArchiveColumnsWidget,
  ContentPicksWidget,
} from '@/components/colecciones/ColeccionesWidgets';
import { TerritoriosMapBlockWidget } from '@/components/territorios/TerritoriosWidgets';

const WIDGET_REGISTRY: Record<string, React.FC<any>> = {
  // Home
  categories_grid: CategoriesGridWidget,
  featured_products: FeaturedProductsWidget,
  huella_digital: HuellaDigitalWidget,
  featured_shop: FeaturedShopWidget,
  regalos_con_historia: RegalosConHistoriaWidget,
  colecciones_overview: ColeccionesOverviewWidget,
  aliados: AliadosWidget,
  // Colecciones
  cms_collections_grid: CmsCollectionsGridWidget,
  colecciones_archive_columns: ColeccionesArchiveColumnsWidget,
  content_picks: ContentPicksWidget,
  // Territorios
  territorios_map_block: TerritoriosMapBlockWidget,
};

const CMS_RENDERER_TYPES = new Set([
  // Genéricos
  'hero',
  'hero_split',
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
  // Territorios
  'territorios_hero',
  'territorios_dark_quote',
  // Sobre Telar
  'about_hero',
  'about_two_col',
  'about_wide_block',
  'about_cta',
  // Historias
  'historias_hero',
  'historias_story_types_grid',
  'historias_capsule_quote',
  'historias_final_cta',
  // Colecciones
  'colecciones_seasonal_grid',
  'colecciones_archive_nav_header',
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
