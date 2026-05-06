import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * CmsPage — un documento por vista pública del marketplace.
 * `pageKey` es el identificador estable ("tecnicas", "sobre-telar", "historias",
 * etc.). El array `sections` se manipula en su totalidad — el reorden, la
 * publicación y la edición son updates atómicos sobre el documento.
 */
export type CmsPageDocument = HydratedDocument<CmsPage>;

@Schema({ collection: 'cms_pages', timestamps: true, minimize: false })
export class CmsPage {
  @Prop({ type: String, required: true, unique: true, index: true })
  pageKey: string;

  // Sections kept as a free-form array; payload shape per type lives in the
  // frontend renderer + admin form. We deliberately do NOT impose a sub-schema
  // so new section types can be prototyped without backend migrations.
  @Prop({ type: Array, default: [] })
  sections: Array<{
    id: string;
    type: string;
    position: number;
    published: boolean;
    payload: Record<string, any>;
  }>;
}

export const CmsPageSchema = SchemaFactory.createForClass(CmsPage);
