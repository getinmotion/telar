import { DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';

export const ordersProviders = [
  {
    provide: 'ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Order),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_SHOPS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
];
