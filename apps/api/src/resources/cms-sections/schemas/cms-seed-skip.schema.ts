import { Schema as MongooseSchema, Document } from 'mongoose';

/**
 * CmsSeedSkip — registra docs que fueron borrados por el curador desde el admin
 * para que el seed runner NO los re-cree en la siguiente corrida.
 *
 * Sin este registro, `cms:seed` reinsertaría cualquier slug que el seed file
 * declare pero la DB ya no tenga (porque el match es solo por existencia).
 *
 * `kind`: 'collection' | 'blog_post' | 'cms_page_section'
 * `key`:  identificador del doc dentro de su tipo:
 *           - collection / blog_post  → slug
 *           - cms_page_section        → `${pageKey}:${type}:${position}`
 */
export interface CmsSeedSkipDoc {
  kind: 'collection' | 'blog_post' | 'cms_page_section';
  key: string;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CmsSeedSkipDocument = CmsSeedSkipDoc & Document;

export const CmsSeedSkipSchema = new MongooseSchema<CmsSeedSkipDocument>(
  {
    kind: {
      type: String,
      required: true,
      enum: ['collection', 'blog_post', 'cms_page_section'],
      index: true,
    },
    key: { type: String, required: true, index: true },
    reason: { type: String, default: null },
  },
  { timestamps: true, collection: 'cms_seed_skips' },
);

CmsSeedSkipSchema.index({ kind: 1, key: 1 }, { unique: true });
