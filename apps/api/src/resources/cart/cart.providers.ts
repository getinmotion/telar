import { DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { CartShippingInfo } from '../cart-shipping-info/entities/cart-shipping-info.entity';
import { PaymentIntent } from '../payment-intents/entities/payment-intent.entity';

export const cartProviders = [
  {
    provide: 'CART_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Cart),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USERS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_SHOPS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CART_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CartItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CART_SHIPPING_INFO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CartShippingInfo),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PAYMENT_INTENT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PaymentIntent),
    inject: ['DATA_SOURCE'],
  },
];
