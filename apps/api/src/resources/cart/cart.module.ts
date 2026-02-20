import { forwardRef, Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { cartProviders } from './cart.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { CartItemsModule } from '../cart-items/cart-items.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    ProductsModule,
    forwardRef(() => CartItemsModule),
  ],
  controllers: [CartController],
  providers: [...cartProviders, CartService],
  exports: [CartService],
})
export class CartModule {}
