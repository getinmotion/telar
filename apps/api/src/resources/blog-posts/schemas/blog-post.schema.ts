import { Schema as MongooseSchema, Document } from 'mongoose';

/**
 * BlogPost — entrada de blog editorial (página /historias).
 *
 * Cada doc es una historia independiente con su propio slug. El `body` es
 * Markdown plano (renderizado en el front con react-markdown). `cover` apunta
 * a una URL pública (S3) generada vía /file-upload/image.
 *
 * Status: 'draft' | 'published' — solo published son visibles públicamente.
 */
export interface BlogPostDoc {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  coverAlt: string | null;
  category: string | null;
  authorName: string | null;
  readingTimeMin: number | null;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  keywords: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type BlogPostDocument = BlogPostDoc & Document;

export const BlogPostSchema = new MongooseSchema<BlogPostDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: null },
    body: { type: String, default: '' },
    coverUrl: { type: String, default: null },
    coverAlt: { type: String, default: null },
    category: { type: String, default: null, index: true },
    authorName: { type: String, default: null },
    readingTimeMin: { type: Number, default: null },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null, index: true },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'blog_posts' },
);
