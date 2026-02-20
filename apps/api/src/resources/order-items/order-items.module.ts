import { forwardRef, Module } from '@nestjs/common';
import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';
import { orderItemsProviders } from './order-items.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [OrderItemsController],
  providers: [...orderItemsProviders, OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
