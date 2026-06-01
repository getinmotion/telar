import { DataSource } from 'typeorm';
import { ArtisanMaestro } from './entities/artisan-maestro.entity';

export const artisanMaestrosProviders = [
  {
    provide: 'ARTISAN_MAESTROS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ArtisanMaestro),
    inject: ['DATA_SOURCE'],
  },
];
