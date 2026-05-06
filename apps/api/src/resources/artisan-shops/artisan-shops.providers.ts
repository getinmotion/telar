import { DataSource } from 'typeorm';
import { ArtisanShop } from './entities/artisan-shop.entity';
import { Store } from '../stores/entities/store.entity';

export const artisanShopsProviders = [
  {
    provide: 'ARTISAN_SHOPS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STORES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Store),
    inject: ['DATA_SOURCE'],
  },
];
