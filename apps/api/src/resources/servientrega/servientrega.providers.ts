import { DataSource } from 'typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

export const servientregaProviders = [
  {
    provide: 'CART_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Cart),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CART_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CartItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Product),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_SHOP_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_PROFILE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProfile),
    inject: ['DATA_SOURCE'],
  },
];
