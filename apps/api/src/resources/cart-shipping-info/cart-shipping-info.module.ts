import { Module } from '@nestjs/common';
import { CartShippingInfoService } from './cart-shipping-info.service';
import { CartShippingInfoController } from './cart-shipping-info.controller';
import { cartShippingInfoProviders } from './cart-shipping-info.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CartShippingInfoController],
  providers: [...cartShippingInfoProviders, CartShippingInfoService],
  exports: [CartShippingInfoService],
})
export class CartShippingInfoModule {}
