import { DataSource } from 'typeorm';
import { PendingGiftCardOrder } from './entities/pending-gift-card-order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';

export const pendingGiftCardOrdersProviders = [
  {
    provide: 'PENDING_GIFT_CARD_ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PendingGiftCardOrder),
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
];
