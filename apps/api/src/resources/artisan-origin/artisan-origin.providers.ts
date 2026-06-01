import { DataSource } from 'typeorm';
import { ArtisanOrigin } from './entities/artisan-origin.entity';

export const artisanOriginProviders = [
  {
    provide: 'ARTISAN_ORIGIN_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanOrigin),
    inject: ['DATA_SOURCE'],
  },
];
