import { Schema as MongooseSchema, Document } from 'mongoose';

/**
 * Collection — colección editorial (página /coleccion/:slug).
 *
 * Cada doc es una colección independiente con su propio slug. El contenido
 * editorial vive en `blocks` (array libre de bloques composables: text, image,
 * gallery, product_grid, manifest, quote). El admin compone el orden libre.
 *
 * `productIds` directos del schema son legacy/atajo — la fuente de verdad
 * para grids son los `product_grid` blocks que tienen su propio array.
 */
export type CollectionLayoutVariant = 'wide' | 'dark' | 'centered';

export interface CollectionBlock {
  type: 'text' | 'image' | 'gallery' | 'product_grid' | 'manifest' | 'quote';
  payload: Record<string, any>;
}

export interface CollectionDoc {
  title: string;
  slug: string;
  excerpt: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  region: string | null;
  layoutVariant: CollectionLayoutVariant;
  blocks: CollectionBlock[];
  status: 'draft' | 'published';
  publishedAt: Date | null;
  keywords: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type CollectionDocument = CollectionDoc & Document;

export const CollectionSchema = new MongooseSchema<CollectionDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: null },
    heroImageUrl: { type: String, default: null },
    heroImageAlt: { type: String, default: null },
    region: { type: String, default: null },
    layoutVariant: {
      type: String,
      enum: ['wide', 'dark', 'centered'],
      default: 'wide',
    },
    blocks: { type: MongooseSchema.Types.Mixed, default: [] },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null, index: true },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'collections' },
);
