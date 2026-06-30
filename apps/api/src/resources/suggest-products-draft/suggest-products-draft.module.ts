import { Module } from '@nestjs/common';
import { SuggestProductsDraftController } from './suggest-products-draft.controller';
import { SuggestProductsDraftService } from './suggest-products-draft.service';
import { suggestProductsDraftProviders } from './suggest-products-draft.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SuggestProductsDraftController],
  providers: [...suggestProductsDraftProviders, SuggestProductsDraftService],
  exports: [SuggestProductsDraftService],
})
export class SuggestProductsDraftModule {}
