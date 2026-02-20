import { forwardRef, Module } from '@nestjs/common';
import { CartItemsController } from './cart-items.controller';
import { CartItemsService } from './cart-items.service';
import { cartItemsProviders } from './cart-items.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [CartItemsController],
  providers: [...cartItemsProviders, CartItemsService],
  exports: [CartItemsService],
})
export class CartItemsModule {}
