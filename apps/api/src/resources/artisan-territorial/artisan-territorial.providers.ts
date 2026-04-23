import { DataSource } from 'typeorm';
import { ArtisanTerritorial } from './entities/artisan-territorial.entity';

export const artisanTerritorialProviders = [
  {
    provide: 'ARTISAN_TERRITORIAL_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanTerritorial),
    inject: ['DATA_SOURCE'],
  },
];
