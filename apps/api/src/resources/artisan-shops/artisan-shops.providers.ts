import { DataSource } from 'typeorm';
import { ArtisanShop } from './entities/artisan-shop.entity';

export const artisanShopsProviders = [
  {
    provide: 'ARTISAN_SHOPS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
];

