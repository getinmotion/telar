import * as mongoose from 'mongoose';
import {
  BlogPostSchema,
  BlogPostDocument,
} from './schemas/blog-post.schema';

/**
 * Reuse the global Mongo connection opened by `cms-sections.providers.ts`
 * (token MONGO_DATA_SOURCE). Just register a new model on it.
 */
export const blogPostsProviders = [
  {
    provide: 'BLOG_POST_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<BlogPostDocument>('BlogPost', BlogPostSchema, 'blog_posts'),
    inject: ['MONGO_DATA_SOURCE'],
  },
];
