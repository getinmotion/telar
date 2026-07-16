import * as mongoose from 'mongoose';
import {
  BlogPostSchema,
  BlogPostDocument,
} from './schemas/blog-post.schema';

/**
 * La conexión a Mongo se obtiene desde ConfigMongoModule (token DATA_SOURCE).
 */
export const blogPostsProviders = [
  {
    provide: 'BLOG_POST_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<BlogPostDocument>('BlogPost', BlogPostSchema, 'blog_posts'),
    inject: ['DATA_SOURCE'],
  },
];
