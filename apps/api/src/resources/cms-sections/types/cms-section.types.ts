/**
 * Section type catalog. Unknown values are accepted at the controller layer
 * so we can prototype new types from the admin UI without a backend release.
 */
export type CmsSectionType =
  | 'hero'
  | 'hero_split'
  | 'quote'
  | 'two_column_intro'
  | 'technique_grid'
  | 'featured_aside_card'
  | 'metrics_stat'
  | 'muestra_intro'
  | 'archive_label'
  | 'editorial_footer'
  | 'home_value_props'
  | 'home_section_header'
  | 'home_block'
  | 'home_hero_carousel'
  | 'content_pick'
  | 'embedded_widget'
  | 'colecciones_seasonal_grid'
  | 'colecciones_archive_nav_header'
  | string;

export interface CmsSection {
  id: string;
  pageKey: string;
  position: number;
  type: CmsSectionType;
  payload: Record<string, any>;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
