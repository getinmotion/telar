import { DataSource } from 'typeorm';
import { CartShippingInfo } from './entities/cart-shipping-info.entity';

export const cartShippingInfoProviders = [
  {
    provide: 'CART_SHIPPING_INFO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CartShippingInfo),
    inject: ['DATA_SOURCE'],
  },
];
