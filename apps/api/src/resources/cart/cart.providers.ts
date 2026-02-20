import { DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';

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
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CartItem),
    inject: ['DATA_SOURCE'],
  },
];
