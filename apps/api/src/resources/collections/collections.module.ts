import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CmsSectionsModule } from '../cms-sections/cms-sections.module';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { collectionsProviders } from './collections.providers';

@Module({
  imports: [forwardRef(() => AuthModule), CmsSectionsModule],
  controllers: [CollectionsController],
  providers: [...collectionsProviders, CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
