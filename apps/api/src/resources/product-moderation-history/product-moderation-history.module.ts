import { Module } from '@nestjs/common';
import { ProductModerationHistoryService } from './product-moderation-history.service';
import { ProductModerationHistoryController } from './product-moderation-history.controller';
import { productModerationHistoryProviders } from './product-moderation-history.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductModerationHistoryController],
  providers: [
    ...productModerationHistoryProviders,
    ProductModerationHistoryService,
  ],
  exports: [ProductModerationHistoryService],
})
export class ProductModerationHistoryModule {}
