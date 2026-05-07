import { Schema as MongooseSchema, Document } from 'mongoose';

/**
 * CmsPage — un documento por vista pública del marketplace.
 *
 * `pageKey` es el identificador estable ("tecnicas", "sobre-telar", "historias",
 * etc.). El array `sections` se manipula en su totalidad — el reorden, la
 * publicación y la edición son updates atómicos sobre el documento.
 *
 * `sections` se guarda como array libre (Schema.Types.Mixed) para que cada
 * `payload` pueda evolucionar sin migraciones de schema.
 */

export interface CmsPageSection {
  id: string;
  type: string;
  position: number;
  published: boolean;
  payload: Record<string, any>;
}

export const CmsPageSchema = new MongooseSchema(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sections: {
      type: [MongooseSchema.Types.Mixed],
      default: [],
    },
  },
  {
    collection: 'cms_pages',
    timestamps: true,
    minimize: false,
  },
);

export type CmsPageDocument = Document & {
  pageKey: string;
  sections: CmsPageSection[];
  createdAt: Date;
  updatedAt: Date;
};
