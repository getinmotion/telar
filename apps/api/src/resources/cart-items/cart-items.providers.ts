import { DataSource } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';

export const cartItemsProviders = [
  {
    provide: 'CART_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CartItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CART_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Cart),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Product),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_SHOPS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
];
