import { forwardRef, Module } from '@nestjs/common';
import { PendingGiftCardOrdersController } from './pending-gift-card-orders.controller';
import { PendingGiftCardOrdersService } from './pending-gift-card-orders.service';
import { pendingGiftCardOrdersProviders } from './pending-gift-card-orders.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [PendingGiftCardOrdersController],
  providers: [...pendingGiftCardOrdersProviders, PendingGiftCardOrdersService],
  exports: [PendingGiftCardOrdersService],
})
export class PendingGiftCardOrdersModule {}
