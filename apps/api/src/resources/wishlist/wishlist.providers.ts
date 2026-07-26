import { DataSource } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { ProductCore } from '../products-new/entities/product-core.entity';

export const wishlistProviders = [
  {
    provide: 'WISHLIST_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Wishlist),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_PROFILES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProfile),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductCore),
    inject: ['DATA_SOURCE'],
  },
];
