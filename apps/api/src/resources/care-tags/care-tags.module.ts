import { Module } from '@nestjs/common';
import { CareTagsService } from './care-tags.service';
import { CareTagsController } from './care-tags.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { careTagsProviders } from './care-tags.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CareTagsController],
  providers: [...careTagsProviders, CareTagsService],
  exports: [CareTagsService, ...careTagsProviders],
})
export class CareTagsModule {}
