import { Module, forwardRef } from '@nestjs/common';
import { ShopModerationHistoryService } from './shop-moderation-history.service';
import { ShopModerationHistoryController } from './shop-moderation-history.controller';
import { shopModerationHistoryProviders } from './shop-moderation-history.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [ShopModerationHistoryController],
  providers: [
    ...shopModerationHistoryProviders,
    ShopModerationHistoryService,
  ],
  exports: [ShopModerationHistoryService],
})
export class ShopModerationHistoryModule {}
