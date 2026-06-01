import { Module, forwardRef } from '@nestjs/common';
import { FeaturedCollectionsService } from './featured-collections.service';
import { FeaturedCollectionsController } from './featured-collections.controller';
import { featuredCollectionsProviders } from './featured-collections.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [FeaturedCollectionsController],
  providers: [...featuredCollectionsProviders, FeaturedCollectionsService],
  exports: [FeaturedCollectionsService],
})
export class FeaturedCollectionsModule {}
