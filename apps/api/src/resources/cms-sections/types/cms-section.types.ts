/**
 * Section type catalog. Unknown values are accepted at the controller layer
 * so we can prototype new types from the admin UI without a backend release.
 */
export type CmsSectionType =
  | 'hero'
  | 'quote'
  | 'two_column_intro'
  | 'technique_grid'
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
