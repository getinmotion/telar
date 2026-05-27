import { Schema as MongooseSchema, Document } from 'mongoose';

/**
 * Territory — ficha editorial de un territorio artesanal (ej. La Guajira,
 * San Jacinto, Cauca). Cada doc es un territorio independiente con su slug,
 * y agrupa tanto los datos de listado (lat/lng/color para el mapa) como la
 * copia editorial de la página de detalle (`/territorio/:slug`).
 *
 * `status: 'draft' | 'published'` — solo published son visibles públicamente.
 * `extraSections` y `keywords` son arrays libres (Mixed) para evolucionar.
 */
export interface TerritoryExtraSection {
  eyebrow: string;
  title: string;
  body: string;
}

export interface TerritoryDoc {
  slug: string;
  name: string;
  department: string;
  region: string;
  subtitle: string;
  description: string;
  longDescription: string;
  culturalTitle: string;
  culturalQuote: string;
  ctaHeadline: string;
  // Listing / map data
  lat: number | null;
  lng: number | null;
  color: string | null;
  markerSize: number | null;
  techniques: string | null; // free-text shortlist for the map tooltip
  // Detail
  featuredProductId: string | null;
  extraSections: TerritoryExtraSection[];
  // Publishing
  status: 'draft' | 'published';
  publishedAt: Date | null;
  keywords: string[];
  // Ordering on the public listing (smaller = earlier).
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TerritoryDocument = TerritoryDoc & Document;

export const TerritorySchema = new MongooseSchema<TerritoryDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    department: { type: String, default: '' },
    region: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    longDescription: { type: String, default: '' },
    culturalTitle: { type: String, default: '' },
    culturalQuote: { type: String, default: '' },
    ctaHeadline: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    color: { type: String, default: null },
    markerSize: { type: Number, default: null },
    techniques: { type: String, default: null },
    featuredProductId: { type: String, default: null },
    extraSections: { type: [MongooseSchema.Types.Mixed], default: [] },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    publishedAt: { type: Date, default: null, index: true },
    keywords: { type: [String], default: [] },
    position: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'territories' },
);
