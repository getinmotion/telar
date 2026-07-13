import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConfigMongoModule } from '../../config/mongo/configMongo.module';
import { CmsSectionsModule } from '../cms-sections/cms-sections.module';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';
import { blogPostsProviders } from './blog-posts.providers';

@Module({
  imports: [forwardRef(() => AuthModule), ConfigMongoModule, CmsSectionsModule],
  controllers: [BlogPostsController],
  providers: [...blogPostsProviders, BlogPostsService],
  exports: [BlogPostsService],
})
export class BlogPostsModule {}
