import { DataSource } from 'typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

export const paymentsProviders = [
  {
    provide: 'CART_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Cart),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CART_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CartItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USERS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Product),
    inject: ['DATA_SOURCE'],
  },
];
