import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CmsSectionsModule } from '../cms-sections/cms-sections.module';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';
import { blogPostsProviders } from './blog-posts.providers';

/**
 * Importa CmsSectionsModule para reutilizar el provider MONGO_DATA_SOURCE.
 */
@Module({
  imports: [forwardRef(() => AuthModule), CmsSectionsModule],
  controllers: [BlogPostsController],
  providers: [...blogPostsProviders, BlogPostsService],
  exports: [BlogPostsService],
})
export class BlogPostsModule {}
