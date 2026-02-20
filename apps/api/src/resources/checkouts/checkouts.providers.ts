import { DataSource } from 'typeorm';
import { Checkout } from './entities/checkout.entity';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';

export const checkoutsProviders = [
  {
    provide: 'CHECKOUTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Checkout),
    inject: ['DATA_SOURCE'],
  },
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
];
