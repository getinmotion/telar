/**
 * Shared CMS section types between admin (artisans-web) and public
 * (marketplace-web). Mirrors the NestJS DTOs.
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateCmsSectionInput {
  pageKey: string;
  type: CmsSectionType;
  payload: Record<string, any>;
  position?: number;
  published?: boolean;
}

export interface UpdateCmsSectionInput {
  type?: CmsSectionType;
  payload?: Record<string, any>;
  position?: number;
  published?: boolean;
}
