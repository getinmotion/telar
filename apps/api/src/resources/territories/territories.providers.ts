import { DataSource } from 'typeorm';
import { Territory } from './entities/territory.entity';

export const territoriesProviders = [
  {
    provide: 'TERRITORIES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Territory),
    inject: ['DATA_SOURCE'],
  },
];
